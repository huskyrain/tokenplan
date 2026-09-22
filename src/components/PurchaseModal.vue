<!-- src/components/PurchaseModal.vue -->
<!-- 通用普通支付弹窗（无签约协议文案）：年包（功能点④排队）/ 词元宝 / 团队定制 -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible && order" class="modal-mask" @click.self="handleMaskClick">
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
                <span class="order-label">{{ order.nameLabel || '订单' }}</span>
                <span class="order-value">{{ shortName }}</span>
              </div>
              <div class="order-row">
                <span class="order-label">应付</span>
                <span class="order-value">
                  <span class="price-symbol">¥</span><span class="price-num">{{ priceText }}</span>
                </span>
              </div>
            </div>

            <!-- 年包排队提示（确认页） -->
            <p v-if="order.queueNote" class="queue-hint">{{ order.queueNote }}</p>

            <!-- 连续包月生效中买年包：显性告知块 + 必勾复选框 -->
            <div v-if="order.requireStopRenewalConsent" class="renewal-consent-block">
              <div class="consent-notice">
                <svg class="consent-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p class="consent-notice-text">购买后，当前连续包月将于本周期末停止自动续费（已付周期服务不受影响），年包将于周期结束后次日无缝接续生效。</p>
              </div>
              <label class="consent-checkbox" :class="{ error: renewalConsentError }">
                <input type="checkbox" v-model="renewalConsent" @change="renewalConsentError = false" />
                <span class="checkbox-box"></span>
                <span class="checkbox-label">我已知悉并同意停止当前自动续费</span>
              </label>
              <p v-if="renewalConsentError" class="consent-error">请先勾选确认后方可提交订单</p>
            </div>

            <!-- 发票表单 -->
            <InvoiceForm ref="invoiceFormRef" />

            <!-- 底部主按钮 -->
            <button class="modal-btn btn-black" @click="handleConfirm">确认购买</button>
          </div>

          <!-- 步骤2：微信支付二维码页 -->
          <div v-else-if="step === 2" class="modal-body pay-step">
            <PaymentQrPanel mode="normal" @close="close" @paid="handlePaid" />
          </div>

          <!-- 步骤3：支付成功 -->
          <div v-else class="modal-body success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="modal-title">支付成功</h3>
            <p class="success-plan">{{ order.name }}</p>

            <div class="period-notice">
              <!-- 排队生效（年包） -->
              <template v-if="queued">
                <template v-if="order.requireStopRenewalConsent">
                  <p class="queue-title">
                    <span class="queue-dot"></span>
                    购买成功。年包将在当前连续包月周期结束后自动生效；连续包月自动续费已停止。
                  </p>
                  <p>当前连续包月服务将持续至本周期末，年包于次日无缝接续生效。</p>
                </template>
                <template v-else>
                  <p class="queue-title">
                    <span class="queue-dot"></span>
                    已购套餐将在当前套餐到期或Token耗尽后自动生效排队
                  </p>
                  <p>当前套餐到期后，新购套餐将自动开始服务。</p>
                </template>
              </template>
              <!-- 未排队：展示成功说明行 -->
              <template v-else>
                <p v-for="(line, i) in order.successLines" :key="i" v-html="line"></p>
              </template>
            </div>

            <button class="modal-btn btn-black" @click="close">完成</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
/** 通用订单载荷：由父组件构造提交逻辑 */
export interface PurchasePayload {
  name: string;             // 展示名，如 "基础版 · 年包"
  nameLabel?: string;       // 摘要第一行的字段名，默认“订单”
  tokenLabel?: string;     // Token 额度（可选）
  price: number;            // 分
  unit: string;             // "年" | ""
  cycleLabel: string;      // 周期说明，如 "年包（365 天）"
  queueNote?: string;      // 确认页排队提示（仅年包）
  successLines: string[];   // 未排队时成功态说明行（支持 <b>，v-html 渲染）
  submit: (userId: string) => Promise<{ queued: boolean }>;
  /** 连续包月生效中买年包：需展示告知块+必勾复选框 */
  requireStopRenewalConsent?: boolean;
  /** 支付成功后的自定义文案（覆盖默认排队提示） */
  queuedSuccessLines?: string[];
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import InvoiceForm from '@/components/InvoiceForm.vue';
import PaymentQrPanel from '@/components/PaymentQrPanel.vue';

const props = defineProps<{
  visible: boolean;
  order: PurchasePayload | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const userStore = useUserStore();
const toastStore = useToastStore();

const step = ref<1 | 2 | 3>(1);
const paying = ref(false);
const queued = ref(false);
const renewalConsent = ref(false);
const renewalConsentError = ref(false);
const invoiceFormRef = ref<InstanceType<typeof InvoiceForm> | null>(null);

watch(
  () => props.visible,
  (v) => {
    if (v) {
      step.value = 1;
      paying.value = false;
      queued.value = false;
      renewalConsent.value = false;
      renewalConsentError.value = false;
      invoiceFormRef.value?.reset();
    }
  }
);

const priceText = computed(() => (props.order ? (props.order.price / 100).toLocaleString('zh-CN') : ''));

// 简称：从 "基础版 · 年包" 中提取 "基础版"
const shortName = computed(() => {
  if (!props.order) return '';
  return props.order.name.split(' · ')[0];
});

// 标题："购买 XX"
const modalTitle = computed(() => `购买 ${shortName.value}`);

// 确认按钮：先校验复选框和发票表单，通过后进入微信支付二维码页
const handleConfirm = () => {
  // 必勾复选框校验（连续包月生效中买年包）
  if (props.order?.requireStopRenewalConsent && !renewalConsent.value) {
    renewalConsentError.value = true;
    return;
  }
  renewalConsentError.value = false;
  if (invoiceFormRef.value && !invoiceFormRef.value.validate()) {
    toastStore.push('请完善发票必填信息', 'error');
    return;
  }
  step.value = 2;
};

// 二维码页“模拟扫码支付成功”：调起微信支付（mock order.submit）
const handlePaid = async () => {
  if (!props.order || !userStore.userInfo?.id) return;
  paying.value = true;
  try {
    const result = await props.order.submit(userStore.userInfo.id);
    queued.value = result.queued;
    if (result.queued) {
      // 功能点④：年包排队机制提示
      if (props.order.requireStopRenewalConsent) {
        // 连续包月生效中买年包：自动解约成功文案
        toastStore.push('购买成功。年包将在当前连续包月周期结束后自动生效；连续包月自动续费已停止。', 'success', 4500);
      } else {
        toastStore.push('已购套餐将在当前套餐到期或Token耗尽后自动生效排队', 'info', 3600);
      }
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

/* ---------- 确认订单步骤（截图1版面） ---------- */
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

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

/* 年包排队提示 */
.queue-hint {
  margin: 0 0 12px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-link);
  background: #fafafa;
  border-radius: 10px;
  padding: 10px 12px;
}

/* 连续包月生效中买年包：告知块 + 复选框 */
.renewal-consent-block {
  margin-bottom: 14px;
}

.consent-notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 10px;
  padding: 11px 13px;
  margin-bottom: 10px;
}

.consent-notice-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  color: #fa8c16;
}

.consent-notice-text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: #614700;
}

.consent-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.consent-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  transition: all 0.2s;
}

.consent-checkbox input:checked + .checkbox-box {
  background: var(--btn-black);
  border-color: var(--btn-black);
}

.consent-checkbox input:checked + .checkbox-box::after {
  content: '';
  display: block;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-0.5px, -0.5px);
}

.consent-checkbox.error .checkbox-box {
  border-color: var(--brand-red);
}

.checkbox-label {
  font-size: 13px;
  color: var(--text-title);
  font-weight: 500;
}

.consent-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--brand-red);
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
  background: rgba(26, 26, 26, 0.06);
  margin-bottom: 14px;
}

.success-icon svg {
  width: 30px;
  height: 30px;
  color: var(--btn-black);
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
  margin: 0 0 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-link);
}

.period-notice p:last-child {
  margin-bottom: 0;
}

.period-notice :deep(b) {
  color: var(--text-title);
  font-weight: 600;
}

/* 排队提示 */
.queue-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px !important;
  font-weight: 600;
  color: var(--text-title) !important;
}

.queue-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand-red);
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.15);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
