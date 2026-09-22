<!-- src/views/admin/AutoRenewManagePage.vue -->
<!-- 后台自动续费管理：购买连续订阅套餐用户的自动续费状态数据
     列表（手机号脱敏/自动续费状态/业务产品/商品名称/累计连续扣费次数）+ 每行「查看操作日志」弹窗
     弹窗展示该手机号针对 Token Plan 的连续扣费开启/关闭操作记录（时间倒序），数据源=现有日志种子按手机号过滤 -->
<template>
  <AdminLayout active="auto-renew">
    <div class="ar-title"><i aria-hidden="true"></i>自动续费管理</div>

    <!-- 筛选区 -->
    <section class="ar-card ar-filter">
      <div class="ar-filter-grid">
        <div class="ar-field">
          <label for="ar-f-phone">手机号</label>
          <input id="ar-f-phone" v-model="draft.phone" type="text" placeholder="输入手机号搜索" />
        </div>
        <div class="ar-field">
          <label for="ar-f-renew">自动续费状态</label>
          <select id="ar-f-renew" v-model="draft.autoRenew">
            <option value="">全部</option>
            <option value="on">已开启</option>
            <option value="off">已关闭</option>
          </select>
        </div>
        <div class="ar-field">
          <label for="ar-f-channel">支付渠道</label>
          <select id="ar-f-channel" v-model="draft.payChannel">
            <option value="">全部</option>
            <option value="微信支付">微信支付</option>
            <option value="支付宝支付">支付宝支付</option>
          </select>
        </div>
      </div>
      <div class="ar-filter-actions">
        <button class="ar-btn ar-btn-plain" @click="resetFilter">重置</button>
        <button class="ar-btn ar-btn-primary" @click="applyFilter">查询</button>
      </div>
    </section>

    <!-- 数据列表 -->
    <section class="ar-card ar-result">
      <div class="ar-result-head">
        <h3>自动续费用户</h3>
        <span class="ar-result-total">共 {{ filtered.length }} 条</span>
      </div>
      <div class="ar-table-wrap">
        <table class="ar-table">
          <thead>
            <tr>
              <th>手机号</th>
              <th>自动续费状态</th>
              <th>业务产品</th>
              <th>商品名称</th>
              <th>支付渠道</th>
              <th>累计连续扣费次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="ar-empty">暂无数据</td>
            </tr>
            <tr v-for="r in filtered" :key="r.id">
              <td>
                <span class="ar-phone-cell">
                  {{ revealed.has(r.id) ? r.phone : r.phoneMasked }}
                  <button
                    class="ar-eye"
                    :title="revealed.has(r.id) ? '隐藏手机号' : '查看手机号'"
                    @click="toggleEye(r.id)"
                  >
                    <svg v-if="!revealed.has(r.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </span>
              </td>
              <td>
                <span class="ar-renew" :class="r.autoRenew">{{ r.autoRenew === 'on' ? '已开启' : '已关闭' }}</span>
              </td>
              <td>{{ BIZ_PRODUCT }}</td>
              <td><span class="ar-chip">{{ productName(r) }}</span></td>
              <td><span class="ar-channel" :class="r.payChannel === '微信支付' ? 'wechat' : 'alipay'">{{ r.payChannel }}</span></td>
              <td class="ar-num">{{ r.deductCount }}</td>
              <td>
                <a class="ar-link" href="#" @click.prevent="openLogs(r)">查看操作日志</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 操作日志弹窗 -->
    <div v-if="logModal.open" class="ar-mask" @click.self="closeLogs">
      <div class="ar-modal" role="dialog" aria-modal="true" aria-label="操作日志">
        <div class="ar-modal-head">
          <h3>操作日志 - {{ logModal.phoneMasked }}</h3>
          <button class="ar-modal-x" title="关闭" @click="closeLogs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="ar-modal-body">
          <div class="ar-modal-sub">业务产品：{{ BIZ_PRODUCT }} · 连续扣费开启/关闭记录（按时间倒序）</div>
          <div class="ar-table-wrap ar-log-wrap">
            <table class="ar-table">
              <thead>
                <tr>
                  <th>操作时间</th>
                  <th>操作</th>
                  <th>操作者</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="modalLogs.length === 0">
                  <td colspan="4" class="ar-empty">暂无操作日志</td>
                </tr>
                <tr v-for="l in modalLogs" :key="l.id">
                  <td class="ar-num">{{ l.time }}</td>
                  <td>
                    <span class="ar-action" :class="actionLabel(l.action) === '开启连续扣费' ? 'on' : 'off'">
                      {{ actionLabel(l.action) }}
                    </span>
                  </td>
                  <td>
                    <span class="ar-operator" :class="operatorClass(l.operator)">{{ l.operator }}</span>
                  </td>
                  <td>
                    <span class="ar-result-tag" :class="l.result === '成功' ? 'ok' : 'fail'">{{ l.result }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ar-modal-foot">
          <button class="ar-btn ar-btn-plain" @click="closeLogs">取消</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminLayout from '@/components/AdminLayout.vue';
import {
  renewRows,
  renewLogs,
  type RenewOperator,
  type RenewAction,
  type RenewRow,
  type PayChannel
} from '@/mock/adminMock';

/** 业务产品固定值 */
const BIZ_PRODUCT = 'Token Plan';

/* ---------- 筛选 ---------- */
interface FilterState {
  phone: string;
  autoRenew: '' | 'on' | 'off';
  payChannel: '' | PayChannel;
}

const EMPTY_FILTER: FilterState = { phone: '', autoRenew: '', payChannel: '' };
const draft = reactive<FilterState>({ ...EMPTY_FILTER });
const applied = reactive<FilterState>({ ...EMPTY_FILTER });

const applyFilter = () => Object.assign(applied, draft);
const resetFilter = () => {
  Object.assign(draft, EMPTY_FILTER);
  Object.assign(applied, EMPTY_FILTER);
};

const filtered = computed(() =>
  renewRows.filter((r) => {
    if (applied.phone && !r.phone.includes(applied.phone.trim()) && !r.phoneMasked.includes(applied.phone.trim())) return false;
    if (applied.autoRenew && r.autoRenew !== applied.autoRenew) return false;
    if (applied.payChannel && r.payChannel !== applied.payChannel) return false;
    return true;
  })
);

/* ---------- 手机号明文切换 ---------- */
const revealed = ref<Set<number>>(new Set());
const toggleEye = (id: number) => {
  const s = revealed.value;
  if (s.has(id)) {
    s.delete(id);
  } else {
    s.add(id);
  }
};

/** 商品名称 = 套餐名 + 额度label，如「基础版 2.4亿 Token」 */
const productName = (r: RenewRow): string => `${r.planName} ${r.quotaLabel}`;

/* ---------- 操作日志弹窗 ---------- */
const logModal = reactive<{ open: boolean; phoneMasked: string }>({ open: false, phoneMasked: '' });

const openLogs = (r: RenewRow) => {
  logModal.phoneMasked = r.phoneMasked;
  logModal.open = true;
};
const closeLogs = () => {
  logModal.open = false;
};

/** 连续扣费「开启/关闭」操作映射（周期扣费等非开关操作不计入） */
const ACTION_LABEL: Partial<Record<RenewAction, '开启连续扣费' | '关闭连续扣费'>> = {
  签约开启: '开启连续扣费',
  开启连续订阅: '开启连续扣费',
  关闭连续订阅: '关闭连续扣费'
};

const actionLabel = (a: RenewAction): string => ACTION_LABEL[a] ?? a;

/** 当前手机号针对 Token Plan 的连续扣费开关记录，按时间倒序 */
const modalLogs = computed(() =>
  renewLogs
    .filter((l) => l.phoneMasked === logModal.phoneMasked && l.action in ACTION_LABEL)
    .slice()
    .sort((a, b) => b.time.localeCompare(a.time))
);

const operatorClass = (op: RenewOperator): string =>
  ({ 用户: 'user', 微信平台: 'wechat', 系统: 'system', 后台管理员: 'admin' })[op];
</script>

<style scoped>
.ar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.ar-title i {
  width: 3px;
  height: 16px;
  border-radius: 1px;
  background: #1890ff;
}

.ar-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

/* ---------- 筛选区 ---------- */
.ar-filter {
  padding: 26px 24px 18px;
  margin-bottom: 20px;
}

.ar-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 28px;
}

.ar-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ar-field label {
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.ar-field select,
.ar-field input {
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

.ar-field select:focus,
.ar-field input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.ar-field input::placeholder {
  color: #bfbfbf;
}

.ar-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

/* ---------- 按钮 ---------- */
.ar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.ar-btn-plain {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.ar-btn-plain:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.ar-btn-primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
}

.ar-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

/* ---------- 表格 ---------- */
.ar-result {
  padding: 20px 24px 24px;
  margin-bottom: 20px;
}

.ar-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ar-result-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.ar-result-total {
  font-size: 13px;
  color: #666;
}

.ar-table-wrap {
  overflow-x: auto;
}

.ar-log-wrap {
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.ar-table {
  width: 100%;
  border-collapse: collapse;
}

.ar-table th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  white-space: nowrap;
}

.ar-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 13px 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
}

.ar-num {
  font-variant-numeric: tabular-nums;
}

/* ---------- 手机号明文切换 ---------- */
.ar-phone-cell {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-variant-numeric: tabular-nums;
}

.ar-eye {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.2s;
}

.ar-eye:hover {
  color: #1890ff;
}

.ar-eye svg {
  width: 15px;
  height: 15px;
}

/* ---------- 蓝链 ---------- */
.ar-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.ar-link:hover {
  color: #40a9ff;
}

.ar-chip {
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  background: #e6f7ff;
  color: #1890ff;
  font-size: 12px;
  line-height: 1.6;
}

/* 支付渠道徽章 */
.ar-channel {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
}

.ar-channel.wechat {
  border: 1px solid #b7eb8f;
  background: #f6ffed;
  color: #389e0d;
}

.ar-channel.alipay {
  border: 1px solid #91d5ff;
  background: #e6f7ff;
  color: #1677ff;
}

/* 自动续费状态徽章：已开启绿 / 已关闭灰 */
.ar-renew {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
}

.ar-renew.on {
  border: 1px solid #b7eb8f;
  background: #f6ffed;
  color: #52c41a;
}

.ar-renew.off {
  border: 1px solid #d9d9d9;
  background: #fafafa;
  color: #8c8c8c;
}

.ar-empty {
  color: #999;
  padding: 44px 0 !important;
}

/* ---------- 弹窗 ---------- */
.ar-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
}

.ar-modal {
  width: min(720px, 100%);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.ar-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.ar-modal-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.ar-modal-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.ar-modal-x:hover {
  color: #1890ff;
  background: #f5f5f5;
}

.ar-modal-x svg {
  width: 16px;
  height: 16px;
}

.ar-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
}

.ar-modal-sub {
  margin-bottom: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.ar-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

/* ---------- 日志弹窗内标签 ---------- */
.ar-action {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
}

.ar-action.on {
  border: 1px solid #b7eb8f;
  background: #f6ffed;
  color: #52c41a;
}

.ar-action.off {
  border: 1px solid #ffccc7;
  background: #fff1f0;
  color: #f5222d;
}

.ar-operator {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  line-height: 1.6;
}

.ar-operator.user {
  background: #e6f7ff;
  color: #1890ff;
}

.ar-operator.wechat {
  background: #f6ffed;
  color: #52c41a;
}

.ar-operator.system {
  background: #fafafa;
  border: 1px solid #d9d9d9;
  color: #8c8c8c;
}

.ar-operator.admin {
  background: #fff7e6;
  color: #fa8c16;
}

.ar-result-tag {
  font-size: 12px;
}

.ar-result-tag.ok {
  color: #52c41a;
}

.ar-result-tag.fail {
  color: #f5222d;
}

/* ---------- 窄屏适配 ---------- */
@media (max-width: 1200px) {
  .ar-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .ar-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
