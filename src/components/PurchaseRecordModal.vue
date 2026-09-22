<!-- src/components/PurchaseRecordModal.vue -->
<!-- 购买记录弹层：浅蓝头部横条 + 浅灰可滚动 body + 白色圆角订单卡（对齐原站截图形态） -->
<template>
  <Teleport to="body">
    <Transition name="pr-fade">
      <div v-if="visible" class="pr-mask" @click.self="handleClose">
        <div class="pr-dialog" role="dialog" aria-modal="true" aria-labelledby="pr-title">
          <!-- 头部：浅蓝底横条 -->
          <header class="pr-header">
            <h3 id="pr-title" class="pr-title">购买记录</h3>
            <button class="pr-close" aria-label="关闭" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </header>

          <!-- body：浅灰底可滚动区 -->
          <div class="pr-body">
            <!-- 空态 -->
            <p v-if="filtered.length === 0" class="pr-empty">暂无购买记录</p>

            <!-- 订单卡 -->
            <article
              v-for="(o, idx) in filtered"
              :key="o.id"
              class="pr-card"
              :style="{ animationDelay: `${Math.min(idx, 6) * 45}ms` }"
            >
              <!-- 行1：订单号 + 金额 -->
              <div class="pr-row-top">
                <span class="pr-order-no">{{ o.id }}</span>
                <span class="pr-amount"><i>¥</i>{{ yuanText(o.amount) }}</span>
              </div>

              <!-- 行2：商品名称 + 状态 chip -->
              <div class="pr-row-name">
                <span class="pr-name">{{ o.displayName || o.planName }}</span>
                <span class="pr-status" :class="statusChip(o).cls">{{ statusChip(o).text }}</span>
              </div>

              <!-- 行3：双列灰字 -->
              <div class="pr-grid">
                <span class="pr-cell"><span class="il">Token 总量：</span>{{ tokenTotal(o) }}</span>
                <span class="pr-cell"><span class="il">下单时间：</span>{{ fmtFull(o.createTime) }}</span>
              </div>

              <!-- 行3b：退款单追加 -->
              <div v-if="isRefunded(o)" class="pr-grid">
                <span class="pr-cell"><span class="il">退款金额：</span>{{ yuanText(o.refundAmount ?? 0) }}</span>
                <span class="pr-cell"><span class="il">退款时间：</span>{{ fmtFull(o.refundTime) }}</span>
              </div>

              <!-- cm/cq 连续扣费信息块 -->
              <div v-if="isContinuous(o)" class="pr-deduct">
                <div class="pr-deduct-item">
                  <span class="il">扣费周期：</span>
                  <span class="dv">{{ o.deductCycle === 'quarterly' ? '每3个月' : '每月' }}</span>
                </div>
                <div class="pr-deduct-item">
                  <span class="il">下次扣费时间：</span>
                  <span class="dv">{{ nextDeductLabel(o) }}</span>
                </div>
                <div class="pr-deduct-item">
                  <span class="il">自动续费状态：</span>
                  <span class="pr-renew" :class="o.autoRenewStatus === 'stopped' ? 'stopped' : 'active'">
                    {{ o.autoRenewStatus === 'stopped' ? '已关闭' : '已开启' }}
                  </span>
                </div>
              </div>

              <!-- 发票区：有发票 → 信息块 -->
              <div v-if="o.invoiceInfo" class="pr-invoice">
                <p class="pr-invoice-title">发票信息</p>
                <p class="pr-invoice-row"><span class="il">发票抬头：</span>{{ o.invoiceInfo.title }}</p>
                <p class="pr-invoice-row"><span class="il">发票类型：</span>{{ o.invoiceInfo.type }}</p>
                <p class="pr-invoice-row"><span class="il">收票人邮箱：</span>{{ o.invoiceInfo.email }}</p>
              </div>
              <!-- 发票区：无发票 → 申请发票按钮 -->
              <button
                v-else
                class="pr-invoice-btn"
                :class="{ applied: appliedIds.includes(o.id) }"
                :disabled="appliedIds.includes(o.id)"
                @click="applyInvoice(o)"
              >{{ appliedIds.includes(o.id) ? '已申请' : '申请发票' }}</button>
            </article>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useOrderStore } from '@/stores/orderStore';
import { useToastStore } from '@/stores/toastStore';
import { PlanType } from '@/types/plan';
import type { Order } from '@/types/order';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const userStore = useUserStore();
const orderStore = useOrderStore();
const toastStore = useToastStore();

/* ---------- 订单列表（弹层口径不变：展示当前用户全部订单卡） ---------- */
const filtered = computed<Order[]>(() => orderStore.recentOrders as Order[]);

/* ---------- 状态 chip ---------- */
const isRefunded = (o: Order) => o.refundAmount != null || o.refundTime != null;

const statusChip = (o: Order): { text: string; cls: string } => {
  if (isRefunded(o)) return { text: '已退款', cls: 'st-refunded' };
  if (o.status === 'queue') return { text: '排队待生效', cls: 'st-queue' };
  if (o.status === 'paid') return { text: '已完成', cls: 'st-done' };
  if (o.status === 'pending') return { text: '待支付', cls: 'st-pending' };
  if (o.status === 'cancelled') return { text: '已取消', cls: 'st-muted' };
  return { text: '支付失败', cls: 'st-failed' };
};

const isContinuous = (o: Order) =>
  o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY;

/* ---------- 格式化 ---------- */
/** 分 → 元：整数不带小数，否则两位小数 */
const yuanText = (cents: number) => {
  const y = cents / 100;
  return Number.isInteger(y) ? String(y) : y.toFixed(2);
};

/** Token 总量：去掉尾部 " Token" 单位词 */
const tokenTotal = (o: Order) => (o.tokenLabel ? o.tokenLabel.replace(/\s*Token$/, '') : '-');

const pad = (n: number) => String(n).padStart(2, '0');

const fmtFull = (d?: Date | string | '') => {
  if (!d) return '-';
  const t = new Date(d);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
};

const fmtDate = (d: Date | string) => {
  const t = new Date(d);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
};

const nextDeductLabel = (o: Order) =>
  o.autoRenewStatus === 'stopped' ? '-' : (o.nextDeductDate ? fmtDate(o.nextDeductDate) : '-');

/* ---------- 申请发票（原型演示，防重复） ---------- */
const appliedIds = ref<string[]>([]);

const applyInvoice = (o: Order) => {
  if (appliedIds.value.includes(o.id)) return;
  appliedIds.value.push(o.id);
  toastStore.push('发票申请已提交，开具后将发送至您的邮箱（原型演示）', 'success');
};

/* ---------- 开关逻辑 ---------- */
const handleClose = () => emit('update:visible', false);

watch(
  () => props.visible,
  async (v) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = v ? 'hidden' : '';
    }
    if (v) {
      const uid = userStore.userInfo?.id;
      if (uid) await orderStore.fetchUserOrders(uid);
    }
  }
);
</script>

<style scoped>
/* ---------- 遮罩与容器 ---------- */
.pr-mask {
  position: fixed;
  inset: 0;
  z-index: 1250;
  background: rgba(20, 20, 26, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.pr-dialog {
  display: flex;
  flex-direction: column;
  width: min(800px, 100%);
  max-height: 86vh;
  background: #f1f2f4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 72px rgba(10, 16, 40, 0.28);
  animation: pr-in 0.28s ease;
}

@keyframes pr-in {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---------- 头部：浅蓝横条 ---------- */
.pr-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 24px;
  background: #d8e5f5;
}

.pr-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.pr-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #333;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, color 0.2s;
}

.pr-close:hover {
  background: rgba(26, 26, 26, 0.08);
  color: #1a1a1a;
}

.pr-close svg {
  width: 17px;
  height: 17px;
}

/* ---------- body 可滚动区 ---------- */
.pr-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pr-body::-webkit-scrollbar {
  width: 6px;
}

.pr-body::-webkit-scrollbar-thumb {
  background: #cfd2d8;
  border-radius: 3px;
}

.pr-body::-webkit-scrollbar-track {
  background: transparent;
}

/* ---------- 空态 ---------- */
.pr-empty {
  margin: 0;
  padding: 88px 0;
  text-align: center;
  font-size: 14px;
  color: #999;
}

/* ---------- 订单卡 ---------- */
.pr-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(20, 20, 40, 0.05);
  animation: pr-card-in 0.34s ease both;
}

@keyframes pr-card-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 行1：订单号 + 金额 */
.pr-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pr-order-no {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  letter-spacing: 0.3px;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

.pr-amount {
  flex-shrink: 0;
  color: #f5222d;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.2px;
  font-variant-numeric: tabular-nums;
}

.pr-amount i {
  font-style: normal;
  font-size: 15px;
  font-weight: 600;
  margin-right: 2px;
}

/* 行2：名称 + 状态 chip */
.pr-row-name {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pr-name {
  font-size: 15px;
  color: #1a1a1a;
}

.pr-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.st-done {
  background: rgba(82, 196, 26, 0.12);
  color: #389e0d;
}

.st-refunded {
  background: #fce4d2;
  color: #e8652b;
}

.st-queue {
  background: rgba(250, 173, 20, 0.16);
  color: #ad6800;
}

.st-pending {
  background: rgba(24, 144, 255, 0.1);
  color: #0958d9;
}

.st-muted {
  background: #f2f3f5;
  color: #999;
}

.st-failed {
  background: rgba(255, 65, 65, 0.1);
  color: var(--brand-red);
}

/* 行3 / 行3b：双列灰字 */
.pr-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.pr-grid + .pr-grid {
  margin-top: 8px;
}

.pr-cell {
  font-size: 14px;
  color: #666;
  font-variant-numeric: tabular-nums;
}

.il {
  color: #999;
}

/* cm/cq 连续扣费信息块 */
.pr-deduct {
  margin-top: 14px;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
}

.pr-deduct-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  min-width: 0;
}

.pr-deduct-item .dv {
  color: #333;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* 自动续费状态点徽章 */
.pr-renew {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.6;
}

.pr-renew::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.pr-renew.active {
  background: rgba(82, 196, 26, 0.12);
  color: #389e0d;
}

.pr-renew.active::before {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.22);
}

.pr-renew.stopped {
  background: #f2f3f5;
  color: #8c8c8c;
}

/* 发票信息块 */
.pr-invoice {
  margin-top: 14px;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 16px 20px;
}

.pr-invoice-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.pr-invoice-row {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 2;
}

/* 申请发票按钮 */
.pr-invoice-btn {
  margin-top: 14px;
  height: 36px;
  padding: 0 20px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.pr-invoice-btn:hover:not(:disabled) {
  border-color: #999;
  color: #1a1a1a;
}

.pr-invoice-btn.applied,
.pr-invoice-btn:disabled {
  background: #f5f5f5;
  border-color: #e8e8e8;
  color: #bbb;
  cursor: not-allowed;
}

/* ---------- 过渡 ---------- */
.pr-fade-enter-active,
.pr-fade-leave-active {
  transition: opacity 0.22s ease;
}

.pr-fade-enter-from,
.pr-fade-leave-to {
  opacity: 0;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .pr-mask {
    padding: 12px 8px;
  }

  .pr-header {
    padding: 14px 16px;
  }

  .pr-body {
    padding: 12px 12px 16px;
  }

  .pr-card {
    padding: 18px 16px;
  }

  .pr-amount {
    font-size: 24px;
  }

  .pr-grid,
  .pr-deduct {
    grid-template-columns: 1fr;
  }
}
</style>
