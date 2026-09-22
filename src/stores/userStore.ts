// src/stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getUserSubscription,
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  resumeRenewal as resumeRenewalApi
} from '@/api/subscription';
import { getActiveServiceOrders, getQueuedOrder, getExpiryReminder } from '@/api/order';
import { Subscription, MockUserInfo, UserScenario, QueuedOrder, ExpiryReminder, PlanType } from '@/types/plan';
import { Order } from '@/types/order';

const SCENARIO_CYCLE: UserScenario[] = ['no-subscription', 'monthly-subscribed', 'quarterly-subscribed', 'onetime-monthly-subscribed', 'annual-subscribed', 'expired-monthly-subscribed', 'team-subscribed'];
const SCENARIO_LABELS: Record<UserScenario, string> = {
  'no-subscription': '无订阅用户',
  'monthly-subscribed': '连续包月订阅用户',
  'quarterly-subscribed': '连续包季订阅用户',
  'onetime-monthly-subscribed': '一次性月包用户',
  'annual-subscribed': '年包订阅用户',
  'expired-monthly-subscribed': '连续包月已过期用户',
  'team-subscribed': '团队版订阅用户'
};

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<MockUserInfo | null>(null);
  const userSubscription = ref<Subscription | null>(null);
  const activeOrders = ref<Order[]>([]);
  const queuedOrder = ref<QueuedOrder | null>(null);
  const expiryReminder = ref<ExpiryReminder | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /* ---------- 登录 / 场景切换 ---------- */

  const login = async (scenario: UserScenario) => {
    loading.value = true;
    try {
      userInfo.value = await loginApi(scenario);
      await refreshUserState();
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  // 场景循环切换
  const switchScenario = async () => {
    if (!userInfo.value) return;
    const currentIdx = SCENARIO_CYCLE.indexOf(userInfo.value.scenario);
    const nextIdx = (currentIdx + 1) % SCENARIO_CYCLE.length;
    await login(SCENARIO_CYCLE[nextIdx]);
  };

  const nextScenarioLabel = computed(() => {
    if (!userInfo.value) return SCENARIO_LABELS['no-subscription'];
    const currentIdx = SCENARIO_CYCLE.indexOf(userInfo.value.scenario);
    const nextIdx = (currentIdx + 1) % SCENARIO_CYCLE.length;
    return SCENARIO_LABELS[SCENARIO_CYCLE[nextIdx]];
  });

  const logout = async () => {
    await logoutApi();
    userInfo.value = null;
    userSubscription.value = null;
    activeOrders.value = [];
    queuedOrder.value = null;
    expiryReminder.value = null;
  };

  // 刷新订阅、生效服务单、排队单、预约状态
  const refreshUserState = async () => {
    if (!userInfo.value?.id) {
      userSubscription.value = null;
      activeOrders.value = [];
      queuedOrder.value = null;
      expiryReminder.value = null;
      return;
    }
    try {
      const [sub, orders, queued, reminder] = await Promise.all([
        getUserSubscription(userInfo.value.id),
        getActiveServiceOrders(userInfo.value.id),
        getQueuedOrder(userInfo.value.id),
        getExpiryReminder(userInfo.value.id)
      ]);
      userSubscription.value = sub ? { ...sub } : null;
      activeOrders.value = orders;
      queuedOrder.value = queued;
      expiryReminder.value = reminder;
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  /* ---------- 兼容旧接口 ---------- */

  const setUserInfo = (info: MockUserInfo | null) => {
    userInfo.value = info;
  };

  const fetchUserSubscription = async (userId: string) => {
    loading.value = true;
    try {
      const sub = await getUserSubscription(userId);
      userSubscription.value = sub ? { ...sub } : null;
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const updateUserSubscription = (subscription: Subscription | null) => {
    userSubscription.value = subscription;
  };

  // 恢复登录态（刷新页面时）
  const restoreUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      userInfo.value = user;
      await refreshUserState();
    }
  };

  /* ---------- 计算属性 ---------- */

  const isLoggedIn = computed(() => !!userInfo.value);

  // 签约线（cm/cq）生效中
  const hasContinuousSubscription = computed(() => {
    const sub = userSubscription.value;
    return !!(
      sub &&
      sub.status === 'active' &&
      sub.subscriptionMode === 'continuous'
    );
  });

  // 连续包月生效中
  const hasContinuousMonthlySubscription = computed(() => {
    const sub = userSubscription.value;
    return !!(
      sub &&
      sub.status === 'active' &&
      sub.planType === PlanType.CONTINUOUS_MONTHLY
    );
  });

  // 连续包季生效中
  const hasContinuousQuarterlySubscription = computed(() => {
    const sub = userSubscription.value;
    return !!(
      sub &&
      sub.status === 'active' &&
      sub.planType === PlanType.CONTINUOUS_QUARTERLY
    );
  });

  // 一次性月包生效中
  const hasMonthlyOnetimeSubscription = computed(() => {
    const sub = userSubscription.value;
    return !!(
      sub &&
      sub.status === 'active' &&
      sub.planType === PlanType.MONTHLY_ONETIME
    );
  });

  const hasAnnualSubscription = computed(() => {
    const sub = userSubscription.value;
    return !!(
      sub &&
      sub.status === 'active' &&
      (sub.planType === PlanType.ANNUAL || sub.subscriptionMode === 'manual_queue')
    );
  });

  // 功能点⑤：是否有生效中的服务单（加油包门槛）
  const hasActiveServiceOrder = computed(() => activeOrders.value.length > 0);

  // 是否有排队中的待生效基础单
  const hasQueuedOrder = computed(() => !!queuedOrder.value);

  // 签约线续费已停止
  const isRenewalStopped = computed(() => !!userSubscription.value?.renewalStopped);

  // 订阅已过期（存在订阅且非生效态，概览卡呈现过期徽章+续订入口）
  // 时间口径加固：status 仍为 active 但 endDate 已过时同样视为已过期
  const isExpiredSub = computed(() => {
    const sub = userSubscription.value;
    if (!sub) return false;
    if (sub.status !== 'active') return true;
    if (!sub.endDate) return false;
    const end = new Date(sub.endDate).getTime();
    return Number.isFinite(end) && end <= Date.now();
  });

  /** 恢复自动续费 */
  const resumeRenewal = async () => {
    if (!userInfo.value?.id) return;
    await resumeRenewalApi(userInfo.value.id);
    const sub = await getUserSubscription(userInfo.value.id);
    userSubscription.value = sub ? { ...sub } : null;
  };

  return {
    userInfo: computed(() => userInfo.value),
    userSubscription: computed(() => userSubscription.value),
    activeOrders: computed(() => activeOrders.value),
    queuedOrder: computed(() => queuedOrder.value),
    expiryReminder: computed(() => expiryReminder.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isLoggedIn,
    hasContinuousSubscription,
    hasContinuousMonthlySubscription,
    hasContinuousQuarterlySubscription,
    hasMonthlyOnetimeSubscription,
    hasAnnualSubscription,
    hasActiveServiceOrder,
    hasQueuedOrder,
    isRenewalStopped,
    isExpiredSub,
    nextScenarioLabel,
    login,
    switchScenario,
    logout,
    refreshUserState,
    restoreUser,
    setUserInfo,
    fetchUserSubscription,
    updateUserSubscription,
    resumeRenewal
  };
});
