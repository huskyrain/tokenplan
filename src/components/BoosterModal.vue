<!-- src/components/BoosterModal.vue -->
<!-- 功能点⑤：加油包购买弹窗（档位选择 + 绑定生效服务单 + 随服务单失效提示） -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-mask" @click.self="close">
        <div class="modal-dialog" :class="{ 'dialog-pay': qrStage && !resultPack }">
          <!-- 关闭按钮（支付二维码页由面板自带×） -->
          <button v-if="!paying && !resultPack && !qrStage" class="modal-close" @click="close">×</button>

          <!-- 购买视图 -->
          <template v-if="!resultPack">
            <!-- 微信支付二维码页 -->
            <PaymentQrPanel
              v-if="qrStage"
              mode="normal"
              :amount="totalPriceFen / 100"
              @close="close"
              @paid="confirmPurchase"
            />

            <template v-else>
              <!-- 标题栏 -->
              <div class="confirm-header">
                <h3 class="confirm-title">购买 加油包</h3>
              </div>
              <p class="modal-subtitle">为生效中的服务单补充 Token 额度</p>

              <!-- 无生效服务单：门槛拦截空态 -->
              <div v-if="!hasActiveOrder" class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="empty-icon">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5h.01" stroke-linecap="round" />
                </svg>
                <p class="empty-text">需先订阅生效中的套餐后方可购买加油包</p>
                <button class="modal-btn btn-black" @click="close">知道了</button>
              </div>

              <template v-else>
                <!-- 单档位展示 -->
                <div class="field-label">加油包档位</div>
                <div class="tier-single">
                  <span class="tier-token">{{ singleTier?.tokenLabel }}</span>
                  <span class="tier-price">¥{{ singleTier ? singleTier.price / 100 : '' }}</span>
                </div>

                <!-- 份数步进器 -->
                <div class="field-label">购买份数</div>
                <div class="qty-stepper">
                  <button class="qty-btn" :disabled="qty <= 1" @click="dec">−</button>
                  <span class="qty-value">{{ qty }}</span>
                  <button class="qty-btn" :disabled="qty >= 99" @click="inc">+</button>
                </div>

                <!-- 绑定生效中套餐（只读）：套餐名称 + 主套餐有效期（与订阅管理概览同口径） -->
                <div class="field-label">绑定生效中套餐</div>
                <div class="bind-readonly">
                  <span class="bind-name">{{ boundDisplayName }}</span>
                  <p v-if="boundValidityText" class="bind-validity">{{ boundValidityText }}</p>
                </div>

                <!-- 红字提示（③ 文案口径：随服务单有效期同步失效） -->
                <p class="booster-warning">
                  加油包 Token 额度随服务单有效期同步失效
                </p>

                <!-- 订单信息卡（浅灰底色） -->
                <div class="order-card">
                  <div class="order-row">
                    <span class="order-label">订单</span>
                    <span class="order-value">加油包 {{ totalTokenLabel }}</span>
                  </div>
                  <div class="order-row">
                    <span class="order-label">应付</span>
                    <span class="order-value">
                      <span class="price-symbol">¥</span><span class="price-num">{{ totalPriceYuan }}</span>
                    </span>
                  </div>
                </div>

                <!-- 发票表单 -->
                <InvoiceForm ref="invoiceFormRef" />

                <!-- 底部主按钮 -->
                <button
                  class="modal-btn btn-black"
                  :disabled="!singleTier || !boundTo || paying"
                  @click="handleConfirm"
                >
                  {{ paying ? '支付中...' : '确认购买' }}
                </button>
              </template>
            </template>
          </template>

          <!-- 成功视图 -->
          <div v-if="resultPack" class="modal-body success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="modal-title">购买成功</h3>
            <div class="inject-notice">
              加油包 <b class="red">{{ successPack.tokenLabel }}</b>
            </div>
            <p class="expire-hint">加油包 Token 额度随服务单有效期同步失效</p>
            <button class="modal-btn btn-black" @click="close">完成</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BoosterTier } from '@/types/plan';
import { Order, BoosterPack } from '@/types/order';
import { getBoosterTiers } from '@/api/subscription';
import { getActiveServiceOrders } from '@/api/order';
import { useUserStore } from '@/stores/userStore';
import { useBoosterStore } from '@/stores/boosterStore';
import { useToastStore } from '@/stores/toastStore';
import InvoiceForm from '@/components/InvoiceForm.vue';
import PaymentQrPanel from '@/components/PaymentQrPanel.vue';

const props = defineProps<{ visible: boolean }>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success', pack: BoosterPack): void;
}>();

const userStore = useUserStore();
const boosterStore = useBoosterStore();
const toastStore = useToastStore();

const tiers = ref<BoosterTier[]>([]);
const activeOrders = ref<Order[]>([]);
const qty = ref(1);
const boundTo = ref<string>('');
const paying = ref(false);
const qrStage = ref(false);
const resultPack = ref<BoosterPack | null>(null);
const invoiceFormRef = ref<InstanceType<typeof InvoiceForm> | null>(null);

/** 单档位：始终取首档 */
const singleTier = computed(() => tiers.value.length > 0 ? tiers.value[0] : null);
const hasActiveOrder = computed(() => activeOrders.value.length > 0);
/** 当前绑定的生效服务单（主订阅载体） */
const boundOrder = computed(() => activeOrders.value.find((o) => o.id === boundTo.value) ?? null);
/** 绑定套餐只读显示名 */
const boundDisplayName = computed(() => boundOrder.value?.displayName || '');
/**
 * 主套餐有效期文案：`有效期：YYYY-MM-DD HH:MM:SS 至 YYYY-MM-DD HH:MM:SS`
 * 取绑定生效服务单的完整起止时间，口径与订阅管理概览卡`套餐有效期`同源全精度
 * （起：startDate → paidTime → createTime 依次降级；止：endDate）
 */
const boundValidityText = computed(() => {
  const order = boundOrder.value;
  if (!order) return '';
  const start = order.startDate ?? order.paidTime ?? order.createTime;
  const end = order.endDate;
  if (!start || !end) return '';
  return `有效期：${fmtFull(start)} 至 ${fmtFull(end)}`;
});

/** 日期时间格式化：YYYY-MM-DD HH:MM:SS（与订阅管理概览`套餐有效期`同口径） */
function fmtFull(d: Date | string): string {
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return '-';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())}`;
}

/** 合计金额（分） */
const totalPriceFen = computed(() => (singleTier.value ? singleTier.value.price * qty.value : 0));
/** 合计金额（元） */
const totalPriceYuan = computed(() => (totalPriceFen.value / 100).toLocaleString('zh-CN'));
/** 合计 Token 标签 */
const totalTokenLabel = computed(() => {
  if (!singleTier.value) return '';
  return formatTokenAmount(singleTier.value.tokenAmount * qty.value);
});

// 成功视图数据
const successPack = computed<BoosterPack>(() => resultPack.value as BoosterPack);

/** 份数步进守卫：:disabled 响应式更新滞后于同步连点，handler 内显式 clamp 防越界 */
const inc = () => {
  if (qty.value < 99) qty.value++;
};
const dec = () => {
  if (qty.value > 1) qty.value--;
};

/** 将 Token 数值格式化为人可读标签 */
function formatTokenAmount(amount: number): string {
  if (amount >= 100000000) {
    const yi = amount / 100000000;
    return `${parseFloat(yi.toFixed(2))}亿 Token`;
  }
  if (amount >= 10000) {
    const wan = amount / 10000;
    return `${Number.isInteger(wan) ? wan : wan.toFixed(0)}万 Token`;
  }
  return `${amount} Token`;
}

// 打开时加载数据并重置状态
watch(
  () => props.visible,
  async (v) => {
    if (!v) return;
    resultPack.value = null;
    paying.value = false;
    qrStage.value = false;
    qty.value = 1;
    boundTo.value = '';
    invoiceFormRef.value?.reset();
    tiers.value = await getBoosterTiers();
    if (!userStore.userInfo?.id) return;
    activeOrders.value = await getActiveServiceOrders(userStore.userInfo.id);
    if (activeOrders.value.length > 0) {
      boundTo.value = activeOrders.value[0].id;
    }
  }
);

// 确认按钮：先校验发票表单，通过后进入微信支付二维码页
const handleConfirm = () => {
  if (invoiceFormRef.value && !invoiceFormRef.value.validate()) {
    toastStore.push('请完善发票必填信息', 'error');
    return;
  }
  qrStage.value = true;
};

// 二维码页“模拟扫码支付成功”：提交加油包购买
const confirmPurchase = async () => {
  if (!singleTier.value || !boundTo.value || !userStore.userInfo?.id) return;
  paying.value = true;
  try {
    const pack = await boosterStore.buyBoosterPack(
      singleTier.value.id,
      userStore.userInfo.id,
      boundTo.value,
      qty.value
    );
    resultPack.value = pack;
    await userStore.refreshUserState();
    toastStore.push(`加油包 ${pack.tokenLabel}`, 'success');
    emit('success', pack);
  } catch (err) {
    toastStore.push((err as Error).message || '购买失败，请重试', 'error');
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
  width: 440px;
  max-width: 100%;
  max-height: 86vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 28px 28px 26px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.25s ease;
}

/* 支付二维码页 dialog 收窄（对照基准截图紧凑比例，确认订单阶段保持 440px）
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

/* 标题栏 */
.confirm-header {
  margin-bottom: 4px;
}

.confirm-title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: #1a1a1a;
  text-align: left;
}

.modal-subtitle {
  margin: 4px 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 空态（门槛拦截） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 0 12px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  color: var(--card-border);
  margin-bottom: 14px;
}

.empty-text {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--text-title);
  text-align: center;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-title);
  margin-bottom: 10px;
}

/* 单档位展示 */
.tier-single {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: 1px solid var(--brand-red);
  border-radius: 12px;
  background: rgba(255, 65, 65, 0.03);
  margin-bottom: 18px;
}

.tier-token {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-red);
}

.tier-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-title);
}

/* 份数步进器 */
.qty-stepper {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid var(--card-border);
  border-radius: 10px;
  background: #fff;
  margin-bottom: 18px;
  overflow: hidden;
}

.qty-btn {
  flex: 0 0 44px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: var(--text-title);
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f5f5f5;
  color: var(--brand-red);
}

.qty-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.qty-value {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
}

/* 绑定只读展示 */
.bind-readonly {
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 10px;
  margin-bottom: 14px;
}

.bind-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-title);
}

/* 主套餐有效期：灰字小行，置于套餐名称下方 */
.bind-validity {
  margin: 5px 0 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}

/* 红字提示 */
.booster-warning {
  margin: 0 0 14px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--brand-red);
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

.modal-btn:disabled {
  background: #d8d8d8;
  cursor: not-allowed;
}

.btn-black {
  background: var(--btn-black);
}

/* 成功视图 */
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 65, 65, 0.08);
  margin: 6px 0 14px;
}

.success-icon svg {
  width: 30px;
  height: 30px;
  color: var(--brand-red);
}

.inject-notice {
  background: #fafafa;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-title);
  text-align: center;
}

.inject-notice b {
  font-weight: 600;
}

.inject-notice .red {
  color: var(--brand-red);
}

.expire-hint {
  margin: 0 0 18px;
  font-size: 12px;
  color: var(--text-secondary);
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
