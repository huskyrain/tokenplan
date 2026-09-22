<!-- src/views/AdminPage.vue -->
<!-- 后台管理页（原型复刻）：蓝色顶栏 + 左深灰侧栏 + 筛选区 + 用户订阅管理查询结果表
     表列序：手机号/套餐总数/续订排单/版本/套餐版本/当前套餐/套餐额度/已用百分比/有效期至/套餐状态/操作
     套餐版本口径：cm/cq 类套餐 → 连续订阅；月包/年包/词元宝等一次性类 → 标准订阅（与筛选区「套餐版本」联动） -->
<template>
  <AdminLayout active="user-sub">
        <div class="ad-page-title"><i aria-hidden="true"></i>用户订阅管理</div>

        <!-- 筛选区 -->
        <section class="ad-card ad-filter">
          <div class="ad-filter-grid">
            <div class="ad-field">
              <label for="ad-f-ver">套餐版本</label>
              <select id="ad-f-ver" v-model="draft.planVersion">
                <option value="">全部</option>
                <option value="continuous">连续订阅</option>
                <option value="standard">标准订阅</option>
              </select>
            </div>
            <div class="ad-field">
              <label for="ad-f-phone">用户搜索</label>
              <input id="ad-f-phone" v-model="draft.phone" type="text" placeholder="输入手机号" />
            </div>
            <div class="ad-field">
              <label for="ad-f-type">套餐类型</label>
              <select id="ad-f-type" v-model="draft.planType">
                <option value="">全部</option>
                <option v-for="t in PLAN_TYPE_OPTIONS" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="ad-field">
              <label for="ad-f-status">套餐状态</label>
              <select id="ad-f-status" v-model="draft.status">
                <option value="">全部</option>
                <option value="active">生效中</option>
                <option value="expired">已过期</option>
              </select>
            </div>
            <div class="ad-field">
              <label for="ad-f-queue">续订排单</label>
              <select id="ad-f-queue" v-model="draft.queue">
                <option value="">全部</option>
                <option value="yes">有排单</option>
                <option value="no">无排单</option>
              </select>
            </div>
          </div>
          <div class="ad-filter-actions">
            <button class="ad-btn ad-btn-plain" @click="resetFilter">重置</button>
            <button class="ad-btn ad-btn-primary" @click="applyFilter">查询</button>
          </div>
        </section>

        <!-- 查询结果 -->
        <section class="ad-card ad-result">
          <div class="ad-result-head">
            <h3>查询结果</h3>
            <button class="ad-btn ad-btn-primary" @click.prevent>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              导出
            </button>
          </div>

          <div class="ad-table-wrap">
            <table class="ad-table">
              <thead>
                <tr>
                  <th>手机号</th>
                  <th>套餐总数</th>
                  <th>续订排单</th>
                  <th>版本</th>
                  <th>套餐版本</th>
                  <th>当前套餐</th>
                  <th>套餐额度</th>
                  <th>已用百分比</th>
                  <th>有效期至</th>
                  <th>套餐状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="pageRows.length === 0">
                  <td colspan="11" class="ad-empty">暂无数据</td>
                </tr>
                <tr v-for="r in pageRows" :key="r.id">
                  <td>
                    <span class="ad-phone-cell">
                      {{ revealed.has(r.id) ? r.phone : r.phoneMasked }}
                      <button class="ad-eye" :title="revealed.has(r.id) ? '隐藏手机号' : '查看手机号'" @click="toggleEye(r.id)">
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
                  <td>{{ r.planCount }}</td>
                  <td>{{ r.renewQueue }}</td>
                  <td><a class="ad-link" href="#" @click.prevent>{{ r.version }}</a></td>
                  <td>{{ planVersionLabel(r.line) }}</td>
                  <td><span class="ad-chip">{{ r.currentPlan }}</span></td>
                  <td>{{ r.quota }}</td>
                  <td>{{ r.usedPct }}</td>
                  <td class="ad-time">{{ r.validUntil }}</td>
                  <td>
                    <span class="ad-status" :class="r.status">
                      <i aria-hidden="true"></i>{{ r.status === 'active' ? '生效中' : '已过期' }}
                    </span>
                  </td>
                  <td><a class="ad-link" href="#" @click.prevent>查看详情</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="ad-pager">
            <span class="ad-pager-total">共 {{ filtered.length }} 条</span>
            <select v-model.number="pageSize" class="ad-pager-size" aria-label="每页条数">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
            <button class="ad-page-btn" :disabled="page <= 1" aria-label="上一页" @click="page--">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <template v-for="(p, i) in pageItems" :key="i">
              <span v-if="p === '...'" class="ad-page-ellipsis">...</span>
              <button v-else class="ad-page-btn" :class="{ on: p === page }" @click="page = Number(p)">{{ p }}</button>
            </template>
            <button class="ad-page-btn" :disabled="page >= pageCount" aria-label="下一页" @click="page++">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <span class="ad-pager-jump">
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

/* ---------- 数据口径 ---------- */
/** 产品线：cm/cq 签约线 → 连续订阅；monthly/annual/cyb 一次性类 → 标准订阅 */
type Line = 'cm' | 'cq' | 'monthly' | 'annual' | 'cyb';
type PlanCategory = 'continuous' | 'standard';
type RowStatus = 'active' | 'expired';

interface AdminRow {
  id: number;
  phone: string;          // 明文手机号（眼睛展开态）
  phoneMasked: string;    // 脱敏手机号 137****0628
  planCount: number;
  renewQueue: number;
  version: string;        // 个人版 / 团队版
  line: Line;
  currentPlan: string;
  quota: string;
  usedPct: string;
  validUntil: string;
  status: RowStatus;
}

const CATEGORY_LABEL: Record<PlanCategory, string> = {
  continuous: '连续订阅',
  standard: '标准订阅'
};

const categoryOf = (line: Line): PlanCategory => (line === 'cm' || line === 'cq' ? 'continuous' : 'standard');
const planVersionLabel = (line: Line): string => CATEGORY_LABEL[categoryOf(line)];

/** 套餐类型筛选选项（当前套餐 chip 名称去重） */
const PLAN_TYPE_OPTIONS = [
  '体验版',
  'Token Plan 权益版 Plus',
  '联想百应 Token Plan1.7 旗舰版',
  '联想百应 Token Plan1.5 高级版',
  'L4 专业版-测试',
  '词元宝标准版'
];

/* ---------- mock 数据（基准截图 10 行 + 种子随机补足至 867 条） ---------- */
const VALID_UNTIL_POOL = [
  '2026-10-16 23:59:59',
  '2026-10-17 23:59:59',
  '2026-12-16 23:59:59',
  '2027-01-05 23:59:59',
  '2026-09-30 23:59:59'
];

const GEN_POOL: { name: string; quota: string; line: Line }[] = [
  { name: '体验版', quota: '3000万', line: 'cm' },
  { name: '体验版', quota: '3000万', line: 'monthly' },
  { name: 'Token Plan 权益版 Plus', quota: '1亿', line: 'cq' },
  { name: 'Token Plan 权益版 Plus', quota: '1亿', line: 'cm' },
  { name: '联想百应 Token Plan1.7 旗舰版', quota: '5亿', line: 'cm' },
  { name: '联想百应 Token Plan1.5 高级版', quota: '2亿', line: 'annual' },
  { name: 'L4 专业版-测试', quota: '3000万', line: 'monthly' },
  { name: '词元宝标准版', quota: '1亿', line: 'cyb' }
];

/** 种子随机（mulberry32）：保证每次刷新 mock 数据稳定 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const maskPhone = (phone: string): string => `${phone.slice(0, 3)}****${phone.slice(7)}`;

function buildRows(): AdminRow[] {
  // 基准截图首屏 10 行
  const base: Array<[string, number, number, string, Line, string, string, string, string, RowStatus]> = [
    ['13742140628', 3, 0, '个人版', 'cm', '体验版', '3000万', '0%', '2026-10-17 23:59:59', 'active'],
    ['17633278848', 2, 0, '个人版', 'cq', 'Token Plan 权益版 Plus', '1亿', '0%', '2026-12-16 23:59:59', 'active'],
    ['18659022833', 3, 0, '个人版', 'monthly', '体验版', '3000万', '0.03%', '2026-10-17 23:59:59', 'active'],
    ['15381465779', 1, 0, '个人版', 'cm', '联想百应 Token Plan1.7 旗舰版', '5亿', '1.01%', '2026-12-16 23:59:59', 'active'],
    ['17620585002', 1, 0, '个人版', 'cq', 'Token Plan 权益版 Plus', '1亿', '0.02%', '2026-12-16 23:59:59', 'active'],
    ['18774138999', 1, 0, '个人版', 'monthly', '体验版', '3000万', '0%', '2026-10-17 23:59:59', 'active'],
    ['15066359669', 1, 0, '个人版', 'annual', '联想百应 Token Plan1.5 高级版', '2亿', '0.35%', '2026-12-16 23:59:59', 'active'],
    ['17392805822', 2, 0, '个人版', 'monthly', 'L4 专业版-测试', '3000万', '0.28%', '2026-10-17 23:59:59', 'active'],
    ['13047611827', 1, 0, '个人版', 'cm', '联想百应 Token Plan1.7 旗舰版', '5亿', '0%', '2026-12-16 23:59:59', 'active'],
    ['18615940210', 2, 0, '个人版', 'monthly', '体验版', '3000万', '2.54%', '2026-10-16 23:59:59', 'active']
  ];

  const rows: AdminRow[] = base.map((b, i) => ({
    id: i + 1,
    phone: b[0],
    phoneMasked: maskPhone(b[0]),
    planCount: b[1],
    renewQueue: b[2],
    version: b[3],
    line: b[4],
    currentPlan: b[5],
    quota: b[6],
    usedPct: b[7],
    validUntil: b[8],
    status: b[9]
  }));

  // 种子随机补足至 867 条（分页演示：共 867 条 / 87 页）
  const rng = mulberry32(20260917);
  const PREFIX = ['130', '137', '139', '150', '153', '173', '176', '186', '187', '188'];
  while (rows.length < 867) {
    const i = rows.length;
    const pick = GEN_POOL[Math.floor(rng() * GEN_POOL.length)];
    const phone = `${PREFIX[Math.floor(rng() * PREFIX.length)]}${String(Math.floor(rng() * 10000)).padStart(4, '0')}${String(Math.floor(rng() * 10000)).padStart(4, '0')}`;
    const pct = rng() < 0.3 ? 0 : Math.round(rng() * 500) / 100;
    rows.push({
      id: i + 1,
      phone,
      phoneMasked: maskPhone(phone),
      planCount: 1 + Math.floor(rng() * 4),
      renewQueue: rng() < 0.15 ? 1 + Math.floor(rng() * 2) : 0,
      version: rng() < 0.9 ? '个人版' : '团队版',
      line: pick.line,
      currentPlan: pick.name,
      quota: pick.quota,
      usedPct: pct === 0 ? '0%' : `${pct.toFixed(2)}%`,
      validUntil: VALID_UNTIL_POOL[Math.floor(rng() * VALID_UNTIL_POOL.length)],
      status: rng() < 0.85 ? 'active' : 'expired'
    });
  }
  return rows;
}

const ROWS = buildRows();

/* ---------- 筛选（草稿 + 查询落定） ---------- */
interface FilterState {
  planVersion: '' | PlanCategory;
  phone: string;
  planType: string;
  status: '' | RowStatus;
  queue: '' | 'yes' | 'no';
}

const EMPTY_FILTER: FilterState = { planVersion: '', phone: '', planType: '', status: '', queue: '' };

const draft = reactive<FilterState>({ ...EMPTY_FILTER });
const applied = reactive<FilterState>({ ...EMPTY_FILTER });

const applyFilter = () => {
  Object.assign(applied, draft);
  page.value = 1;
};

const resetFilter = () => {
  Object.assign(draft, EMPTY_FILTER);
  Object.assign(applied, EMPTY_FILTER);
  page.value = 1;
};

const filtered = computed<AdminRow[]>(() =>
  ROWS.filter((r) => {
    if (applied.planVersion && categoryOf(r.line) !== applied.planVersion) return false;
    if (applied.phone && !r.phone.includes(applied.phone.trim())) return false;
    if (applied.planType && r.currentPlan !== applied.planType) return false;
    if (applied.status && r.status !== applied.status) return false;
    if (applied.queue === 'yes' && r.renewQueue === 0) return false;
    if (applied.queue === 'no' && r.renewQueue > 0) return false;
    return true;
  })
);

/* ---------- 分页 ---------- */
const page = ref(1);
const pageSize = ref(10);
const jumpPage = ref<number | null>(null);

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

/** 页码窗口：≤7 页全展示；首/尾贴边时展开 6 项 + 省略号（对齐截图 1 2 3 4 5 6 ... 87） */
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
</script>

<style scoped>
/* ---------- 查询结果 ---------- */
.ad-page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.ad-page-title i {
  width: 3px;
  height: 16px;
  border-radius: 1px;
  background: #1890ff;
}

.ad-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

/* ---------- 筛选区 ---------- */
.ad-filter {
  padding: 26px 24px 18px;
  margin-bottom: 20px;
}

.ad-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 28px;
}

.ad-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ad-field label {
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
}

.ad-field select,
.ad-field input {
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

.ad-field select:focus,
.ad-field input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.ad-field input::placeholder {
  color: #bfbfbf;
}

.ad-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

/* ---------- 按钮 ---------- */
.ad-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  white-space: nowrap;
}

.ad-btn svg {
  width: 14px;
  height: 14px;
}

.ad-btn-plain {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.ad-btn-plain:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.ad-btn-primary {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #fff;
}

.ad-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

/* ---------- 查询结果 ---------- */
.ad-result {
  padding: 20px 24px 24px;
}

.ad-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ad-result-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.ad-table-wrap {
  overflow-x: auto;
}

.ad-table {
  width: 100%;
  border-collapse: collapse;
}

.ad-table th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  white-space: nowrap;
}

.ad-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
}

.ad-phone-cell {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-variant-numeric: tabular-nums;
}

.ad-eye {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: #8c8c8c;
  cursor: pointer;
  transition: color 0.2s;
}

.ad-eye:hover {
  color: #1890ff;
}

.ad-eye svg {
  width: 15px;
  height: 15px;
}

.ad-link {
  color: #1890ff;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.ad-link:hover {
  color: #40a9ff;
}

/* 当前套餐浅蓝 chip */
.ad-chip {
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  background: #e6f7ff;
  color: #1890ff;
  font-size: 12px;
  line-height: 1.6;
}

.ad-time {
  font-variant-numeric: tabular-nums;
}

/* 套餐状态：绿点生效中 / 灰点已过期 */
.ad-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.ad-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ad-status.active {
  color: #52c41a;
}

.ad-status.active i {
  background: #52c41a;
}

.ad-status.expired {
  color: #8c8c8c;
}

.ad-status.expired i {
  background: #bfbfbf;
}

.ad-empty {
  color: #999;
  padding: 44px 0 !important;
}

/* ---------- 分页 ---------- */
.ad-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
  font-size: 13px;
  color: #666;
}

.ad-pager-total {
  margin-right: 4px;
}

.ad-pager-size {
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

.ad-page-btn {
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

.ad-page-btn svg {
  width: 14px;
  height: 14px;
}

.ad-page-btn:hover:not(:disabled):not(.on) {
  border-color: #1890ff;
  color: #1890ff;
}

.ad-page-btn.on {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.ad-page-btn:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.ad-page-ellipsis {
  color: #999;
  letter-spacing: 1px;
}

.ad-pager-jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
}

.ad-pager-jump input {
  width: 46px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  text-align: center;
  font-size: 13px;
  color: #333;
  outline: none;
}

.ad-pager-jump input:focus {
  border-color: #1890ff;
}

/* 隐藏 number input 原生步进箭头 */
.ad-pager-jump input::-webkit-outer-spin-button,
.ad-pager-jump input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.ad-pager-jump input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* ---------- 窄屏适配 ---------- */
@media (max-width: 1200px) {
  .ad-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .ad-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
