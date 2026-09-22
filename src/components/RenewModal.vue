<!-- src/components/RenewModal.vue -->
<!-- 过期态续订弹窗（3步：续订确认 → 支付二维码 → 支付成功） -->
<!-- 步骤1按设计基准：顶部套餐名称标题 + 当前套餐灰底三列块 + 续订套餐小节（tab右置黑底选中/4档卡横排/当前档红框+黑徽章） -->
<!-- + 续订套餐详情灰底四列 + ⓘ说明行 + footer（协议勾选横栏 → 应付金额红大字 + 取消/确认续订行） -->
<!-- ② 必勾协议置于弹窗底部（footer 内按钮行上方的浅灰横栏），未勾选点确认续订就地红提示拦截 -->
<!-- cm/cq 走连续模式支付二维码（仅微信、无遮罩）+ createSubscription；月包/年包走 normal 二维码 + createOrder -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-mask" @click.self="close">
        <div class="modal-dialog" :class="{ 'dialog-renew': step === 1, 'dialog-pay': step === 2 }">
          <!-- 关闭按钮（支付二维码页由面板自带×） -->
          <button v-if="step !== 2" class="modal-close" @click="close">×</button>

          <!-- 步骤1：续订确认 -->
          <div v-if="step === 1" class="modal-body renew-step">
            <!-- 顶部：套餐名称标题区 -->
            <h3 class="renew-title">{{ curSub?.planName || '套餐续订' }}</h3>

            <!-- 当前套餐小节 -->
            <p class="sec-label">当前套餐</p>
            <div class="gray-block">
              <div class="gb-col">
                <span class="gb-label">套餐详情</span>
                <span class="gb-value gb-plan-detail">
                  <span class="gb-plan-name">{{ curSub?.planName || '-' }}</span>
                  <span class="chip-black">已过期</span>
                </span>
              </div>
              <div class="gb-col">
                <span class="gb-label">套餐额度</span>
                <span class="gb-value">{{ curTokenLabel }}</span>
              </div>
              <div class="gb-col">
                <span class="gb-label">生效/失效日期</span>
                <span class="gb-value">{{ fmtDate(curSub?.startDate) }} 至 {{ fmtDate(curSub?.endDate) }}</span>
              </div>
            </div>

            <!-- 续订套餐小节：标题 + 右置 tab 组（黑底选中态） -->
            <div class="sec-row">
              <p class="sec-label">续订套餐 <span class="sec-note">(可选择更换套餐)</span></p>
              <div class="renew-tabs" role="tablist">
                <button
                  v-for="t in TABS"
                  :key="t.key"
                  class="renew-tab"
                  :class="{ on: tab === t.key }"
                  role="tab"
                  :aria-selected="tab === t.key"
                  @click="tab = t.key"
                >{{ t.label }}</button>
              </div>
            </div>

            <!-- 4 档套餐卡横排：当前过期套餐同档加红框 + 「当前套餐」黑底徽章 -->
            <div class="plan-grid">
              <div
                v-for="p in currentPlans"
                :key="p.id"
                class="plan-card"
                :class="{ selected: p.id === selectedId, recommended: p.recommended, 'is-current': isCurrentPlan(p) }"
                role="radio"
                :aria-checked="p.id === selectedId"
                tabindex="0"
                @click="selectedId = p.id"
                @keydown.enter.prevent="selectedId = p.id"
                @keydown.space.prevent="selectedId = p.id"
              >
                <span v-if="isCurrentPlan(p)" class="cur-tag">当前套餐</span>
                <span v-else-if="p.recommended" class="plan-rec-tag">推荐</span>
                <p class="plan-name">{{ p.name }}</p>
                <p class="plan-token">{{ p.tokenLabel }}</p>
                <p class="plan-price">
                  <span class="price-symbol">¥</span><span class="price-num">{{ fmtPrice(p.price) }}</span><span class="price-cycle">/{{ UNIT_MAP[tab] }}</span>
                </p>
                <span v-if="p.badge" class="plan-badge">{{ p.badge }}</span>
              </div>
            </div>

            <!-- 续订套餐详情：灰底四列 -->
            <p class="sec-label">续订套餐详情</p>
            <div class="gray-block">
              <div class="gb-col">
                <span class="gb-label">套餐名称</span>
                <span class="gb-value">{{ selectedPlan?.name || '-' }}</span>
              </div>
              <div class="gb-col">
                <span class="gb-label">套餐额度</span>
                <span class="gb-value">{{ selectedPlan?.tokenLabel || '-' }}</span>
              </div>
              <div class="gb-col">
                <span class="gb-label">生效状态</span>
                <span class="gb-value">支付成功后立即生效</span>
              </div>
              <div class="gb-col">
                <span class="gb-label">单价</span>
                <span class="gb-value gb-price">¥{{ priceText }}/{{ UNIT_MAP[tab] }}</span>
              </div>
            </div>

            <!-- ⓘ 说明行 -->
            <div class="notice-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="11" x2="12" y2="16" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>续订订单支付成功后立即生效，额度在新周期开始重置。</span>
            </div>

            <!-- footer：② 协议勾选横栏置底 → 左应付金额红大字 + 右取消/确认续订行 -->
            <div class="renew-footer">
              <!-- ② 置底协议勾选横栏（按钮行之上，浅灰底；错误态转红底+就地红提示） -->
              <div class="agree-topbar" :class="{ 'topbar-error': agreeError }">
                <label class="agree-row" :class="{ 'agree-error': agreeError }" @click="toggleAgree">
                  <span class="agree-checkbox" :class="{ checked: agreed }"></span>
                  <span class="agree-text">
                    我已阅读并同意
                    <a class="contract-link" href="#" @click.prevent.stop>自动续费服务协议</a>、<a class="contract-link" href="#" @click.prevent.stop>Token Plan 服务条款</a>、<a class="contract-link" href="#" @click.prevent.stop>隐私条款</a>
                  </span>
                </label>
                <p v-if="agreeError" class="inline-error">请先勾选同意协议后再继续</p>
              </div>

              <div class="footer-pay-row">
                <div class="pay-amount">
                  <span class="pa-label">应付金额</span>
                  <span class="pa-value">¥{{ priceText }}<span class="pa-unit">/{{ UNIT_MAP[tab] }}</span></span>
                </div>
                <div class="footer-btns">
                  <button class="btn-cancel" @click="close">取消</button>
                  <button class="btn-confirm" @click="handleConfirm">确认续订</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2：支付二维码（cm/cq 连续模式仅微信、无遮罩；月包 normal 模式） -->
          <div v-else-if="step === 2" class="modal-body pay-step">
            <PaymentQrPanel
              :mode="isContinuousTab ? 'continuous' : 'normal'"
              :amount="selectedPlan ? selectedPlan.price / 100 : undefined"
              :cycle-type="tab === 'cq' ? 'quarterly' : 'monthly'"
              @close="close"
              @paid="handlePaid"
            />
          </div>

          <!-- 步骤3：支付成功（同构 SubscribeModal 成功视图，标题「订阅 {全称}」口径） -->
          <div v-else class="modal-body success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="modal-title">支付成功</h3>
            <p class="success-plan">订阅 {{ successFullName }} 已生效</p>

            <!-- cm/cq：到期自动续费提示行；月包：有效期行 -->
            <div class="period-notice">
              <p v-if="isContinuousTab" class="renew-warning">到期将自动续费（{{ nextDeductText }} 扣款 ¥{{ priceText }}），可随时取消。</p>
              <p v-else>套餐有效期 {{ periodStartText }} 至 {{ periodEndText }}，共 {{ cycleDays }} 个自然日。</p>
            </div>

            <!-- cm/cq：取消连续扣费图文指引入口（月包不加，一次性无连续扣费） -->
            <div v-if="isContinuousTab" class="guide-entry">
              <a
                href="#"
                class="cancel-guide-link"
                @click.prevent="guideVisible = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>如何取消连续扣费</span>
              </a>
            </div>

            <button class="modal-btn btn-black" @click="close">完成</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 如何取消连续扣费（微信支付）图文指引弹窗 -->
    <CancelDeductGuideModal v-model:visible="guideVisible" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Plan, PlanType } from '@/types/plan';
import type { Subscription } from '@/types/plan';
import { createSubscription } from '@/api/subscription';
import { createOrder } from '@/api/order';
import { useUserStore } from '@/stores/userStore';
import { usePlanStore } from '@/stores/planStore';
import { useToastStore } from '@/stores/toastStore';
import PaymentQrPanel from '@/components/PaymentQrPanel.vue';
import CancelDeductGuideModal from '@/components/CancelDeductGuideModal.vue';

const props = defineProps<{
  visible: boolean;
  /** 当前过期的订阅（父级 sub 三级优先派生结果），用于顶部标题/当前套餐块/当前档匹配 */
  sub?: Subscription | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const userStore = useUserStore();
const planStore = usePlanStore();
const toastStore = useToastStore();

type RenewTab = 'cm' | 'cq' | 'monthly' | 'annual';

/** tab 组（右置）：连续包月、连续包季位于月包左侧，年包最后 */
const TABS: { key: RenewTab; label: string }[] = [
  { key: 'cm', label: '连续包月' },
  { key: 'cq', label: '连续包季' },
  { key: 'monthly', label: '月包' },
  { key: 'annual', label: '年包' }
];

/** 单价单位映射：cm→/月、cq→/季、月包为一次性购买→/个、年包→/年 */
const UNIT_MAP: Record<RenewTab, string> = { cm: '月', cq: '季', monthly: '个', annual: '年' };

const step = ref<1 | 2 | 3>(1);
const paying = ref(false);
const tab = ref<RenewTab>('cm');
const agreed = ref(false);
const agreeError = ref(false);

/** 图文指引弹窗可见性（仅 cm/cq 成功页入口开启） */
const guideVisible = ref(false);

/** 各 tab 选中档位（默认：当前过期套餐同档，否则首档） */
const selected = ref<Record<RenewTab, string>>({ cm: '', cq: '', monthly: '', annual: '' });

/* ---------- 当前过期套餐信息（顶部标题区 / 当前套餐灰底块 / 当前档匹配） ---------- */
const curSub = computed<Subscription | null>(() => props.sub ?? userStore.userSubscription);

/** 当前过期套餐对应 Plan（取 tokenLabel 额度文案） */
const curPlan = computed<Plan | null>(() => {
  const pid = curSub.value?.planId;
  if (!pid) return null;
  const all = [
    ...planStore.plans[PlanType.CONTINUOUS_MONTHLY],
    ...planStore.plans[PlanType.CONTINUOUS_QUARTERLY],
    ...planStore.plans[PlanType.MONTHLY_ONETIME],
    ...planStore.plans[PlanType.ANNUAL]
  ];
  return all.find((p) => p.id === pid) ?? null;
});

const fmtQuota = (n: number): string => {
  if (n >= 100000000) {
    const v = n / 100000000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}亿 Tokens`;
  }
  if (n >= 10000) {
    const v = n / 10000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}万 Tokens`;
  }
  return `${n} Tokens`;
};

const curTokenLabel = computed(() => curPlan.value?.tokenLabel ?? (curPlan.value ? fmtQuota(curPlan.value.quota ?? 0) : '-'));

/** 与当前过期套餐同档（跨 tab 按套餐名匹配）：红框 + 「当前套餐」黑底徽章 */
const isCurrentPlan = (p: Plan): boolean => !!curSub.value?.planName && p.name === curSub.value.planName;

/** 过期套餐产品线 → 默认 tab */
const defaultTabFromSub = (): RenewTab => {
  switch (curSub.value?.planType) {
    case PlanType.CONTINUOUS_QUARTERLY: return 'cq';
    case PlanType.MONTHLY_ONETIME: return 'monthly';
    case PlanType.ANNUAL: return 'annual';
    default: return 'cm';
  }
};

const fmtDate = (d?: Date | string | '') => {
  if (!d) return '-';
  const t = new Date(d);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

// 弹窗打开时重置：默认定位到过期套餐同产品线 tab、同档卡选中（即截图初始效果）、协议未勾选
watch(
  () => props.visible,
  (v) => {
    if (v) {
      step.value = 1;
      paying.value = false;
      tab.value = defaultTabFromSub();
      agreed.value = false;
      agreeError.value = false;
      const pick = (t: RenewTab): string => {
        const list = planStore.plans[tabPlanType(t)];
        const cur = list.find((p) => p.name === curSub.value?.planName);
        return cur?.id ?? list[0]?.id ?? '';
      };
      selected.value = { cm: pick('cm'), cq: pick('cq'), monthly: pick('monthly'), annual: pick('annual') };
    }
  }
);

const tabPlanType = (t: RenewTab): PlanType =>
  t === 'cm'
    ? PlanType.CONTINUOUS_MONTHLY
    : t === 'cq'
      ? PlanType.CONTINUOUS_QUARTERLY
      : t === 'annual'
        ? PlanType.ANNUAL
        : PlanType.MONTHLY_ONETIME;

const currentPlans = computed<Plan[]>(() => planStore.plans[tabPlanType(tab.value)]);
const selectedId = computed<string>({
  get: () => selected.value[tab.value],
  set: (id) => { selected.value[tab.value] = id; }
});
const selectedPlan = computed<Plan | null>(
  () => currentPlans.value.find((p) => p.id === selectedId.value) ?? null
);
const isContinuousTab = computed(() => tab.value === 'cm' || tab.value === 'cq');

const fmtPrice = (price: number) => (price / 100).toLocaleString('zh-CN');
const priceText = computed(() => (selectedPlan.value ? fmtPrice(selectedPlan.value.price) : ''));

/** 成功页全称口径：cm/cq 为 {套餐名} {tokenLabel} - {连续包月|连续包季}；月包/年包同构追加产品线名 */
const successFullName = computed(() => {
  const p = selectedPlan.value;
  if (!p) return '';
  const cycle = tab.value === 'cq' ? '连续包季' : tab.value === 'cm' ? '连续包月' : tab.value === 'annual' ? '年包' : '月包';
  return `${p.name} ${p.tokenLabel} - ${cycle}`;
});

/* ---------- 日期口径（同 SubscribeModal） ---------- */
const DAY = 24 * 60 * 60 * 1000;
const fmt = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
const cycleDays = computed(() => (tab.value === 'cq' ? 90 : tab.value === 'annual' ? 365 : 30));
const periodEnd = computed(() => new Date(Date.now() + cycleDays.value * DAY));
const nextDeductText = computed(() => fmt(periodEnd.value));
const periodStartText = computed(() => fmt(new Date()));
const periodEndText = computed(() => fmt(periodEnd.value));

const toggleAgree = () => {
  agreed.value = !agreed.value;
  if (agreed.value) agreeError.value = false;
};

// 确认续订：必勾协议校验，通过后关闭确认页进入支付二维码
const handleConfirm = () => {
  if (!agreed.value) {
    agreeError.value = true;
    return;
  }
  if (!selectedPlan.value) {
    toastStore.push('请选择续订档位', 'error');
    return;
  }
  step.value = 2;
};

// 模拟支付成功：cm/cq 创建新 active 订阅（新周期 now 起 +30/90 天，autoRenew=true）+新订单（生效中）；月包走 createOrder
const handlePaid = async () => {
  const plan = selectedPlan.value;
  const uid = userStore.userInfo?.id;
  if (!plan || !uid) return;
  paying.value = true;
  try {
    if (isContinuousTab.value) {
      await createSubscription(plan.id, uid);
    } else {
      await createOrder(plan.id, uid, { queueable: false });
    }
    await userStore.refreshUserState();
    step.value = 3;
    emit('success');
  } catch (err) {
    toastStore.push(`支付失败：${(err as Error).message}`, 'error');
    step.value = 1;
  } finally {
    paying.value = false;
  }
};

const close = () => {
  if (paying.value) return;
  emit('update:visible', false);
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-dialog {
  position: relative;
  width: 660px;
  max-width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 28px 28px 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.25s ease;
}

/* 步骤1（续订确认）dialog 加宽：容纳灰底三列/四列块与 4 档卡横排 */
.modal-dialog.dialog-renew {
  box-sizing: border-box;
  width: 780px;
  padding: 28px 32px 24px;
}

/* 支付二维码页 dialog 收窄（同 SubscribeModal 口径） */
.modal-dialog.dialog-pay {
  box-sizing: border-box;
  width: 460px;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 2;
}

.modal-close:hover {
  color: var(--text-title);
}

.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---------- 步骤1：续订确认（按设计基准重构） ---------- */
.renew-step {
  align-items: stretch;
}

/* 顶部：套餐名称标题区 */
.renew-title {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 小节标题 */
.sec-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.sec-note {
  font-size: 12.5px;
  font-weight: 400;
  color: var(--text-secondary);
}

/* 灰底信息块（当前套餐三列 / 续订套餐详情四列） */
.gray-block {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 14px 18px;
  background: #f5f6f7;
  border-radius: 10px;
  margin-bottom: 18px;
}

.gb-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gb-label {
  font-size: 12px;
  color: #8a8f99;
}

.gb-value {
  font-size: 13.5px;
  font-weight: 500;
  color: #1a1a1a;
  font-variant-numeric: tabular-nums;
}

.gb-plan-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.gb-plan-name {
  font-size: 15px;
  font-weight: 600;
}

/* 黑底 chip（已过期） */
.chip-black {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

/* 单价列：红色强调 */
.gb-price {
  color: var(--brand-red);
  font-weight: 600;
}

/* 续订套餐小节：标题 + 右置 tab 组 */
.sec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.sec-row .sec-label {
  margin: 0;
}

/* tab 组：右置胶囊，黑底选中态（同截图月包|年包样式） */
.renew-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.renew-tab {
  height: 32px;
  padding: 0 18px;
  border: 1px solid #e6e7eb;
  border-radius: 100px;
  background: #fff;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.renew-tab:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
}

.renew-tab.on {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
  font-weight: 500;
}

/* 4 档套餐卡横排 */
.plan-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 12px 12px;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  user-select: none;
}

.plan-card:hover {
  border-color: #ffb3b3;
}

.plan-card.selected {
  border-color: var(--brand-red);
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.1);
}

/* 当前过期套餐同档：红框（与选中态叠加） */
.plan-card.is-current {
  border-color: var(--brand-red);
}

/* 「当前套餐」黑底徽章（左上角） */
.cur-tag {
  position: absolute;
  top: -9px;
  left: 8px;
  padding: 1px 8px;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
}

.plan-card.recommended {
  border-color: #ffd7d7;
}

.plan-card.recommended.selected {
  border-color: var(--brand-red);
}

.plan-rec-tag {
  position: absolute;
  top: -8px;
  right: 8px;
  padding: 1px 8px;
  border-radius: 8px;
  background: var(--brand-red);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}

.plan-name {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1a1a;
}

.plan-token {
  margin: 0;
  font-size: 11.5px;
  color: var(--text-secondary);
}

.plan-price {
  margin: 6px 0 0;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}

.price-num {
  font-size: 19px;
  font-weight: 700;
  color: var(--brand-red);
}

.price-cycle {
  font-size: 11.5px;
  font-weight: 400;
  color: var(--text-secondary);
}

.plan-badge {
  margin-top: 6px;
  padding: 2px 7px;
  border: 1px solid #ffd7d7;
  border-radius: 4px;
  background: #fff5f5;
  color: var(--brand-red);
  font-size: 10px;
  line-height: 1.5;
}

/* ⓘ 说明行 */
.notice-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-bottom: 14px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.notice-row svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 2px;
}

/* ② 必勾协议置底横栏（footer 内按钮行之上的浅灰底横栏，错误态就地红提示） */
.agree-topbar {
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 14px;
  padding: 10px 14px;
  background: #f5f6f7;
  border-radius: 10px;
  transition: background 0.2s;
}

.agree-topbar.topbar-error {
  background: #fff1f0;
}

.agree-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.agree-checkbox {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: 1.5px solid #ccc;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.15s;
}

.agree-checkbox.checked {
  border-color: var(--brand-red);
  background: var(--brand-red);
  position: relative;
}

.agree-checkbox.checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.agree-text {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-link);
}

.contract-link {
  color: var(--brand-red);
  text-decoration: none;
}

.agree-row.agree-error .agree-checkbox {
  border-color: #e53935;
}

.inline-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #e53935;
  font-weight: 500;
}

/* footer：协议勾选横栏 → 左应付金额红大字 + 右取消/确认续订行 */
.renew-footer {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ececef;
}

/* footer 内按钮行：左应付金额 + 右取消/确认续订 */
.footer-pay-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pay-amount {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.pa-label {
  font-size: 13px;
  color: #666;
}

.pa-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--brand-red);
  line-height: 1;
  letter-spacing: 0.3px;
}

.pa-unit {
  font-size: 13px;
  font-weight: 500;
}

.footer-btns {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-cancel {
  height: 42px;
  padding: 0 28px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--brand-red);
  color: var(--brand-red);
}

.btn-confirm {
  height: 42px;
  padding: 0 28px;
  border: none;
  border-radius: 8px;
  background: var(--brand-red);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-confirm:hover {
  opacity: 0.88;
}

/* 按钮（成功页主按钮） */
.modal-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 14px;
}

.modal-btn:hover {
  opacity: 0.88;
}

.btn-black {
  background: var(--btn-black);
}

/* ---------- 支付二维码页 / 成功态 ---------- */
.modal-title {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
}

.modal-body.pay-step {
  width: 100%;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 65, 65, 0.08);
  margin-bottom: 14px;
}

.success-icon svg {
  width: 30px;
  height: 30px;
  color: var(--brand-red);
}

.success-plan {
  margin: -8px 0 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.period-notice {
  width: 100%;
  background: #fafafa;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.period-notice p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-link);
}

/* 取消连续扣费图文指引入口（仅 cm/cq 成功页） */
.guide-entry {
  margin-bottom: 12px;
}

.cancel-guide-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 2px;
  font-size: 12.5px;
  color: #6b7a99;
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: color 0.2s, border-color 0.2s;
  cursor: pointer;
  background: transparent;
}

.cancel-guide-link svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.cancel-guide-link:hover {
  color: #3d5a99;
  border-bottom-color: currentColor;
}

.cancel-guide-link:focus-visible {
  outline: 2px solid #3d5a99;
  outline-offset: 2px;
  border-radius: 3px;
}

/* 红字提示 */
.renew-warning {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-red);
}

/* 过渡 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .plan-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
