<!-- src/views/admin/TokenOrderDetailPage.vue -->
<!-- 后台 token 订单详情（截图2复刻）：操作信息表 + 订单信息双列 + 联系人 + 商品信息 + 费用信息 + 到账信息
     新增「关联订单」块：双向展示绑定/捆绑订单行（同列表口径，蓝链互跳） -->
<template>
  <AdminLayout active="token-orders" top-active="商城">
    <template v-if="order">
      <!-- 操作信息 -->
      <section class="td-card">
        <div class="td-sec-head">
          <span class="td-sec-title"><i aria-hidden="true"></i>操作信息</span>
          <span class="td-head-actions">
            <button
              v-if="isBooster"
              class="td-refund-btn"
              :disabled="isRefunded"
              :title="isRefunded ? '已退款' : '退款该加油包订单'"
              @click="refundModalOpen = true"
            >退款</button>
            <router-link class="td-link" to="/admin/token-orders">返回列表</router-link>
          </span>
        </div>
        <div class="td-sec-body">
          <p class="td-cur-status">当前订单状态：
            <span v-if="order.status === 'refunded'" class="td-badge td-badge-red">{{ ADMIN_STATUS_LABEL[order.status] }}</span>
            <span v-else>{{ ADMIN_STATUS_LABEL[order.status] }}</span>
          </p>
          <table class="td-table">
            <thead>
              <tr>
                <th>操作者</th>
                <th>操作时间</th>
                <th>订单状态</th>
                <th>付款状态</th>
                <th>交付状态</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in opRows" :key="i">
                <td>{{ r.operator }}</td>
                <td class="td-num">{{ r.time }}</td>
                <td>{{ r.orderStatus }}</td>
                <td>{{ r.payStatus }}</td>
                <td>{{ r.deliverStatus }}</td>
                <td>{{ r.remark }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 退款信息（退款成功后展示） -->
      <section v-if="order.refundInfo" class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>退款信息</span></div>
        <div class="td-sec-body td-refund-info">
          <div class="td-info-row"><dt>退款单号：</dt><dd class="td-num">{{ order.refundInfo.refundNo }}</dd></div>
          <div class="td-info-row"><dt>退款金额：</dt><dd class="td-red">￥{{ yuan(order.refundInfo.amount) }}</dd></div>
          <div class="td-info-row"><dt>退款原因：</dt><dd>{{ order.refundInfo.reason }}</dd></div>
          <div class="td-info-row"><dt>退款时间：</dt><dd class="td-num">{{ order.refundInfo.time }}</dd></div>
          <div class="td-info-row"><dt>操作人：</dt><dd><span class="td-badge td-badge-blue">{{ order.refundInfo.operator }}</span></dd></div>
        </div>
      </section>

      <!-- 订单信息 -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>订单信息</span></div>
        <div class="td-sec-body td-info-grid">
          <dl class="td-info-col">
            <div class="td-info-row"><dt>付款时间：</dt><dd class="td-num">{{ order.payTime ?? '—' }}</dd></div>
            <div class="td-info-row"><dt>下单时间：</dt><dd class="td-num">{{ order.createTime }}</dd></div>
            <div class="td-info-row"><dt>发票抬头：</dt><dd>{{ order.invoiceTitle ?? '—' }}</dd></div>
            <div class="td-info-row"><dt>收票人邮箱</dt><dd>{{ order.invoiceEmail ?? '—' }}</dd></div>
            <div class="td-info-row"><dt>订单来源</dt><dd>{{ order.orderSource }}</dd></div>
            <div class="td-info-row"><dt>客户类型</dt><dd>{{ order.customerType }}</dd></div>
            <div class="td-info-row"><dt>首购订单ID</dt><dd class="td-num">{{ order.firstOrderId }}</dd></div>
          </dl>
          <dl class="td-info-col">
            <div class="td-info-row"><dt>支付方式：</dt><dd>{{ order.payMethod }}</dd></div>
            <div class="td-info-row"><dt>订单号：</dt><dd class="td-num">{{ order.orderNo }}</dd></div>
            <div class="td-info-row"><dt>发票类型：</dt><dd>{{ order.invoiceType ?? '—' }}</dd></div>
            <div class="td-info-row"><dt>电子发票</dt><dd>{{ order.invoiceType ? '是' : '—' }}</dd></div>
            <div class="td-info-row"><dt>订阅来源</dt><dd>{{ order.subSource }}</dd></div>
            <div class="td-info-row"><dt>业务类型</dt><dd>{{ ADMIN_BIZ_LABEL[order.bizType] }}</dd></div>
          </dl>
        </div>
      </section>

      <!-- 联系人信息 -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>联系人信息</span></div>
        <div class="td-sec-body">
          <div class="td-info-row"><dt>下单人手机号：</dt><dd class="td-num">{{ order.phone }}</dd></div>
        </div>
      </section>

      <!-- 商品信息 -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>商品信息</span></div>
        <div class="td-sec-body">
          <table class="td-table">
            <thead>
              <tr>
                <th>商品名称（SKU）[ 品牌 ]</th>
                <th>商品ID</th>
                <th>规格</th>
                <th>PN号</th>
                <th>物料编号</th>
                <th>套餐Token总量</th>
                <th>套餐有效期</th>
                <th>数量</th>
                <th>单价</th>
                <th>实收款</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="td-sku">
                  <span class="td-sku-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="13" y2="17" />
                    </svg>
                  </span>
                  <b>{{ order.productName }}[联想]</b>
                </td>
                <td class="td-num">{{ order.productId }}</td>
                <td>{{ order.spec }}</td>
                <td class="td-num">{{ order.pn }}</td>
                <td class="td-num">{{ order.materialNo }}</td>
                <td>{{ order.tokenTotal }}</td>
                <td>{{ order.validDays }}</td>
                <td>{{ order.qty }}</td>
                <td>￥{{ yuan(order.unitPrice) }}</td>
                <td>￥{{ yuan(order.actual) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 关联订单（绑定/捆绑双向互显） -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>关联订单</span></div>
        <div class="td-sec-body">
          <p v-if="related.length === 0" class="td-none">暂无关联订单</p>
          <div v-for="r in related" :key="`${r.label}-${r.orderNo}`" class="td-rel-row">
            <span class="td-rel-label">{{ r.label }}：</span>
            <router-link class="td-link" :to="`/admin/token-orders/${r.orderNo}`">{{ r.orderNo }}</router-link>
            <span class="td-rel-desc">{{ r.desc }}</span>
          </div>
        </div>
      </section>

      <!-- 关联加油包订单（当前订单为套餐单且捆绑加油包非空时渲染） -->
      <section v-if="bundledBoosters.length > 0" class="td-card">
        <div class="td-sec-head">
          <span class="td-sec-title"><i aria-hidden="true"></i>关联加油包订单（{{ bundledBoosters.length }}）</span>
        </div>
        <div class="td-sec-body">
          <table class="td-table">
            <thead>
              <tr>
                <th>加油包订单号</th>
                <th>商品名称</th>
                <th>订单金额</th>
                <th>订单状态</th>
                <th>下单时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in bundledBoosters" :key="b.orderNo">
                <td class="td-num">
                  <router-link class="td-link" :to="`/admin/token-orders/${b.orderNo}`">{{ b.orderNo }}</router-link>
                </td>
                <td>加油包 {{ b.tokenTotal }} × {{ b.qty }}</td>
                <td class="td-red">￥{{ yuan(b.unitPrice * b.qty) }}</td>
                <td>
                  <span class="td-badge" :class="b.status === 'refunded' ? 'td-badge-red' : 'td-badge-gray'">
                    {{ ADMIN_STATUS_LABEL[b.status] }}
                  </span>
                </td>
                <td class="td-num">{{ b.createTime }}</td>
                <td>
                  <router-link v-if="b.status !== 'refunded'" class="td-link" :to="`/admin/token-orders/${b.orderNo}`">退款</router-link>
                  <span v-else class="td-op-off" title="已退款">已退款</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 费用信息 -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>费用信息</span></div>
        <div class="td-sec-body td-money">
          <p class="td-money-line">
            <span class="td-money-k">商品总金额：</span>￥{{ yuan(goodsTotal) }}
            <span class="td-money-k">- 优惠额度：</span>￥0
            <span class="td-money-k">- 商家改价：</span>￥0
            <span class="td-money-k">- 使用店铺优惠券：</span>￥0
            <span class="td-money-k">- 使用平台优惠券：</span>￥0
            <span class="td-money-k">- 订单满减优惠：</span>￥0
          </p>
          <p class="td-money-line"><span class="td-money-k">=订单总金额：</span><span class="td-red">￥{{ yuan(goodsTotal) }}</span></p>
          <p class="td-money-line"><span class="td-money-k">已付款金额：</span>￥{{ yuan(order.actual) }}</p>
          <p class="td-money-line"><span class="td-money-k">=应付金额：</span><span class="td-red">￥{{ yuan(goodsTotal - order.actual) }}</span></p>
        </div>
      </section>

      <!-- 到账信息 -->
      <section class="td-card">
        <div class="td-sec-head"><span class="td-sec-title"><i aria-hidden="true"></i>到账信息</span></div>
        <div class="td-sec-body td-money">
          <p class="td-money-line td-money-k">商家实收：付款金额 - 交易手续费 - 平台服务费 - 带货分佣</p>
          <p class="td-money-line"><span class="td-money-k">支付手续费：</span>3.2%: ￥{{ yuan(fee) }}</p>
          <p class="td-money-line"><span class="td-money-k">平台服务费按销售额固定比例：</span>0.00%: ￥0</p>
          <p class="td-money-line"><span class="td-money-k">商家实收：</span><span class="td-red">￥{{ yuan(order.actual - fee) }}</span></p>
        </div>
      </section>

      <!-- 退款确认弹窗（仅加油包订单退款按钮触发） -->
      <div
        v-if="refundModalOpen"
        class="td-mask"
        role="dialog"
        aria-modal="true"
        aria-label="退款确认"
        @click.self="refundModalOpen = false"
      >
        <div class="td-modal">
          <div class="td-modal-head">
            <span class="td-modal-title">退款确认</span>
            <button class="td-modal-close" aria-label="关闭" @click="refundModalOpen = false">×</button>
          </div>
          <div class="td-modal-body">
            <div class="td-modal-row"><span class="td-modal-k">订单号：</span><span class="td-num">{{ order.orderNo }}</span></div>
            <div class="td-modal-row"><span class="td-modal-k">退款金额：</span><span class="td-red">￥{{ yuan(refundAmount) }}</span></div>
            <div class="td-modal-row">
              <span class="td-modal-k">退款原因：</span>
              <select id="td-refund-reason" v-model="refundReason" class="td-modal-select">
                <option v-for="r in ADMIN_REFUND_REASONS" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
          </div>
          <div class="td-modal-foot">
            <button class="td-btn td-btn-plain" @click="refundModalOpen = false">取消</button>
            <button class="td-btn td-btn-primary" @click="confirmRefund">确认退款</button>
          </div>
        </div>
      </div>
    </template>

    <!-- 订单不存在 -->
    <section v-else class="td-card">
      <div class="td-sec-head">
        <span class="td-sec-title"><i aria-hidden="true"></i>订单详情</span>
        <router-link class="td-link" to="/admin/token-orders">返回列表</router-link>
      </div>
      <div class="td-sec-body">
        <p class="td-none">订单不存在或已删除</p>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '@/components/AdminLayout.vue';
import { useToastStore } from '@/stores/toastStore';
import {
  findAdminOrder,
  relatedOrdersOf,
  refundAdminOrder,
  ADMIN_STATUS_LABEL,
  ADMIN_BIZ_LABEL,
  ADMIN_REFUND_REASONS,
  type AdminRefundReason,
  type AdminTokenOrder
} from '@/mock/adminMock';

const route = useRoute();

const order = computed(() => findAdminOrder(String(route.params.id ?? '')));

/** 金额（分）→ 展示：整数不带小数，否则两位小数 */
const yuan = (cents: number): string => {
  const v = cents / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
};

const goodsTotal = computed(() => (order.value ? order.value.unitPrice * order.value.qty : 0));
/** 支付手续费 3.2%（分，四舍五入） */
const fee = computed(() => (order.value ? Math.round(order.value.actual * 0.032) : 0));

const related = computed(() => (order.value ? relatedOrdersOf(order.value) : []));

/* ---------- 退款能力（仅加油包订单） ---------- */
const toast = useToastStore();

/** 当前订单是否加油包订单（仅此类展示退款入口） */
const isBooster = computed(() => order.value?.bizType === 'booster');
/** 是否已退款（退款按钮置灰） */
const isRefunded = computed(() => order.value?.status === 'refunded');

/** 套餐单关联的加油包订单行（空数据不渲染区块） */
const bundledBoosters = computed<AdminTokenOrder[]>(() => {
  const o = order.value;
  if (!o || o.bizType !== 'subscription') return [];
  return (o.bundledBoosterNos ?? [])
    .map((no) => findAdminOrder(no))
    .filter((b): b is AdminTokenOrder => Boolean(b));
});

/** 退款金额 = 订单金额（单价 × 数量） */
const refundAmount = computed(() => (order.value ? order.value.unitPrice * order.value.qty : 0));

const refundModalOpen = ref(false);
const refundReason = ref<AdminRefundReason>('用户申请');

/** 确认退款：mock 置状态+写退款信息 → 关弹窗 + toast */
const confirmRefund = (): void => {
  const o = order.value;
  if (!o || o.status === 'refunded') return;
  refundAdminOrder(o.orderNo, refundReason.value);
  refundModalOpen.value = false;
  toast.push('退款成功', 'success');
};

/* ---------- 操作信息行（新→旧） ---------- */
interface OpRow {
  operator: string;
  time: string;
  orderStatus: string;
  payStatus: string;
  deliverStatus: string;
  remark: string;
}

const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
    d.getHours()
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

/** 时间字符串平移 n 秒（操作信息行推导用） */
const shiftSeconds = (t: string, sec: number): string =>
  fmtDate(new Date(new Date(t.replace(/-/g, '/')).getTime() + sec * 1000));

const opRows = computed<OpRow[]>(() => {
  const o = order.value;
  if (!o) return [];
  const rows: OpRow[] = [
    { operator: '买家', time: o.createTime, orderStatus: '已确认', payStatus: '未支付', deliverStatus: '未交付', remark: '用户下单' }
  ];
  if (o.payTime) {
    rows.push({ operator: '买家', time: o.payTime, orderStatus: '已分单', payStatus: '已支付', deliverStatus: '已交付', remark: '支付成功' });
  }
  switch (o.status) {
    case 'done':
      rows.push({
        operator: 'system',
        time: o.payTime ? shiftSeconds(o.payTime, 1) : o.createTime,
        orderStatus: '已分单', payStatus: '已支付', deliverStatus: '已交付',
        remark: '服务单生效，订单已完成'
      });
      break;
    case 'pendingDeliver':
      rows.push({
        operator: 'system',
        time: o.payTime ? shiftSeconds(o.payTime, 1) : o.createTime,
        orderStatus: '待交付', payStatus: '已支付', deliverStatus: '未交付',
        remark: '服务单待交付'
      });
      break;
    case 'refunding':
      rows.push({
        operator: 'system',
        time: o.payTime ? shiftSeconds(o.payTime, 3600) : o.createTime,
        orderStatus: '退款中', payStatus: '退款中', deliverStatus: '已停止',
        remark: '用户申请退款，审核中'
      });
      break;
    case 'failed':
      rows.push({
        operator: 'system',
        time: shiftSeconds(o.createTime, 120),
        orderStatus: '交易失败', payStatus: '未支付', deliverStatus: '未交付',
        remark: '支付超时，订单关闭'
      });
      break;
    case 'cancelled':
      rows.push({
        operator: '买家',
        time: shiftSeconds(o.createTime, 300),
        orderStatus: '已取消', payStatus: '未支付', deliverStatus: '未交付',
        remark: '用户取消订单'
      });
      break;
    case 'refunded':
      rows.push({
        operator: o.refundInfo?.operator ?? '后台管理员',
        time: o.refundInfo?.time ?? o.createTime,
        orderStatus: '已退款', payStatus: '已退款', deliverStatus: '已停止',
        remark: `后台退款：${o.refundInfo?.reason ?? ''}`
      });
      break;
    default:
      break;
  }
  return rows.reverse();
});
</script>

<style scoped>
.td-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 20px;
}

.td-sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.td-sec-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.td-sec-title i {
  width: 3px;
  height: 14px;
  border-radius: 1px;
  background: #1890ff;
}

.td-sec-body {
  padding: 20px 24px 24px;
}

.td-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.td-link:hover {
  color: #40a9ff;
}

.td-cur-status {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.td-cur-status span {
  color: #1890ff;
}

/* 提升特异性，避免被 .td-cur-status span 覆盖徽章文字色 */
.td-cur-status .td-badge.td-badge-red {
  color: rgb(245, 34, 45);
}

/* ---------- 表格 ---------- */
.td-table {
  width: 100%;
  border-collapse: collapse;
}

.td-table th {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  padding: 11px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  white-space: nowrap;
}

.td-table td {
  border: 1px solid #f0f0f0;
  padding: 13px 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  white-space: nowrap;
}

.td-num {
  font-variant-numeric: tabular-nums;
}

.td-sku {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.td-sku-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
  color: #bfbfbf;
}

.td-sku-icon svg {
  width: 16px;
  height: 16px;
}

/* ---------- 订单信息双列 ---------- */
.td-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 64px;
}

.td-info-col {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.td-info-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13px;
}

.td-info-row dt {
  flex-shrink: 0;
  min-width: 84px;
  text-align: right;
  color: #666;
}

.td-info-row dd {
  margin: 0;
  color: #333;
}

/* ---------- 关联订单 ---------- */
.td-rel-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid #e6f2ff;
  border-radius: 4px;
  background: #f5faff;
  font-size: 13px;
}

.td-rel-row + .td-rel-row {
  margin-top: 10px;
}

.td-rel-label {
  color: #666;
}

.td-rel-desc {
  color: #666;
}

.td-none {
  margin: 4px 0;
  color: #999;
  font-size: 13px;
}

/* ---------- 费用/到账 ---------- */
.td-money {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.td-money-line {
  margin: 0;
  font-size: 13px;
  color: #333;
}

.td-money-k {
  color: #666;
}

.td-red {
  color: #f5222d;
  font-weight: 500;
}

/* ---------- 操作区/退款按钮 ---------- */
.td-head-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.td-refund-btn {
  height: 30px;
  padding: 0 18px;
  border: 1px solid #1890ff;
  border-radius: 2px;
  background: #1890ff;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.td-refund-btn:hover:not(:disabled) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.td-refund-btn:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

/* ---------- 状态/操作人徽章 ---------- */
.td-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 10px;
  border: 1px solid transparent;
  border-radius: 2px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.td-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.td-badge-red {
  color: #f5222d;
  background: #fff1f0;
  border-color: #ffa39e;
}

.td-badge-gray {
  color: #666;
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.td-badge-blue {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #91d5ff;
}

.td-op-off {
  color: #bfbfbf;
  font-size: 13px;
  cursor: not-allowed;
}

/* ---------- 退款信息块 ---------- */
.td-refund-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---------- 退款确认弹窗 ---------- */
.td-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.td-modal {
  width: 420px;
  max-width: calc(100vw - 48px);
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  animation: td-modal-in 0.18s ease-out;
}

@keyframes td-modal-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.td-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.td-modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.td-modal-close {
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.td-modal-close:hover {
  color: #333;
}

.td-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.td-modal-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

.td-modal-k {
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
  color: #666;
}

.td-modal-select {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  font-size: 13px;
  color: #333;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.td-modal-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.td-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 24px 16px;
  border-top: 1px solid #f0f0f0;
}

.td-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.td-btn-plain {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.td-btn-plain:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.td-btn-primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
}

.td-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

@media (max-width: 900px) {
  .td-info-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px 0;
  }
}
</style>
