<!-- src/components/SubscribeModal.vue -->
<!-- 签约线订阅弹窗（3步：确认订单 → 支付中 → 支付成功），支持连续包月/连续包季 -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible && plan" class="modal-mask" @click.self="handleMaskClick">
        <div class="modal-dialog" :class="{ 'dialog-pay': step === 2 }">
          <!-- 关闭按钮（支付二维码页由面板自带×） -->
          <button v-if="step !== 2" class="modal-close" @click="close">×</button>



          <!-- 步骤1：确认订单（截图1版面） -->
          <div v-if="step === 1" class="modal-body confirm-step">
            <!-- 标题栏 -->
            <div class="confirm-header">
              <h3 class="confirm-title">{{ modalTitle }}</h3>
            </div>

            <!-- 订单信息卡（浅灰底色） -->
            <div class="order-card">
              <div class="order-row">
                <span class="order-label">订单</span>
                <span class="order-value">{{ plan.name }} {{ plan.tokenLabel }} - {{ isQuarterly ? '连续包季' : '连续包月' }}</span>
              </div>
              <div class="order-row">
                <span class="order-label">应付</span>
                <span class="order-value">
                  <span class="price-symbol">¥</span><span class="price-num">{{ priceText }}</span><span class="price-cycle">/{{ isQuarterly ? '季' : '月' }}</span>
                </span>
              </div>
            </div>

            <!-- ③ 生效时间与下次自动续费 -->
            <div class="time-info">
              <p class="time-info-line">生效时间：支付成功后立即生效（{{ todayISO }}）</p>
              <p class="time-info-line">下次自动续费：{{ nextRenewISO }}</p>
            </div>

            <!-- ② 扣费告知三行（浅黄块，保留原位） -->
            <div class="subscribe-agreement">
              <div class="deduct-notice">
                <p class="deduct-line">{{ isQuarterly ? '每3个月' : '每月' }}自动扣费 ¥{{ priceText }}</p>
                <p class="deduct-line">首次扣款后立即生效，{{ isQuarterly ? '每季' : '每月' }}到期前自动续扣</p>
                <p class="deduct-line">可随时取消自动续费</p>
              </div>
            </div>

            <!-- ② 取消连续扣费图文指引入口 -->
            <div class="guide-entry">
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

            <!-- 发票表单 -->
            <InvoiceForm ref="invoiceFormRef" />

            <!-- ① 协议勾选行（置底，确认按钮正上方） -->
            <div class="agree-bottom">
              <label class="agree-row" :class="{ 'agree-error': agreeError }" @click="toggleAgree">
                <span class="agree-checkbox" :class="{ checked: agreed }"></span>
                <span class="agree-text">
                  我已阅读并同意
                  <a class="contract-link" href="#" @click.prevent.stop>自动续费服务协议</a>、<a class="contract-link" href="#" @click.prevent.stop>Token Plan 服务条款</a>、<a class="contract-link" href="#" @click.prevent.stop>隐私条款</a>
                </span>
              </label>
              <p v-if="agreeError" class="inline-error">请先勾选同意协议后再继续</p>
            </div>

            <!-- 底部主按钮 -->
            <button class="modal-btn btn-black" @click="handleConfirm">确认订阅</button>
          </div>

          <!-- 步骤2：微信支付二维码页 -->
          <div v-else-if="step === 2" class="modal-body pay-step">
            <PaymentQrPanel
              mode="continuous"
              :amount="plan.price / 100"
              :cycle-type="isQuarterly ? 'quarterly' : 'monthly'"
              @close="close"
              @paid="handlePaid"
            />
          </div>

          <!-- 步骤3：支付成功 -->
          <div v-else class="modal-body success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="modal-title">支付成功</h3>
            <p class="success-plan">{{ plan.name }} · {{ isQuarterly ? '连续包季' : '连续包月' }}已生效</p>

            <!-- 到期自动续费提示行 -->
            <div class="period-notice">
              <p class="renew-warning">到期将自动续费（{{ nextDeductText }} 扣款 ¥{{ priceText }}），可随时取消。</p>
            </div>

            <!-- ③ 取消连续扣费图文指引入口 -->
            <div class="guide-entry">
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
import { createSubscription } from '@/api/subscription';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import InvoiceForm from '@/components/InvoiceForm.vue';
import PaymentQrPanel from '@/components/PaymentQrPanel.vue';
import CancelDeductGuideModal from '@/components/CancelDeductGuideModal.vue';

const props = defineProps<{
  visible: boolean;
  plan: Plan | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const userStore = useUserStore();
const toastStore = useToastStore();

const step = ref<1 | 2 | 3>(1);
const paying = ref(false);
const agreed = ref(false);
const agreeError = ref(false);
const invoiceFormRef = ref<InstanceType<typeof InvoiceForm> | null>(null);

/** 图文指引弹窗可见性（确认页 / 成功页入口共用） */
const guideVisible = ref(false);

// 弹窗打开时重置到步骤1并清空发票表单
watch(
  () => props.visible,
  (v) => {
    if (v) {
      step.value = 1;
      paying.value = false;
      agreed.value = false;
      agreeError.value = false;
      invoiceFormRef.value?.reset();
    }
  }
);

const priceText = computed(() => (props.plan ? (props.plan.price / 100).toLocaleString('zh-CN') : ''));

/** 是否为连续包季 */
const isQuarterly = computed(() => props.plan?.planType === PlanType.CONTINUOUS_QUARTERLY);
const cycleDays = computed(() => (isQuarterly.value ? 90 : 30));

// ① 标题：完整格式 "订阅 体验版 3000万 Token - 连续包月"
const modalTitle = computed(() => {
  const action = userStore.userSubscription?.status === 'cancelled' ? '续订' : '订阅';
  const name = props.plan?.name || '';
  const token = props.plan?.tokenLabel || '';
  const cycle = isQuarterly.value ? '连续包季' : '连续包月';
  return `${action} ${name} ${token} - ${cycle}`;
});

const toggleAgree = () => {
  agreed.value = !agreed.value;
  if (agreed.value) agreeError.value = false;
};

const fmt = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
const fmtISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = new Date();
const todayISO = fmtISO(today);
const periodEnd = computed(() => new Date(today.getTime() + cycleDays.value * 24 * 60 * 60 * 1000));
const nextDeductText = computed(() => fmt(periodEnd.value));
const nextRenewISO = computed(() => fmtISO(periodEnd.value));

// 确认按钮：② 先校验条款勾选，再校验发票表单，通过后进入微信支付二维码页
const handleConfirm = () => {
  if (!agreed.value) {
    agreeError.value = true;
    return;
  }
  if (invoiceFormRef.value && !invoiceFormRef.value.validate()) {
    toastStore.push('请完善发票必填信息', 'error');
    return;
  }
  step.value = 2;
};

// 二维码页“模拟扫码支付成功”：调起微信支付（mock createSubscription）
const handlePaid = async () => {
  if (!props.plan || !userStore.userInfo?.id) return;
  paying.value = true;
  try {
    await createSubscription(props.plan.id, userStore.userInfo.id);
    // 更新用户订阅状态（连续包月页签下所有卡片将变为“已订阅”）
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

const handleMaskClick = () => {
  close();
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
  width: 420px;
  max-width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 28px 28px 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.25s ease;
}

/* 支付二维码页 dialog 收窄（对照基准截图紧凑比例，确认订单阶段保持 420px）
   border-box 下可见外宽 = 460px，内容区 460 - 28*2 = 404px，可容纳扫描框 348px */
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

/* ---------- 确认订单步骤（截图1版面） ---------- */
.confirm-step {
  align-items: stretch;
}

.confirm-header {
  margin-bottom: 14px;
}

.confirm-title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: #1a1a1a;
  text-align: left;
}

/* 订单信息卡 */
.order-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px 16px;
  margin-bottom: 12px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
}

.order-row + .order-row {
  border-top: 1px solid #e8e8e8;
}

.order-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.order-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.price-symbol {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
}

.price-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--brand-red);
}

.price-cycle {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary);
}

/* ③ 生效时间信息行 */
.time-info {
  margin-bottom: 12px;
}

.time-info-line {
  margin: 0 0 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.time-info-line:last-child {
  margin-bottom: 0;
}

/* 红字提示 */
.renew-warning {
  margin: 0 0 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-red);
}

/* ② 签约条款勾选区 */
.subscribe-agreement {
  background: #fffbe6;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.deduct-notice {
  margin-bottom: 0;
}

.deduct-line {
  margin: 0 0 4px;
  font-size: 12.5px;
  line-height: 1.7;
  color: #1a1a1a;
}

.deduct-line:first-child {
  font-weight: 600;
}

.deduct-line:last-child {
  margin-bottom: 0;
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

/* ② / ③ 图文取消指引入口（样式同订阅管理 ov-deduct-info 内链接） */
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

/* ① 置底协议勾选区（确认按钮正上方） */
.agree-bottom {
  margin-top: 2px;
}

/* 按钮 */
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

/* 成功态 */
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
}

.period-notice p {
  margin: 0 0 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-link);
}

.period-notice p:last-child {
  margin-bottom: 0;
}

.period-notice b {
  color: var(--text-title);
  font-weight: 600;
}

.period-notice .renew-warning {
  margin: 4px 0 0;
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
</style>
