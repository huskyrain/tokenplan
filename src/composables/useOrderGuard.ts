// src/composables/useOrderGuard.ts
// 订阅状态机：集中管理所有购买/订阅动作的准入判定
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { PlanType, SubscriptionMode } from '@/types/plan';

/* ------------------------------------------------------------------ */
/* 状态机输出类型                                                       */
/* ------------------------------------------------------------------ */

export type GuardAction = 'allow' | 'block' | 'intercept';

export interface GuardResult {
  action: GuardAction;
  /** block 时的 toast 文案 */
  message?: string;
  /** intercept 时弹出的弹窗类型 */
  interceptType?: 'monthly-blocked-by-annual';
  /** 年包购买时需要展示告知块+复选框（签约线生效中 → 买年包） */
  requireStopRenewalConsent?: boolean;
}

/* ------------------------------------------------------------------ */
/* 文案常量                                                             */
/* ------------------------------------------------------------------ */

// 签约线重复订阅拦截
export const DUPLICATE_SUBSCRIPTION_MSG =
  '连续订阅套餐生效期内不支持变更，可取消自动续费并于到期后重新选购';

// 签约产品跨线不可并存
export const CROSS_LINE_BLOCK_MSG = '签约产品不可并存，当前已有生效中的连续订阅套餐';

// 一次性月包并存拦截
export const MONTHLY_COEXIST_BLOCK_MSG =
  '您已有生效中的套餐，一次性月包不可并存，如需补充额度请购买加油包';

// 签约线生效中点一次性月包
export const MONTHLY_BLOCKED_BY_SUBSCRIPTION_MSG =
  '您已有生效中的套餐，一次性月包不可并存，如需补充额度请购买加油包';

// 一次性月包生效中点签约线
export const SUBSCRIPTION_BLOCKED_BY_MONTHLY_MSG =
  '已有生效中的一次性月包，暂不可签约连续订阅';

// renewalStopped 态拦截签约线
export const RENEWAL_STOPPED_BLOCK_MSG =
  '套餐将于周期末终止，到期后可重新选购';

// 年包排队机制文案
export const ANNUAL_QUEUE_MSG = '已购套餐将在当前套餐到期或Token耗尽后自动生效排队';

// 加油包门槛文案
export const BOOSTER_GATE_MSG = '需先订阅生效中的套餐后方可购买加油包';

// 排队容量=1
export const QUEUE_FULL_MSG_PREFIX = '您已有一个待生效的年包订单';
export const QUEUE_FULL_MSG_SUFFIX = '，暂不支持同时多个排队';

// 有排队年包时拦截签约线
export const RENEWAL_BLOCKED_BY_QUEUE_MSG = '您已有排队中的年包，暂不支持重新开启签约订阅';

// 有排队年包时拦截签约线新购
export const MONTHLY_BLOCKED_BY_QUEUE_MSG = '您已有排队中的年包，暂不支持开通签约订阅';

// 签约线生效中禁购年包
export const ANNUAL_BLOCKED_BY_ACTIVE_SUB_MSG =
  '已有生效中的连续订阅套餐，暂不可购买年包；如需要年包，请先在微信中取消连续扣费，待当前周期结束后再购买';

// 年包生效中拦截签约线的告知文案
export const ANNUAL_CONSENT_NOTICE =
  '购买后，当前连续包月将于本周期末停止自动续费（已付周期服务不受影响），年包将于周期结束后次日无缝接续生效。';

// 一次性月包生效中买年包的同意文案
export const MONTHLY_ANNUAL_CONSENT_TEXT =
  '当前月包无自动续费，年包将于其到期后接续生效';

/* ------------------------------------------------------------------ */
/* 活跃订阅类型                                                         */
/* ------------------------------------------------------------------ */

export type ActiveSubType = 'none' | 'cm' | 'cq' | 'monthly' | 'annual';

/* ------------------------------------------------------------------ */
/* 状态机 composable                                                    */
/* ------------------------------------------------------------------ */

export const useOrderGuard = () => {
  const userStore = useUserStore();

  /** 当前生效单类型 */
  const activeSubscriptionType = computed<ActiveSubType>(() => {
    const sub = userStore.userSubscription;
    if (!sub || sub.status !== 'active') return 'none';
    // 优先用 planType 字段
    if (sub.planType) {
      switch (sub.planType) {
        case PlanType.CONTINUOUS_MONTHLY: return 'cm';
        case PlanType.CONTINUOUS_QUARTERLY: return 'cq';
        case PlanType.MONTHLY_ONETIME: return 'monthly';
        case PlanType.ANNUAL: return 'annual';
      }
    }
    // 降级：通过 subscriptionMode 推断
    if (sub.subscriptionMode === SubscriptionMode.CONTINUOUS_RENEWAL) return 'cm';
    if (sub.subscriptionMode === SubscriptionMode.MANUAL_QUEUE) return 'annual';
    if (sub.subscriptionMode === SubscriptionMode.ONE_TIME) return 'monthly';
    return 'none';
  });

  /** 是否有排队单 */
  const hasQueued = computed(() => userStore.hasQueuedOrder);

  /** 签约线续费已停止 */
  const isRenewalStopped = computed(() => userStore.isRenewalStopped);

  /**
   * 核心状态机：输入目标动作 → 输出准入结果
   *
   * @param targetType  目标动作类型
   * @param targetPlanId  目标套餐 id（用于同档判定）
   */
  const evaluate = (targetType: PlanType, targetPlanId?: string): GuardResult => {
    const active = activeSubscriptionType.value;
    const queued = hasQueued.value;
    const stopped = isRenewalStopped.value;

    // --- 加油包：只要有生效服务单就允许 ---
    if (targetType === PlanType.BOOSTER) {
      if (!userStore.hasActiveServiceOrder) {
        return { action: 'block', message: BOOSTER_GATE_MSG };
      }
      return { action: 'allow' };
    }

    // --- 词元宝：一次性独立商品，对所有已登录用户开放 ---
    if (targetType === PlanType.TOKEN_KEY) {
      return { action: 'allow' };
    }

    // --- 有排队年包时的优先级拦截 ---
    if (queued) {
      if (targetType === PlanType.CONTINUOUS_MONTHLY || targetType === PlanType.CONTINUOUS_QUARTERLY) {
        return { action: 'block', message: MONTHLY_BLOCKED_BY_QUEUE_MSG };
      }
      if (targetType === PlanType.MONTHLY_ONETIME) {
        return { action: 'block', message: MONTHLY_BLOCKED_BY_QUEUE_MSG };
      }
      if (targetType === PlanType.ANNUAL) {
        const q = userStore.queuedOrder;
        const dateStr = q?.expectedStartDate
          ? formatDate(new Date(q.expectedStartDate))
          : '';
        const msg = `${QUEUE_FULL_MSG_PREFIX}（预计 ${dateStr} 生效）${QUEUE_FULL_MSG_SUFFIX}`;
        return { action: 'block', message: msg };
      }
    }

    // --- 签约线 renewalStopped 态（cm/cq 已停止续费但周期内） ---
    if ((active === 'cm' || active === 'cq') && stopped) {
      if (targetType === PlanType.CONTINUOUS_MONTHLY || targetType === PlanType.CONTINUOUS_QUARTERLY) {
        return { action: 'block', message: RENEWAL_STOPPED_BLOCK_MSG };
      }
      if (targetType === PlanType.MONTHLY_ONETIME) {
        return { action: 'block', message: MONTHLY_COEXIST_BLOCK_MSG };
      }
      if (targetType === PlanType.ANNUAL) {
        // 允许排单变体
        return { action: 'allow' };
      }
    }

    // --- 签约线目标（cm / cq） ---
    if (targetType === PlanType.CONTINUOUS_MONTHLY || targetType === PlanType.CONTINUOUS_QUARTERLY) {
      // 无生效单：允许
      if (active === 'none') {
        return { action: 'allow' };
      }
      // cm 生效中
      if (active === 'cm') {
        if (targetType === PlanType.CONTINUOUS_MONTHLY) {
          // 同线：同档/异档均 block
          const currentPlanId = userStore.userSubscription?.planId;
          if (targetPlanId && targetPlanId === currentPlanId) {
            return { action: 'block', message: '您已开通该套餐' };
          }
          return { action: 'block', message: DUPLICATE_SUBSCRIPTION_MSG };
        }
        // 跨线（cm→cq）
        return { action: 'block', message: CROSS_LINE_BLOCK_MSG };
      }
      // cq 生效中
      if (active === 'cq') {
        if (targetType === PlanType.CONTINUOUS_QUARTERLY) {
          const currentPlanId = userStore.userSubscription?.planId;
          if (targetPlanId && targetPlanId === currentPlanId) {
            return { action: 'block', message: '您已开通该套餐' };
          }
          return { action: 'block', message: DUPLICATE_SUBSCRIPTION_MSG };
        }
        // 跨线（cq→cm）
        return { action: 'block', message: CROSS_LINE_BLOCK_MSG };
      }
      // monthly 生效中：block
      if (active === 'monthly') {
        return { action: 'block', message: SUBSCRIPTION_BLOCKED_BY_MONTHLY_MSG };
      }
      // annual 生效中：intercept（情况②）
      if (active === 'annual') {
        return { action: 'intercept', interceptType: 'monthly-blocked-by-annual' };
      }
    }

    // --- 一次性月包目标 ---
    if (targetType === PlanType.MONTHLY_ONETIME) {
      // 无生效单：允许
      if (active === 'none') {
        return { action: 'allow' };
      }
      // 任何基础单生效中：block（toast 引导加油包）
      return { action: 'block', message: MONTHLY_COEXIST_BLOCK_MSG };
    }

    // --- 年包目标 ---
    if (targetType === PlanType.ANNUAL) {
      // 无生效单：允许
      if (active === 'none') {
        return { action: 'allow' };
      }
      // cm/cq 生效中（未停止续费）：禁止购买年包
      if (active === 'cm' || active === 'cq') {
        return { action: 'block', message: ANNUAL_BLOCKED_BY_ACTIVE_SUB_MSG };
      }
      // monthly 生效中：允许排单变体（无自动解约，因一次性月包无续费）
      if (active === 'monthly') {
        return { action: 'allow' };
      }
      // annual 生效中：允许（排单，容量=1）
      if (active === 'annual') {
        return { action: 'allow' };
      }
    }

    // --- 兜底：允许 ---
    return { action: 'allow' };
  };

  /** 签约线是否已订阅 */
  const isSubscribed = computed(() => activeSubscriptionType.value !== 'none');

  /** 年包购买时是否需要展示停止续费告知块 */
  const needsRenewalConsent = computed(() => {
    const result = evaluate(PlanType.ANNUAL);
    return result.action === 'allow' && !!result.requireStopRenewalConsent;
  });

  return {
    evaluate,
    activeSubscriptionType,
    hasQueued,
    isRenewalStopped,
    isSubscribed,
    needsRenewalConsent
  };
};

/* ------------------------------------------------------------------ */
/* 工具函数                                                             */
/* ------------------------------------------------------------------ */

function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
