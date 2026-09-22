<!-- src/views/admin/TokenOrderListPage.vue -->
<!-- 后台 token 订单列表（截图1复刻+优化）：自营页签 + 11 项筛选（含业务类型新枚举）+ 状态页签
     分组行结构：组头行（主订单号蓝链/订单号/下单时间/首购订单ID）+ 服务行 + 捆绑/绑定互显行 + 组尾行（支付方式红字） -->
<template>
  <AdminLayout active="token-orders" top-active="商城">
    <div class="to-title"><i aria-hidden="true"></i>订单-token订单列表</div>

    <!-- 渠道页签 -->
    <div class="to-channel">
      <button class="to-channel-tab on">自营</button>
    </div>

    <!-- 筛选区 -->
    <section class="to-card to-filter">
      <div class="to-filter-grid">
        <div class="to-field">
          <label for="to-f-goods">商品名称/ID</label>
          <input id="to-f-goods" v-model="draft.goods" type="text" placeholder="请输入商品名称/ID" />
        </div>
        <div class="to-field">
          <label for="to-f-no">订单号</label>
          <input id="to-f-no" v-model="draft.orderNo" type="text" placeholder="请输入订单号" />
        </div>
        <div class="to-field">
          <label for="to-f-main">主订单号</label>
          <input id="to-f-main" v-model="draft.mainOrderNo" type="text" placeholder="请输入主订单号" />
        </div>
        <div class="to-field">
          <label for="to-f-pay">支付方式</label>
          <select id="to-f-pay" v-model="draft.payMethod">
            <option value="">请选择支付方式</option>
            <option v-for="m in ADMIN_PAY_METHODS" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="to-field">
          <label for="to-f-phone">下单人电话</label>
          <input id="to-f-phone" v-model="draft.phone" type="text" placeholder="请输入下单人电话" />
        </div>
        <div class="to-field">
          <label>下单时间段</label>
          <div class="to-range">
            <input v-model="draft.createFrom" type="date" aria-label="下单开始时间" />
            <span>-</span>
            <input v-model="draft.createTo" type="date" aria-label="下单结束时间" />
          </div>
        </div>
        <div class="to-field">
          <label>支付时间段</label>
          <div class="to-range">
            <input v-model="draft.payFrom" type="date" aria-label="支付开始时间" />
            <span>-</span>
            <input v-model="draft.payTo" type="date" aria-label="支付结束时间" />
          </div>
        </div>
        <div class="to-field">
          <label for="to-f-src">订单来源</label>
          <select id="to-f-src" v-model="draft.orderSource">
            <option value="">请选择订单来源</option>
            <option v-for="s in ADMIN_ORDER_SOURCES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="to-field">
          <label for="to-f-subsrc">订阅来源</label>
          <select id="to-f-subsrc" v-model="draft.subSource">
            <option value="">请选择订阅来源</option>
            <option v-for="s in ADMIN_SUB_SOURCES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="to-field">
          <label for="to-f-cust">客户类型</label>
          <select id="to-f-cust" v-model="draft.customerType">
            <option value="">全部</option>
            <option v-for="c in ADMIN_CUSTOMER_TYPES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="to-field">
          <label for="to-f-biz">业务类型</label>
          <select id="to-f-biz" v-model="draft.bizType">
            <option value="">全部</option>
            <option value="subscription">订阅</option>
            <option value="booster">加油包</option>
          </select>
        </div>
      </div>
      <div class="to-filter-actions">
        <button class="to-btn to-btn-plain" @click="resetFilter">重置</button>
        <button class="to-btn to-btn-primary" @click="applyFilter">查询</button>
      </div>
    </section>

    <!-- 状态页签 -->
    <div class="to-status-tabs">
      <button
        v-for="t in statusTabs"
        :key="t.key"
        class="to-status-tab"
        :class="{ on: appliedStatus === t.key }"
        @click="changeStatus(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 订单分组表 -->
    <section class="to-card to-result">
      <div class="to-table-wrap">
        <table class="to-table">
          <thead>
            <tr>
              <th class="c-id">编号</th>
              <th class="c-service">服务</th>
              <th>订单来源</th>
              <th>客户类型</th>
              <th>业务类型</th>
              <th>数量</th>
              <th>实收</th>
              <th>订阅来源</th>
              <th>下单人电话</th>
              <th>订单状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageRows.length === 0">
              <td colspan="11" class="to-empty">暂无数据</td>
            </tr>
            <template v-for="o in pageRows" :key="o.orderNo">
              <!-- 组头行 -->
              <tr class="to-head-row">
                <td colspan="11">
                  <span class="to-head-item">
                    主订单号：
                    <router-link class="to-link" :to="`/admin/token-orders/${o.orderNo}`">{{ o.mainOrderNo }}</router-link>
                  </span>
                  <span class="to-head-item">订单号：{{ o.orderNo }}</span>
                  <span class="to-head-item">下单时间：{{ o.createTime }}</span>
                  <span class="to-head-item">首购订单ID：{{ o.firstOrderId }}</span>
                </td>
              </tr>
              <!-- 服务行 -->
              <tr class="to-service-row">
                <td>{{ o.id }}</td>
                <td class="to-service-cell">
                  <span class="to-service-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="13" y2="17" />
                    </svg>
                  </span>
                  <span class="to-service-info">
                    <span class="to-service-name">{{ o.productName }}</span>
                    <span class="to-service-line">ID：{{ o.productId }}</span>
                    <span class="to-service-line">
                      套餐Token总量：{{ o.tokenTotal }}<em class="to-gap"></em>套餐有效期：{{ o.validDays }}
                    </span>
                  </span>
                </td>
                <td>{{ o.orderSource }}</td>
                <td>{{ o.customerType }}</td>
                <td>{{ ADMIN_BIZ_LABEL[o.bizType] }}</td>
                <td>{{ o.qty }}</td>
                <td class="to-actual">￥{{ o.actual / 100 }}</td>
                <td>{{ o.subSource }}</td>
                <td class="to-num">{{ o.phone }}</td>
                <td>{{ ADMIN_STATUS_LABEL[o.status] }}</td>
                <td>
                  <router-link class="to-link" :to="`/admin/token-orders/${o.orderNo}`">订单详情</router-link>
                </td>
              </tr>
              <!-- 捆绑/绑定互显行 -->
              <tr v-for="lr in listLinkRowsOf(o)" :key="`${o.orderNo}-${lr.orderNo}`" class="to-link-row">
                <td colspan="11">
                  <span class="to-link-label">{{ lr.label }}：</span>
                  <router-link class="to-link" :to="`/admin/token-orders/${lr.orderNo}`">{{ lr.orderNo }}</router-link>
                  <span class="to-link-desc">{{ lr.desc }}</span>
                </td>
              </tr>
              <!-- 组尾行 -->
              <tr class="to-tail-row">
                <td colspan="11">
                  支付方式：<span class="to-pay">{{ o.payMethod }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="to-pager">
        <span class="to-pager-total">共 {{ filtered.length }} 条</span>
        <select v-model.number="pageSize" class="to-pager-size" aria-label="每页条数">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
        <button class="to-page-btn" :disabled="page <= 1" aria-label="上一页" @click="page--">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <template v-for="(p, i) in pageItems" :key="i">
          <span v-if="p === '...'" class="to-page-ellipsis">...</span>
          <button v-else class="to-page-btn" :class="{ on: p === page }" @click="page = Number(p)">{{ p }}</button>
        </template>
        <button class="to-page-btn" :disabled="page >= pageCount" aria-label="下一页" @click="page++">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <span class="to-pager-jump">
          前往
          <input v-model.number="jumpPage" type="number" min="1" :max="pageCount" aria-label="跳转页码" @keyup.enter="goJump" />
          页
        </span>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import AdminLayout from '@/components/AdminLayout.vue';
import {
  adminTokenOrders,
  listLinkRowsOf,
  ADMIN_STATUS_LABEL,
  ADMIN_BIZ_LABEL,
  ADMIN_PAY_METHODS,
  ADMIN_ORDER_SOURCES,
  ADMIN_SUB_SOURCES,
  ADMIN_CUSTOMER_TYPES,
  type AdminOrderStatus,
  type AdminBizType,
  type AdminTokenOrder
} from '@/mock/adminMock';

/* ---------- 筛选（草稿 + 查询落定） ---------- */
interface FilterState {
  goods: string;
  orderNo: string;
  mainOrderNo: string;
  payMethod: string;
  phone: string;
  createFrom: string;
  createTo: string;
  payFrom: string;
  payTo: string;
  orderSource: string;
  subSource: string;
  customerType: string;
  bizType: '' | AdminBizType;
}

const EMPTY_FILTER: FilterState = {
  goods: '', orderNo: '', mainOrderNo: '', payMethod: '', phone: '',
  createFrom: '', createTo: '', payFrom: '', payTo: '',
  orderSource: '', subSource: '', customerType: '', bizType: ''
};

const draft = reactive<FilterState>({ ...EMPTY_FILTER });
const applied = reactive<FilterState>({ ...EMPTY_FILTER });

/** 状态页签（独立于筛选区，点击即生效） */
const appliedStatus = ref<'' | AdminOrderStatus>('');

const dayOf = (t: string): string => t.slice(0, 10);

const matchFields = (o: AdminTokenOrder, f: FilterState): boolean => {
  const g = f.goods.trim();
  if (g && !o.productName.includes(g) && !String(o.productId).includes(g)) return false;
  if (f.orderNo.trim() && !o.orderNo.includes(f.orderNo.trim())) return false;
  if (f.mainOrderNo.trim() && !o.mainOrderNo.includes(f.mainOrderNo.trim())) return false;
  if (f.payMethod && o.payMethod !== f.payMethod) return false;
  if (f.phone.trim() && !o.phone.includes(f.phone.trim())) return false;
  if (f.createFrom && dayOf(o.createTime) < f.createFrom) return false;
  if (f.createTo && dayOf(o.createTime) > f.createTo) return false;
  if (f.payFrom && (!o.payTime || dayOf(o.payTime) < f.payFrom)) return false;
  if (f.payTo && (!o.payTime || dayOf(o.payTime) > f.payTo)) return false;
  if (f.orderSource && o.orderSource !== f.orderSource) return false;
  if (f.subSource && o.subSource !== f.subSource) return false;
  if (f.customerType && o.customerType !== f.customerType) return false;
  if (f.bizType && o.bizType !== f.bizType) return false;
  return true;
};

/** 字段筛选（不含状态页签）：用于状态计数 */
const fieldFiltered = computed(() => adminTokenOrders.filter((o) => matchFields(o, applied)));

const STATUS_TAB_DEFS: Array<{ key: '' | AdminOrderStatus; label: string }> = [
  { key: '', label: '全部' },
  { key: 'pendingPay', label: '待付款' },
  { key: 'pendingDeliver', label: '待交付' },
  { key: 'refunding', label: '退款中' },
  { key: 'done', label: '已完成' },
  { key: 'failed', label: '交易失败' },
  { key: 'cancelled', label: '已取消' }
];

const statusTabs = computed(() =>
  STATUS_TAB_DEFS.map((t) => ({
    key: t.key,
    label: t.key === ''
      ? `全部(${fieldFiltered.value.length})`
      : t.label
  }))
);

const filtered = computed(() =>
  fieldFiltered.value.filter((o) => (appliedStatus.value ? o.status === appliedStatus.value : true))
);

const applyFilter = () => {
  Object.assign(applied, draft);
  page.value = 1;
};

const resetFilter = () => {
  Object.assign(draft, EMPTY_FILTER);
  Object.assign(applied, EMPTY_FILTER);
  appliedStatus.value = '';
  page.value = 1;
};

const changeStatus = (key: '' | AdminOrderStatus) => {
  appliedStatus.value = key;
  page.value = 1;
};

/* ---------- 分页 ---------- */
const page = ref(1);
const pageSize = ref(10);
const jumpPage = ref<number | null>(null);

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

/** 页码窗口：≤7 页全展示；首/尾贴边时展开 6 项 + 省略号 */
const pageItems = computed<Array<number | '...'>>(() => {
  const total = pageCount.value;
  const cur = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, 6, '...', total];
  if (cur >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', cur - 2, cur - 1, cur, cur + 1, cur + 2, '...', total];
});

watch(pageSize, () => {
  page.value = 1;
});

watch(pageCount, (c) => {
  if (page.value > c) page.value = c;
});

const goJump = () => {
  const n = Math.round(Number(jumpPage.value));
  if (!Number.isFinite(n)) return;
  page.value = Math.min(Math.max(1, n), pageCount.value);
  jumpPage.value = null;
};
</script>

<style scoped>
.to-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.to-title i {
  width: 3px;
  height: 16px;
  border-radius: 1px;
  background: #1890ff;
}

.to-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

/* ---------- 渠道页签 ---------- */
.to-channel {
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.to-channel-tab {
  padding: 10px 28px;
  border: 1px solid #e8e8e8;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #fff;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}

.to-channel-tab.on {
  border-top: 2px solid #1890ff;
  font-weight: 500;
}

/* ---------- 筛选区 ---------- */
.to-filter {
  padding: 26px 24px 18px;
  margin-bottom: 20px;
}

.to-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 28px;
}

.to-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.to-field label {
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.to-field select,
.to-field input[type='text'] {
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

.to-field select:focus,
.to-field input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.to-field input::placeholder {
  color: #bfbfbf;
}

/* 时间段双日期 */
.to-range {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.to-range:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.to-range input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 12.5px;
  color: #333;
  background: transparent;
}

.to-range span {
  color: #bfbfbf;
}

.to-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

/* ---------- 按钮 ---------- */
.to-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.to-btn-plain {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.to-btn-plain:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.to-btn-primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
}

.to-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

/* ---------- 状态页签 ---------- */
.to-status-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.to-status-tab {
  padding: 10px 22px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.to-status-tab:hover {
  color: #1890ff;
}

.to-status-tab.on {
  color: #1890ff;
  font-weight: 500;
}

.to-status-tab.on::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 2px;
  background: #1890ff;
}

/* ---------- 分组表格 ---------- */
.to-result {
  padding: 8px 0 24px;
}

.to-table-wrap {
  overflow-x: auto;
}

.to-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.to-table th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  white-space: nowrap;
}

.to-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 14px 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}

.to-table th.c-service,
.to-service-cell {
  text-align: left;
}

/* 组头行 */
.to-head-row td {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
  padding: 10px 16px;
  text-align: left;
  font-size: 13px;
  color: #666;
}

.to-head-item {
  margin-right: 28px;
}

/* 服务行 */
.to-service-cell {
  min-width: 320px;
}

.to-service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-right: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
  color: #bfbfbf;
  vertical-align: middle;
}

.to-service-icon svg {
  width: 18px;
  height: 18px;
}

.to-service-info {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  vertical-align: middle;
  text-align: left;
}

.to-service-name {
  font-weight: 500;
  color: #333;
}

.to-service-line {
  color: #666;
  font-size: 12.5px;
}

.to-gap {
  display: inline-block;
  width: 24px;
}

.to-actual {
  color: #f5222d;
  font-weight: 500;
}

.to-num {
  font-variant-numeric: tabular-nums;
}

/* 捆绑/绑定互显行 */
.to-link-row td {
  background: #f5faff;
  border-bottom: 1px solid #e6f2ff;
  padding: 9px 16px 9px 76px;
  text-align: left;
  font-size: 12.5px;
}

.to-link-label {
  color: #666;
}

.to-link-desc {
  margin-left: 10px;
  color: #666;
}

/* 组尾行 */
.to-tail-row td {
  border-bottom: 6px solid #f0f2f5;
  padding: 10px 16px;
  text-align: left;
  color: #666;
}

.to-pay {
  color: #f5222d;
}

.to-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.to-link:hover {
  color: #40a9ff;
}

.to-empty {
  color: #999;
  padding: 44px 0 !important;
}

/* ---------- 分页 ---------- */
.to-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 16px 0;
  font-size: 13px;
  color: #666;
}

.to-pager-total {
  margin-right: 4px;
}

.to-pager-size {
  height: 32px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  font-size: 13px;
  color: #333;
  outline: none;
  cursor: pointer;
}

.to-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.to-page-btn svg {
  width: 14px;
  height: 14px;
}

.to-page-btn:hover:not(:disabled):not(.on) {
  border-color: #1890ff;
  color: #1890ff;
}

.to-page-btn.on {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.to-page-btn:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.to-page-ellipsis {
  color: #999;
  letter-spacing: 1px;
}

.to-pager-jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
}

.to-pager-jump input {
  width: 46px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  text-align: center;
  font-size: 13px;
  color: #333;
  outline: none;
}

.to-pager-jump input:focus {
  border-color: #1890ff;
}

.to-pager-jump input::-webkit-outer-spin-button,
.to-pager-jump input::-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.to-pager-jump input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* ---------- 窄屏适配 ---------- */
@media (max-width: 1200px) {
  .to-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .to-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
