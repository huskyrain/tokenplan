<!-- src/components/PlanMarketPanel.vue -->
<!-- 商品页签面板（核心复用单元）：双组二级页签 / 套餐卡 / 词元宝 / 加油包入口 / 全部购买弹窗接线 -->
<!-- 主页 PlanSelectionSection 与订阅管理页标准版空态内嵌共用，购买 handler 单一来源避免逻辑复制 -->
<template>
  <div class="plan-market" :class="{ embedded }">
    <!-- 二级页签：双组（签约线 | 分隔线 | 买断线） -->
    <div class="lv2-tabs">
      <!-- 左组：签约线 -->
      <button class="lv2-tab" :class="{ active: tab === 'cm' }" @click="changeTab('cm')">
        连续包月
      </button>
      <button class="lv2-tab" :class="{ active: tab === 'cq' }" @click="changeTab('cq')">
        连续包季
      </button>
      <!-- 竖直分隔线 -->
      <span class="lv2-divider"></span>
      <!-- 右组：买断线 -->
      <button class="lv2-tab" :class="{ active: tab === 'monthly' }" @click="changeTab('monthly')">
        月包
      </button>
      <button class="lv2-tab" :class="{ active: tab === 'annual' }" @click="changeTab('annual')">
        年包 <sup class="lv2-badge">更优惠</sup>
      </button>
      <button class="lv2-tab" :class="{ active: tab === 'cyb' }" @click="changeTab('cyb')">
        词元宝
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="plan-loading">
      <span class="loading-spinner"></span>
    </div>

    <!-- 套餐卡网格（cm/cq/monthly/annual） -->
    <div v-else-if="tab !== 'cyb'" class="plan-grid">
      <PlanCard
        v-for="plan in currentPlans"
        :key="plan.id"
        :plan="plan"
        :recommended="plan.recommended"
        :subscribed="isSubscribedPlan(plan)"
        :blocked="isBlockedPlan(plan)"
        :blocked-title="getBlockedTitle(plan)"
        @purchase="handlePurchase"
        @blocked="handleBlocked"
      />
    </div>

    <!-- 词元宝页签 -->
    <div v-else-if="tokenKeyProduct" class="cyb-wrap">
      <div class="cyb-card">
        <div class="cyb-left">
          <h3 class="cyb-title">{{ tokenKeyProduct.title }}</h3>
          <p class="cyb-subtitle">{{ tokenKeyProduct.subtitle }}</p>
          <div class="cyb-price">
            <span class="cyb-symbol">¥</span>
            <span class="cyb-value">{{ tokenKeyProduct.price / 100 }}</span>
          </div>
          <ul class="cyb-benefits">
            <li v-for="(b, i) in tokenKeyProduct.benefits" :key="i">
              <svg class="cyb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ b }}</span>
            </li>
          </ul>
          <div class="cyb-models">
            <span v-for="m in tokenKeyProduct.models" :key="m" class="cyb-model">{{ m }}</span>
          </div>
          <p class="cyb-hint">{{ tokenKeyProduct.hint }}</p>
          <button class="cyb-buy-btn" @click="handleTokenKeyPurchase">立即购买</button>
        </div>

        <!-- 右侧 5 特性 -->
        <div class="cyb-right">
          <div v-for="f in tokenKeyFeatures" :key="f.title" class="cyb-feature">
            <div class="cyb-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="f.icon" />
              </svg>
            </div>
            <div>
              <h4 class="cyb-feature-title">{{ f.title }}</h4>
              <p class="cyb-feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加油包售卖入口（④ 无生效服务单时整条不渲染：主页与订阅管理内嵌面板同步 gate） -->
    <div v-if="tab !== 'cyb' && showBoosterEntry" class="booster-banner" :class="{ 'no-order': !canBuyBooster }">
      <div class="booster-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" />
        </svg>
      </div>
      <div class="booster-text">
        <div class="booster-title">加油包</div>
        <div class="booster-desc">额度不够用？为生效中的服务单补充 Token，随服务单有效期同步失效</div>
      </div>
      <button
        class="booster-btn"
        :class="{ disabled: !canBuyBooster }"
        :title="canBuyBooster ? '' : boosterGateTitle"
        @click="handleBuyBooster"
      >
        购买加油包
      </button>
    </div>

    <!-- 签约线订阅弹窗（cm/cq） -->
    <SubscribeModal v-model:visible="subModalVisible" :plan="selectedSubPlan" @success="onSubscribed" />

    <!-- 年包 / 词元宝 / 一次性月包通用购买弹窗 -->
    <PurchaseModal v-model:visible="purchaseModalVisible" :order="purchasePayload" @success="onPurchased" />

    <!-- 加油包购买弹窗 -->
    <BoosterModal v-model:visible="boosterModalVisible" @success="onBoosterBought" />

    <!-- 年包生效中点击签约线的拦截弹窗（情况②） -->
    <MonthlyInterceptModal v-model:visible="monthlyInterceptVisible" :product-name="interceptProductName" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlanStore } from '@/stores/planStore';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import { PlanType, Plan, TokenKeyProduct, type PlanTabKey } from '@/types/plan';
import { getTokenKeyProduct } from '@/api/subscription';
import { createOrder } from '@/api/order';
import { useOrderGuard, BOOSTER_GATE_MSG, RENEWAL_BLOCKED_BY_QUEUE_MSG, DUPLICATE_SUBSCRIPTION_MSG, CROSS_LINE_BLOCK_MSG } from '@/composables/useOrderGuard';
import { TOKEN_KEY_FEATURES as tokenKeyFeatures } from '@/constants/tokenKey';
import PlanCard from '@/components/PlanCard.vue';
import SubscribeModal from '@/components/SubscribeModal.vue';
import PurchaseModal, { PurchasePayload } from '@/components/PurchaseModal.vue';
import BoosterModal from '@/components/BoosterModal.vue';
import MonthlyInterceptModal from '@/components/MonthlyInterceptModal.vue';

/* ---------------- 页签映射 ---------------- */
const TAB_TO_PLAN: Record<PlanTabKey, PlanType> = {
  cm: PlanType.CONTINUOUS_MONTHLY,
  cq: PlanType.CONTINUOUS_QUARTERLY,
  monthly: PlanType.MONTHLY_ONETIME,
  annual: PlanType.ANNUAL,
  cyb: PlanType.TOKEN_KEY
};

const props = defineProps<{
  /** 当前二级页签（由父级持有，便于主页 URL 同步） */
  tab: PlanTabKey;
  /** 内嵌态（订阅管理页空态）：紧凑布局 */
  embedded?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:tab', key: PlanTabKey): void;
}>();

const planStore = usePlanStore();
const userStore = useUserStore();
const toastStore = useToastStore();
const orderGuard = useOrderGuard();

/* ---------------- 状态 ---------------- */
const tokenKeyProduct = ref<TokenKeyProduct | null>(null);

// 弹窗状态
const subModalVisible = ref(false);
const selectedSubPlan = ref<Plan | null>(null);
const purchaseModalVisible = ref(false);
const purchasePayload = ref<PurchasePayload | null>(null);
const boosterModalVisible = ref(false);
const monthlyInterceptVisible = ref(false);

/** 拦截弹窗产品名称：根据当前页签适配连续包月/连续包季 */
const interceptProductName = computed(() => props.tab === 'cq' ? '连续包季' : '连续包月');

const loading = computed(() => planStore.loading);
const currentPlans = computed(() => planStore.getCurrentPlans);

/* ---------------- 卡片按钮态派生 ---------------- */

/** 当前生效订阅的 planId */
const activePlanId = computed<string | null>(() =>
  userStore.userSubscription?.status === 'active' ? userStore.userSubscription?.planId ?? null : null
);

/** 当前卡片是否为生效中的同档（呈现"已订阅"禁用态） */
const isSubscribedPlan = (plan: Plan): boolean => {
  if (!activePlanId.value) return false;
  // 仅同页签同档时为"已订阅"
  return plan.id === activePlanId.value && plan.planType === TAB_TO_PLAN[props.tab];
};

/** 当前卡片是否应被阻止（灰禁用"立即订阅"） */
const isBlockedPlan = (plan: Plan): boolean => {
  const active = orderGuard.activeSubscriptionType.value;
  if (active === 'none') return false;

  // 如果当前卡片就是已订阅的同档，由 isSubscribedPlan 处理
  if (plan.id === activePlanId.value) return false;

  // 签约线任一线（cm/cq）生效中：cm 与 cq 页签下所有非当前生效档均禁用
  // （同线异档 + 跨线档统一 blocked，点击才 guard toast 的旧口径废弃）
  if ((props.tab === 'cm' || props.tab === 'cq') && (active === 'cm' || active === 'cq')) return true;

  // monthly页签 + monthly生效 → 同线异档禁用
  if (props.tab === 'monthly' && active === 'monthly') return true;

  // 其余场景（买断线跨线等）：按钮可点，由 handlePurchase 内 guard 弹 toast/intercept
  return false;
};

/** blocked 状态的 tooltip（与 guard 同口径文案） */
const getBlockedTitle = (plan: Plan): string => {
  const active = orderGuard.activeSubscriptionType.value;
  if (props.tab === 'cm' || props.tab === 'cq') {
    // 签约线生效中：同线异档 → 不可变更文案；跨线档 → 不可并存文案
    const sameLine = (active === 'cm' && plan.planType === PlanType.CONTINUOUS_MONTHLY)
      || (active === 'cq' && plan.planType === PlanType.CONTINUOUS_QUARTERLY);
    return sameLine ? DUPLICATE_SUBSCRIPTION_MSG : CROSS_LINE_BLOCK_MSG;
  }
  if (props.tab === 'monthly') {
    return '一次性套餐生效期内不可再购同线套餐';
  }
  return '';
};

/* 加油包门槛 */
const canBuyBooster = computed(() => userStore.isLoggedIn && userStore.hasActiveServiceOrder);
/** ④ 加油包入口 gate：仅当存在生效中服务单（hasActiveServiceOrder，源自 activeOrders）时渲染 banner */
const showBoosterEntry = computed(() => userStore.hasActiveServiceOrder);
const boosterGateTitle = computed(() =>
  userStore.isLoggedIn ? BOOSTER_GATE_MSG : '请先登录，且需先订阅生效中的套餐后方可购买加油包'
);

/* ---------------- 页签切换 / 数据加载 ---------------- */
const changeTab = (key: PlanTabKey) => {
  if (props.tab === key) return;
  emit('update:tab', key);
};

const loadTab = async () => {
  const planType = TAB_TO_PLAN[props.tab];
  planStore.setCurrentPlanType(planType);
  await planStore.fetchPlans(planType);
  if (planType === PlanType.TOKEN_KEY && !tokenKeyProduct.value) {
    tokenKeyProduct.value = await getTokenKeyProduct();
  }
};

watch(() => props.tab, () => { void loadTab(); }, { immediate: true });

/* ---------------- 日期文案工具 ---------------- */
const fmtDate = (d: Date) => `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
const fmtShort = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
const DAY = 24 * 60 * 60 * 1000;

/* ---------------- 购买流程 ---------------- */
const handlePurchase = (plan: Plan) => {
  if (!userStore.isLoggedIn) {
    toastStore.push('请先点击右上角「登录」按钮模拟登录后再购买', 'info');
    return;
  }

  const guardResult = orderGuard.evaluate(plan.planType, plan.id);

  // 拦截：toast 提示
  if (guardResult.action === 'block') {
    toastStore.push(guardResult.message || '当前操作不可用', 'error', 3600);
    return;
  }

  // 拦截：弹窗（年包生效中点签约线 → 情况②）
  if (guardResult.action === 'intercept') {
    if (guardResult.interceptType === 'monthly-blocked-by-annual') {
      monthlyInterceptVisible.value = true;
    }
    return;
  }

  // 允许：分流到对应弹窗
  if (plan.planType === PlanType.CONTINUOUS_MONTHLY || plan.planType === PlanType.CONTINUOUS_QUARTERLY) {
    // 有排队年包时拦截重新开启续订
    if (userStore.hasQueuedOrder && userStore.isRenewalStopped) {
      toastStore.push(RENEWAL_BLOCKED_BY_QUEUE_MSG, 'error', 3600);
      return;
    }
    selectedSubPlan.value = plan;
    subModalVisible.value = true;
    return;
  }

  if (plan.planType === PlanType.MONTHLY_ONETIME) {
    // 一次性月包走 PurchaseModal（普通支付）
    const start = new Date();
    const end = new Date(Date.now() + 30 * DAY);
    purchasePayload.value = {
      name: `${plan.name} · 月包`,
      tokenLabel: plan.tokenLabel,
      price: plan.price,
      unit: '月',
      cycleLabel: '月包（30 天）',
      successLines: [
        `购买当日（${fmtShort(start)}）即可使用。`,
        `有效期为 <b>${fmtDate(start)} 00:00</b> 至 <b>${fmtDate(end)} 23:59:59</b>，共 30 个自然日。`
      ],
      submit: async (userId) => {
        const order = await createOrder(plan.id, userId, {
          displayName: `${plan.name} · 月包`,
          queueable: false
        });
        return { queued: order.status === 'queue' };
      }
    };
    purchaseModalVisible.value = true;
    return;
  }

  if (plan.planType === PlanType.ANNUAL) {
    const needConsent = !!guardResult.requireStopRenewalConsent;
    const start = new Date(Date.now() + DAY);
    const end = new Date(Date.now() + 365 * DAY);
    purchasePayload.value = {
      name: `${plan.name} · 年包`,
      tokenLabel: plan.tokenLabel,
      price: plan.price,
      unit: '年',
      cycleLabel: '年包（365 天）',
      queueNote: '若您已有生效中的套餐，已购套餐将在当前套餐到期或Token耗尽后自动生效排队',
      successLines: [
        `购买当日（${fmtShort(new Date())}）即可使用。`,
        `正式有效期为 <b>${fmtDate(start)} 00:00</b> 至 <b>${fmtDate(end)} 23:59:59</b>，共 365 个自然日。`
      ],
      requireStopRenewalConsent: needConsent,
      submit: async (userId) => {
        const order = await createOrder(plan.id, userId, {
          displayName: `${plan.name} · 年包`,
          queueable: true,
          autoStopRenewal: needConsent
        });
        return { queued: order.status === 'queue' };
      }
    };
    purchaseModalVisible.value = true;
  }
};

// 已订阅/已阻止状态下点击卡片按钮
const handleBlocked = (plan?: Plan) => {
  if (!plan) return;
  const guardResult = orderGuard.evaluate(plan.planType, plan.id);
  if (guardResult.action === 'intercept' && guardResult.interceptType === 'monthly-blocked-by-annual') {
    monthlyInterceptVisible.value = true;
  } else {
    toastStore.push(guardResult.message || '当前操作不可用', 'error', 3600);
  }
};

// 词元宝标准版购买
const handleTokenKeyPurchase = async () => {
  if (!userStore.isLoggedIn) {
    toastStore.push('请先点击右上角「登录」按钮模拟登录后再购买', 'info');
    return;
  }
  if (!tokenKeyProduct.value) {
    tokenKeyProduct.value = await getTokenKeyProduct();
  }
  if (!tokenKeyProduct.value) return;
  const guardResult = orderGuard.evaluate(PlanType.TOKEN_KEY);
  if (guardResult.action === 'block') {
    toastStore.push(guardResult.message || '当前操作不可用', 'error', 3600);
    return;
  }
  purchasePayload.value = {
    name: `${tokenKeyProduct.value.title} · 词元宝`,
    nameLabel: '产品名称',
    tokenLabel: '1 亿 Token',
    price: tokenKeyProduct.value.price,
    unit: '',
    cycleLabel: '实体硬件 · 收货后激活',
    successLines: [
      '含安全硬件 · 需物流配送 · 收货后权益激活。',
      '收货后权益激活，含 <b>1 亿 Token</b> 权益，有效期激活后 <b>30 天</b>。'
    ],
    submit: async (userId) => {
      const order = await createOrder(tokenKeyProduct.value!.id, userId, {
        displayName: `${tokenKeyProduct.value!.title} · 词元宝`,
        queueable: false
      });
      return { queued: order.status === 'queue' };
    }
  };
  purchaseModalVisible.value = true;
};

// 加油包入口
const handleBuyBooster = () => {
  if (!userStore.isLoggedIn) {
    toastStore.push('请先点击右上角「登录」按钮模拟登录后再购买', 'info');
    return;
  }
  if (!userStore.hasActiveServiceOrder) {
    toastStore.push(BOOSTER_GATE_MSG, 'error', 3200);
    return;
  }
  boosterModalVisible.value = true;
};

/* ---------------- 弹窗成功回调 ---------------- */
const onSubscribed = () => { /* 状态由 userStore 驱动 */ };
const onPurchased = () => { /* 状态已在弹窗内刷新 */ };
const onBoosterBought = () => { /* 成功信息在弹窗内展示 */ };

defineExpose({ handleTokenKeyPurchase });
</script>

<style scoped>
/* 二级页签：双组 + 分隔线 */
.lv2-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
}

.lv2-divider {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #d9d9d9;
  margin: 0 2px;
}

.lv2-tab {
  position: relative;
  height: 42px;
  padding: 0 26px;
  border: 1px solid var(--card-border);
  border-radius: 100px;
  background: #fff;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.lv2-tab:hover {
  border-color: var(--brand-red);
  color: var(--brand-red);
}

.lv2-tab.active {
  background: var(--brand-red);
  border-color: var(--brand-red);
  color: #fff;
  font-weight: 500;
}

/* 年包"更优惠"红色角标 */
.lv2-badge {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 5px;
  margin-left: 4px;
  border-radius: 100px;
  background: rgba(255, 65, 65, 0.1);
  color: var(--brand-red);
  font-size: 10px;
  font-weight: 600;
  vertical-align: super;
  line-height: 1;
}

.lv2-tab.active .lv2-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 卡片网格 */
.plan-grid {
  display: grid;
  grid-template-columns: repeat(4, 288px);
  gap: 16px;
  justify-content: center;
}

.plan-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
  border-top-color: var(--brand-red);
  animation: spin 0.8s linear infinite;
}

/* ---------------- 词元宝单产品卡 ---------------- */
.cyb-card {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 48px;
  width: 100%;
  box-sizing: border-box;
  padding: 44px 48px;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  animation: fade-up 0.4s ease both;
}

.cyb-title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: var(--text-title);
}

.cyb-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--text-link);
}

.cyb-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin: 20px 0 22px;
  color: var(--text-title);
}

.cyb-symbol {
  font-size: 20px;
  font-weight: 600;
}

.cyb-value {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
}

.cyb-benefits {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cyb-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-link);
}

.cyb-check {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 3px;
  color: var(--brand-red);
}

.cyb-models {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.cyb-model {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 100px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-title);
}

.cyb-hint {
  margin: 0 0 20px;
  font-size: 12.5px;
  color: var(--text-secondary);
}

.cyb-buy-btn {
  width: 180px;
  height: 52px;
  border: none;
  border-radius: 8px;
  background: var(--btn-black);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.cyb-buy-btn:hover {
  opacity: 0.88;
}

.cyb-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-left: 40px;
  border-left: 1px solid #f0f0f0;
}

.cyb-feature {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 10px;
  border-radius: 12px;
  transition: background 0.2s;
}

.cyb-feature:hover {
  background: #fafafa;
}

.cyb-feature-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 65, 65, 0.08), rgba(255, 94, 15, 0.08));
}

.cyb-feature-icon svg {
  width: 19px;
  height: 19px;
  color: var(--brand-red);
}

.cyb-feature-title {
  margin: 0 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-title);
}

.cyb-feature-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-link);
}

/* ---------------- 加油包推广条 ---------------- */
.booster-banner { display: flex; align-items: center; gap: 18px; margin-top: 28px; padding: 22px 28px; background: #fff; border: 1px solid var(--card-border); border-radius: 16px; transition: box-shadow 0.25s; }
.booster-banner:hover { box-shadow: 0 8px 24px rgba(255, 65, 65, 0.08); }
.booster-banner.no-order { background: #fafafa; }
.booster-icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, rgba(255, 65, 65, 0.1), rgba(255, 94, 15, 0.12)); }
.booster-icon svg { width: 22px; height: 22px; color: var(--brand-red); }
.booster-text { flex: 1; min-width: 0; }
.booster-title { font-size: 16px; font-weight: 600; color: var(--text-title); }
.booster-desc { margin-top: 4px; font-size: 13px; color: var(--text-link); }
.booster-btn { flex-shrink: 0; height: 40px; padding: 0 24px; border: none; border-radius: 8px; background: var(--brand-red); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
.booster-btn:hover { opacity: 0.88; }
.booster-btn.disabled { background: #d8d8d8; cursor: not-allowed; }

/* ---------------- 内嵌态（订阅管理页空态）紧凑布局 ---------------- */
.plan-market.embedded .lv2-tabs {
  margin-bottom: 24px;
}

.plan-market.embedded .plan-grid {
  /* ④ 内嵌态单行 4 个（与主页同 repeat(4, 1fr)），卡宽自适应容器 */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  justify-content: stretch;
  gap: 12px;
}

.plan-market.embedded .plan-grid :deep(.plan-card) {
  width: 100%;
  min-width: 0;
}

/* 内嵌态按钮溢出修复：.plan-btn 固定 236px 按 288px 卡口径设计，内嵌态卡宽自适应收缩后
   超出卡内容盒（卡宽 − 左右各 24px padding − 2px 边框），故收敛为内容盒 100%；
   黑态/红态(推荐)/置灰态均继承 .plan-btn，一处收敛全部不溢出；仅 embedded 生效，主页不受影响 */
.plan-market.embedded .plan-grid :deep(.plan-btn) {
  width: 100%;
}

/* 词元宝卡宽度自适应容器 */
.plan-market.embedded .cyb-card {
  grid-template-columns: 1fr;
  width: 100%;
  padding: 32px 32px;
}

.plan-market.embedded .cyb-right {
  padding-left: 0;
  border-left: none;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.plan-market.embedded .booster-banner {
  margin-top: 20px;
}

@media (max-width: 1280px) {
  .plan-grid { grid-template-columns: repeat(2, 288px); }
  .cyb-card { grid-template-columns: 1fr; }
  .cyb-right { padding-left: 0; border-left: none; border-top: 1px solid #f0f0f0; padding-top: 24px; }
}
</style>
