<!-- src/views/SubscriptionManagePage.vue -->
<!-- 订阅管理页：二级页签（标准版/团队版）+ 左侧导航（首页/API Key/用量）+ 右侧卡片流 -->
<template>
  <div class="sm-page" :class="{ 'sm-no-side': noSideLayout }">
    <!-- 居中二级页签 -->
    <div class="sm-tabs">
      <button :class="{ on: tab === 'std' }" @click="tab = 'std'">标准版</button>
      <button :class="{ on: tab === 'team' }" @click="tab = 'team'">团队版</button>
    </div>

    <div class="sm-body">
      <!-- 左侧导航（标准版） -->
      <aside v-if="tab === 'std'" class="sm-side">
        <button :class="{ on: view === 'home' }" @click="view = 'home'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
            <polyline points="9 21 9 13 15 13 15 21" />
          </svg>
          <span>首页</span>
        </button>
        <button :class="{ on: view === 'apikey' }" @click="view = 'apikey'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <span>API Key</span>
        </button>
        <button :class="{ on: view === 'usage' }" @click="view = 'usage'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          <span>用量</span>
        </button>
      </aside>

      <!-- 右侧主内容列 -->
      <div class="sm-main">
        <!-- ============ 团队版页签 ============ -->
        <template v-if="tab === 'team'">
          <!-- ① 团队版订阅卡（演示用户G：团队域已支付订单） -->
          <section v-if="teamOrders.length > 0" class="sm-card team-ov-card">
            <div v-for="o in teamOrders" :key="o.id" class="team-ov-item">
              <div class="team-ov-head">
                <span class="team-ov-name">{{ o.displayName || o.planName }}</span>
                <span class="team-ov-badge">生效中</span>
              </div>
              <div class="team-ov-meta">
                <span>套餐额度：{{ o.tokenLabel || fmtNum(o.quota ?? 0) + ' Token' }}</span>
                <span>有效期：{{ fmtDate(o.startDate ?? o.paidTime ?? o.createTime) }} 至 {{ fmtDate(o.endDate ?? '') }}</span>
                <span>订单金额：¥{{ fmtYuan(o.amount) }}</span>
              </div>
            </div>
            <p class="team-ov-note">团队版 Token 资源包与词元宝硬件由团队管理员统一交付，如需扩容请联系专属顾问。</p>
          </section>

          <!-- 团队版空态 -->
          <section v-else class="sm-card team-card">
            <p class="team-title">暂无团队版订阅</p>
            <button class="btn-outline" @click="goTeam">前往了解</button>
          </section>
        </template>

        <!-- ============ 视图1 首页 ============ -->
        <template v-else-if="view === 'home'">
          <!-- 卡A 订阅概览（生效中 / 已过期均呈现） -->
          <section v-if="activeSub || isExpiredSub" class="sm-card ov-card">
            <div class="ov-cols">
              <!-- 左：红色渐变套餐卡（③ 过期态降灰：名称+已过期黑chip+剩余天数0） -->
              <div class="ov-plan" :class="{ 'ov-plan-expired': isExpiredSub }">
                <div class="ov-plan-top">
                  <span class="ov-plan-name">{{ sub?.planName }}</span>
                  <span v-if="!isExpiredSub" class="ov-plan-type">{{ planTypeLabel }}</span>
                  <span v-if="isExpiredSub" class="ov-badge-expired">已过期</span>
                  <span v-else class="ov-badge">生效中</span>
                  <span v-if="isRenewalStopped" class="ov-badge-stopped">自动续费已停止</span>
                </div>
                <div class="ov-days">
                  <span class="ov-days-label">剩余天数</span>
                  <span class="ov-days-num">{{ remainingDays }}</span>
                  <span class="ov-days-unit">天</span>
                </div>
              </div>

              <!-- 中：剩余 Token（③ 过期态整体降活，与「剩余额度已失效」口径一致） -->
              <div class="ov-mid" :class="{ 'ov-mid-expired': isExpiredSub }">
                <p class="ov-label">剩余Token</p>
                <p class="ov-amount">
                  <span class="ov-num">{{ fmtNum(remaining) }}</span>
                  <span class="ov-quota">/总额度{{ quotaLabel }}</span>
                </p>
                <div class="ov-pct-row">
                  <span class="ov-pct">剩余{{ remainPct }}%</span>
                  <!-- ③ 过期态红字提示（截图1口径）：ⓘ tooltip 说明额度随服务单失效 -->
                  <span v-if="isExpiredSub" class="ov-expired-note">
                    套餐已过期，剩余额度已失效
                    <span class="ov-note-info" title="剩余额度随服务单失效同步作废，不可继续使用；续订支付成功后额度在新周期重置">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="11" x2="12" y2="16" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </span>
                  </span>
                  <span v-else-if="expiringSoon" class="ov-expire">套餐即将到期，剩余 {{ remainingDays }} 天</span>
                </div>
                <div class="ov-bars" aria-hidden="true">
                  <i v-for="i in BAR_COUNT" :key="i" :class="{ fill: i <= filledBars }"></i>
                </div>
                <p class="ov-period">套餐有效期 {{ fmtFull(sub?.startDate) }} 至 {{ fmtFull(sub?.endDate) }}</p>

                <!-- ⑥ 扣费信息区（仅cm/cq生效中显示） -->
                <div v-if="isContinuous && !isExpiredSub" class="ov-deduct-info">
                  <div class="deduct-row">
                    <span class="deduct-label">扣费周期：</span>
                    <span class="deduct-value">{{ deductCycleText }}</span>
                  </div>
                  <div class="deduct-row">
                    <span class="deduct-label">下次扣费时间：</span>
                    <span class="deduct-value">{{ nextDeductText }}</span>
                  </div>
                  <div class="deduct-row">
                    <span class="deduct-label">自动续费状态：</span>
                    <span class="renew-badge" :class="isRenewalStopped ? 'renew-stopped' : 'renew-active'">{{ isRenewalStopped ? '已关闭' : '已开启' }}</span>
                  </div>
                  <!-- ② 如何取消连续扣费指引链接 -->
                  <a
                    href="#"
                    class="cancel-guide-link"
                    @click.prevent="guideModalVisible = true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>如何取消连续扣费</span>
                  </a>
                </div>
              </div>

              <!-- 右：状态驱动操作区 -->
              <div class="ov-actions">
                <!-- ⑤ 过期态：续订按钮打开续订弹窗 -->
                <button v-if="isExpiredSub" class="btn-red" @click="renewModalVisible = true">续订</button>
                <template v-else-if="isContinuous">
                  <button v-if="isRenewalStopped" class="btn-red" @click="handleResumeRenewal">续订</button>
                </template>
                <button v-else class="btn-red" @click="openAnnualRenew">续订</button>
              </div>
            </div>

            <!-- 卡内底部状态条 -->
            <div class="ov-status">
              <!-- 排队年包信息行 -->
              <div v-if="queuedOrder" class="info-row queued-row">
                <span class="ir-title">排队年包：{{ queuedOrder.planName }}</span>
                <span class="ir-desc">{{ fmtShort(queuedOrder.expectedStartDate) }} 生效</span>
              </div>

              <!-- 续费已停止说明行 -->
              <p v-if="isContinuous && isRenewalStopped" class="info-row stopped-row">
                {{
                  queuedOrder
                    ? `因已购买接续生效的年包，本${planTypeLabel}将于当前周期末停止服务，不再自动扣费。`
                    : `已停止自动续费，本${planTypeLabel}将于当前周期末停止服务，不再自动扣费；如需继续使用请点击「续订」。`
                }}
              </p>

              <!-- 预约到期购买提醒按钮 -->
              <div v-if="isRenewalStopped && !hasExpiryReminder" class="stopped-actions">
                <button class="btn-outline" @click="handleBookExpiryReminder">预约到期购买提醒</button>
              </div>
            </div>
          </section>

          <!-- ① 加油包商品卡（④ 无生效服务单时不渲染：加油包随服务单同步失效） -->
          <section v-if="boosterStore.validBoosterPacks.length > 0 && userStore.hasActiveServiceOrder" class="sm-card booster-card">
            <h3 class="booster-card-title">加油包</h3>
            <div class="booster-list">
              <div
                v-for="pack in boosterStore.validBoosterPacks"
                :key="pack.id"
                class="booster-item"
              >
                <div class="booster-item-header">
                  <span class="booster-name">加油包 {{ pack.tokenLabel }}</span>
                  <span class="booster-badge">生效中</span>
                </div>
                <div class="booster-remaining">
                  <span class="booster-remaining-label">剩余Token</span>
                  <span class="booster-remaining-num">{{ fmtNum(pack.remaining) }}</span>
                </div>
                <div class="booster-pct-row">
                  <span class="booster-pct">剩余{{ boosterPct(pack) }}%</span>
                </div>
                <div class="booster-bars" aria-hidden="true">
                  <i v-for="i in BOOSTER_BAR_COUNT" :key="i" :class="{ fill: i <= boosterFilled(pack) }"></i>
                </div>
                <p class="booster-period">有效期 {{ fmtDate(pack.createTime) }} 至 {{ fmtDate(pack.expireTime) }}（随绑定服务单同步失效）</p>
              </div>
            </div>
          </section>

          <!-- ① 无生效订阅空态：内嵌商品页签面板（双组页签 + 套餐卡 + 完整购买功能，同主页行为） -->
          <section v-if="!activeSub && !isExpiredSub" class="sm-card embed-card">
            <div class="embed-head">
              <p class="embed-title">暂无生效中的订阅</p>
              <p class="embed-desc">选择适合您的套餐，支付成功后立即生效</p>
            </div>
            <PlanMarketPanel embedded :tab="embedTab" @update:tab="embedTab = $event" />
          </section>

          <!-- 卡B 消耗趋势 -->
          <section class="sm-card">
            <UsageTrendChart title="消耗趋势" />
          </section>

          <!-- 卡C 购买/领取记录 -->
          <section class="sm-card rec-card">
            <div class="rec-head">
              <h3 class="rec-title">购买/领取记录</h3>
            </div>
            <div class="rec-table-wrap">
              <table class="rec-table">
                <thead>
                  <tr>
                    <th>商品名称</th>
                    <th>套餐属性</th>
                    <th>生效时间</th>
                    <th>失效时间</th>
                    <th>额度</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredRows.length === 0">
                    <td colspan="6" class="rec-empty">暂无记录</td>
                  </tr>
                  <tr v-for="r in filteredRows" :key="r.id">
                    <td class="rec-name">{{ r.name }}</td>
                    <td><span class="attr-chip" :class="r.attrClass">{{ r.attr }}</span></td>
                    <td>{{ fmtFull(r.startTime) }}</td>
                    <td>{{ fmtFull(r.endTime) }}</td>
                    <td>{{ r.quota === null ? '-' : fmtNum(r.quota) }}</td>
                    <td>
                      <span class="status-pill" :class="r.statusClass">{{ r.statusText }}</span>
                      <span v-if="r.statusSub" class="status-sub">{{ r.statusSub }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- ============ 视图2 API Key ============ -->
        <template v-else-if="view === 'apikey'">
          <section class="sm-card key-card">
            <h3 class="sm-card-title">API Key</h3>
            <div class="key-box">
              <div class="key-main">
                <p class="key-name">默认 API Key</p>
                <code class="key-value">sk-**** **** ****1234</code>
              </div>
              <button class="btn-outline" @click="copyKey">复制</button>
            </div>
            <p class="key-time">创建时间：{{ KEY_CREATED_AT }}</p>
            <p class="key-warn">API Key 是调用凭证，请勿公开分享或上传至公开代码仓库。</p>
          </section>
        </template>

        <!-- ============ 视图3 用量 ============ -->
        <template v-else>
          <section class="sm-card usage-card">
            <h3 class="sm-card-title">用量</h3>
            <div class="usage-summary">
              <div class="us-item">
                <span class="us-label">总额度</span>
                <span class="us-num">{{ fmtNum(quota) }}</span>
              </div>
              <div class="us-item">
                <span class="us-label">已消耗</span>
                <span class="us-num">{{ fmtNum(consumed) }}</span>
              </div>
              <div class="us-item">
                <span class="us-label">剩余</span>
                <span class="us-num">{{ fmtNum(remaining) }}</span>
              </div>
            </div>
            <UsageTrendChart title="消耗趋势" />
          </section>
        </template>
      </div>
    </div>

    <!-- 年包续订排单流程弹窗 -->
    <PurchaseModal v-model:visible="purchaseModalVisible" :order="purchasePayload" @success="onPurchaseSuccess" />

    <!-- ⑤ 过期态续订弹窗（连续包月|连续包季|月包），传入当前过期订阅供顶部标题/当前套餐块/同档匹配 -->
    <RenewModal v-model:visible="renewModalVisible" :sub="sub" @success="onRenewSuccess" />

    <!-- 如何取消连续扣费（微信支付）图文指引弹窗 -->
    <CancelDeductGuideModal v-model:visible="guideModalVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useOrderStore } from '@/stores/orderStore';
import { useBoosterStore } from '@/stores/boosterStore';
import { usePlanStore } from '@/stores/planStore';
import { useToastStore } from '@/stores/toastStore';
import { createOrder, bookExpiryReminder } from '@/api/order';
import { PlanType, SubscriptionMode } from '@/types/plan';
import type { Plan, Subscription, PlanTabKey } from '@/types/plan';
import type { Order, BoosterPack } from '@/types/order';
import PlanMarketPanel from '@/components/PlanMarketPanel.vue';
import PurchaseModal, { PurchasePayload } from '@/components/PurchaseModal.vue';
import RenewModal from '@/components/RenewModal.vue';
import UsageTrendChart from '@/components/UsageTrendChart.vue';
import CancelDeductGuideModal from '@/components/CancelDeductGuideModal.vue';

const DAY = 24 * 60 * 60 * 1000;
/** 分段进度条竖条数 */
const BAR_COUNT = 45;
/** 加油包分段进度条竖条数 */
const BOOSTER_BAR_COUNT = 30;
const KEY_CREATED_AT = '2026-01-06 10:24:31';

const userStore = useUserStore();
const orderStore = useOrderStore();
const boosterStore = useBoosterStore();
const planStore = usePlanStore();
const toastStore = useToastStore();
const router = useRouter();

/* ---------- 视图状态 ---------- */
const tab = ref<'std' | 'team'>('std');
const view = ref<'home' | 'apikey' | 'usage'>('home');

/** ① 空态内嵌商品面板的当前二级页签 */
const embedTab = ref<PlanTabKey>('cm');

/** ① 团队版订阅卡数据源：团队域已支付订单（Order.team 标记） */
const teamOrders = computed<Order[]>(() =>
  (orderStore.recentOrders as Order[]).filter((o) => o.team && o.status === 'paid')
);
const fmtYuan = (fen: number) => (fen / 100).toLocaleString('zh-CN');

/** 图文指引弹窗可见性（仅 cm/cq 入口开启） */
const guideModalVisible = ref(false);

/* ---------- 订阅状态派生 ---------- */
/**
 * 时间口径过期判定（概览卡过期样式的唯一命中开关）：
 * - status 已为 expired / cancelled → 过期
 * - status 仍为 active 但 endDate 已过 → 同样判为过期
 *   （订阅状态不会实时回写，若仅依赖 status 字段，周期自然结束后概览卡
 *    仍会呈现「生效中 + 剩余天数 0 天」，过期样式全部不命中）
 */
const isSubTimeExpired = (s: Subscription): boolean => {
  if (s.status !== 'active') return true;
  if (!s.endDate) return false;
  const end = new Date(s.endDate).getTime();
  return Number.isFinite(end) && end <= Date.now();
};

/**
 * 概览卡数据源选择优先级：
 * 1. 主订阅 active 且未过期 → 直接使用
 * 2. 主订阅不活跃时，检查 activeOrders 中是否有生效订单（排除加油包/词元宝）→ 派生展示
 *    多条生效并存时：签约线(cm/cq)优先于一次性(月包/年包)
 * 3. 无任何生效订阅 → 返回主订阅，并按时间口径归一化 status
 *    （过期态：降灰+已过期徽章+剩余额度已失效提示+续订入口）
 */
const sub = computed<Subscription | null>(() => {
  const mainSub = userStore.userSubscription;

  // 1. 主订阅 active 且 endDate 未过期 → 直接使用
  if (mainSub && mainSub.status === 'active') {
    const end = mainSub.endDate ? new Date(mainSub.endDate).getTime() : Infinity;
    if (end > Date.now()) {
      return mainSub;
    }
  }

  // 2. 主订阅不活跃，从 activeOrders 中寻找生效中的服务订单
  const orders = (userStore.activeOrders as Order[]).filter(
    (o) => o.planType !== PlanType.BOOSTER && o.planType !== PlanType.TOKEN_KEY
  );
  if (orders.length > 0) {
    // 签约线优先于一次性
    const continuousOrder = orders.find(
      (o) => o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY
    );
    const target = continuousOrder || orders[0];
    const isCont = target.planType === PlanType.CONTINUOUS_MONTHLY || target.planType === PlanType.CONTINUOUS_QUARTERLY;
    return {
      id: `derived_${target.id}`,
      userId: target.userId,
      planId: target.planId,
      planName: target.planName,
      planType: target.planType,
      startDate: target.startDate ?? target.paidTime ?? target.createTime,
      endDate: target.endDate,
      status: 'active',
      subscriptionMode: isCont
        ? SubscriptionMode.CONTINUOUS_RENEWAL
        : (target.planType === PlanType.ANNUAL ? SubscriptionMode.MANUAL_QUEUE : SubscriptionMode.ONE_TIME),
      renewalStopped: false
    };
  }

  // 3. 无任何生效订阅 → 返回主订阅（可能为过期态）
  //    status 仍为 active 但周期已结束时归一化为 expired，确保过期样式必然命中
  if (!mainSub) return null;
  return isSubTimeExpired(mainSub) ? { ...mainSub, status: 'expired' } : mainSub;
});

const activeSub = computed(() => !!sub.value && !isSubTimeExpired(sub.value));
const isContinuous = computed(
  () => activeSub.value && sub.value?.subscriptionMode === SubscriptionMode.CONTINUOUS_RENEWAL
);

const queuedOrder = computed(() => userStore.queuedOrder);
const isRenewalStopped = computed(() => !!sub.value?.renewalStopped);
/**
 * ⑤ 订阅已过期（概览卡呈现灰降卡 + 已过期 chip + 粉底红字 + 续订按钮）
 * 命中链路：sub 非空 且 （status 非 active 或 endDate 已过）
 */
const isExpiredSub = computed(() => !!sub.value && isSubTimeExpired(sub.value));

/**
 * 无数据内嵌视图布局开关（侧栏隐藏条件）：
 * 仅命中「标准tab 且 首页视图 且 无标准订阅数据（生效中/过期均无）」，
 * 即内嵌商品面板视图（暂无生效中的订阅标题区+双组页签+卡片网格）渲染时。
 * 团队tab、有数据态（B/C/D/E/F）、API Key/用量视图均不命中，保持原双栏布局；
 * G/A 态购买生效后 activeSub 置真，双栏布局自动恢复。
 */
const noSideLayout = computed(
  () => tab.value === 'std' && view.value === 'home' && !activeSub.value && !isExpiredSub.value
);

/** 当前订阅对应套餐（取 quota） */
const currentPlan = computed<Plan | null>(() => {
  if (!sub.value) return null;
  const all = [
    ...planStore.plans[PlanType.CONTINUOUS_MONTHLY],
    ...planStore.plans[PlanType.CONTINUOUS_QUARTERLY],
    ...planStore.plans[PlanType.MONTHLY_ONETIME],
    ...planStore.plans[PlanType.ANNUAL]
  ];
  return all.find((p) => p.id === sub.value?.planId) ?? null;
});

/** 套餐类型标签 */
const planTypeLabel = computed(() => {
  const pt = sub.value?.planType;
  switch (pt) {
    case PlanType.CONTINUOUS_MONTHLY: return '连续包月';
    case PlanType.CONTINUOUS_QUARTERLY: return '连续包季';
    case PlanType.MONTHLY_ONETIME: return '月包';
    case PlanType.ANNUAL: return '年包';
    default: return '套餐';
  }
});

/** 是否已预约到期提醒 */
const hasExpiryReminder = computed(() => !!userStore.expiryReminder);

const quota = computed(() => currentPlan.value?.quota ?? 0);
/** mock：消耗数据默认全 0 */
const consumed = 0;
const remaining = computed(() => Math.max(0, quota.value - consumed));
const remainPct = computed(() =>
  quota.value > 0 ? Math.round((remaining.value / quota.value) * 100) : 0
);
const remainingDays = computed(() => {
  const end = sub.value?.endDate;
  if (!end) return 0;
  return Math.max(0, Math.floor((new Date(end).getTime() - Date.now()) / DAY));
});
/** 粉色即将到期徽章：仅剩余 ≤7 天时显示 */
const expiringSoon = computed(() => activeSub.value && remainingDays.value <= 7);
const filledBars = computed(() =>
  quota.value > 0 ? Math.round((remaining.value / quota.value) * BAR_COUNT) : 0
);

const quotaLabel = computed(() => {
  const n = quota.value;
  if (n >= 100000000) {
    const v = n / 100000000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}亿`;
  }
  if (n >= 10000) {
    const v = n / 10000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}万`;
  }
  return String(n);
});

/* ---------- ⑥ 扣费信息派生（仅 cm/cq） ---------- */
const activeOrder = computed(() => {
  if (!isContinuous.value) return null;
  const orders = orderStore.recentOrders as Order[];
  return orders.find(
    (o) => o.planId === sub.value?.planId &&
      (o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY) &&
      o.status === 'paid'
  ) ?? null;
});

const deductCycleText = computed(() => {
  const o = activeOrder.value;
  if (!o) return '-';
  return o.deductCycle === 'quarterly' ? '每 3 个月' : '每月';
});

const nextDeductText = computed(() => {
  if (isRenewalStopped.value) return '-';
  const o = activeOrder.value;
  if (!o?.nextDeductDate) return '-';
  return fmtDate(o.nextDeductDate);
});

/* ---------- ① 加油包卡片辅助 ---------- */
const boosterPct = (pack: BoosterPack) =>
  pack.tokenAmount > 0 ? Math.round((pack.remaining / pack.tokenAmount) * 100) : 0;

const boosterFilled = (pack: BoosterPack) =>
  pack.tokenAmount > 0 ? Math.round((pack.remaining / pack.tokenAmount) * BOOSTER_BAR_COUNT) : 0;

/* ---------- 购买/领取记录行 ---------- */
interface RecordRow {
  id: string;
  name: string;
  attr: string;
  attrClass: string;
  deductCount: number;
  startTime: Date | string;
  endTime: Date | string;
  quota: number | null;
  statusText: string;
  statusSub: string;
  statusClass: string;
  isContinuous: boolean;
  planType: PlanType | undefined;
}

/** 产品线→属性文案（④ cm/cq 行统一展示「连续订阅」；⑤ 加油包行展示「订阅」） */
const planTypeAttr = (pt?: PlanType): string => {
  switch (pt) {
    case PlanType.CONTINUOUS_MONTHLY: return '连续订阅';
    case PlanType.CONTINUOUS_QUARTERLY: return '连续订阅';
    case PlanType.MONTHLY_ONETIME: return '月包';
    case PlanType.ANNUAL: return '年包';
    case PlanType.TOKEN_KEY: return '词元宝';
    case PlanType.BOOSTER: return '订阅';
    default: return '其他';
  }
};

/** 产品线→属性 chip 样式名 */
const planTypeAttrClass = (pt?: PlanType): string => {
  switch (pt) {
    case PlanType.CONTINUOUS_MONTHLY: return 'attr-cm';
    case PlanType.CONTINUOUS_QUARTERLY: return 'attr-cq';
    case PlanType.MONTHLY_ONETIME: return 'attr-monthly';
    case PlanType.ANNUAL: return 'attr-annual';
    case PlanType.TOKEN_KEY: return 'attr-tokenkey';
    case PlanType.BOOSTER: return 'attr-booster';
    default: return 'attr-default';
  }
};

/** ④ 订单状态→记录表展示口径：生效中(绿) / 已退款(橙) / 已过期(灰) / 待生效(黄) */
const recordStatus = (o: Order, startTime: Date | string, endTime: Date | string): { text: string; cls: string } => {
  // 退款单（存在退款金额或已取消）
  if (o.refundAmount != null || o.status === 'cancelled') {
    return { text: '已退款', cls: 'st-refunded' };
  }
  // 排队单：待生效
  if (o.status === 'queue') {
    return { text: '待生效', cls: 'st-waiting' };
  }
  // 已支付：按 [start, end] 区间判定生效中 / 已过期
  if (o.status === 'paid') {
    const now = Date.now();
    const start = startTime ? new Date(startTime).getTime() : 0;
    const end = endTime ? new Date(endTime).getTime() : Infinity;
    if (now >= start && now <= end) {
      return { text: '生效中', cls: 'st-active' };
    }
    if (now > end) {
      return { text: '已过期', cls: 'st-expired' };
    }
    return { text: '待生效', cls: 'st-waiting' };
  }
  if (o.status === 'pending') {
    return { text: '待支付', cls: 'st-pending' };
  }
  return { text: '支付失败', cls: 'st-failed' };
};

const recordRows = computed<RecordRow[]>(() => {
  const q = queuedOrder.value;
  // 取 orderStore 全量订单，过滤掉词元宝(cyb)记录
  const orders = (orderStore.recentOrders as Order[]).filter(
    (o) => o.planType !== PlanType.TOKEN_KEY
  );
  const rows: RecordRow[] = orders.map((order) => {
    const isContinuousOrder =
      order.planType === PlanType.CONTINUOUS_MONTHLY ||
      order.planType === PlanType.CONTINUOUS_QUARTERLY;

    // 排队年包：从 queuedOrder 取预计生效日，失效 = 生效 + 365 天
    let startTime: Date | string = order.startDate ?? order.paidTime ?? order.createTime;
    let endTime: Date | string = order.endDate ?? startTime;
    if (order.status === 'queue' && q && q.orderId === order.id) {
      startTime = q.expectedStartDate;
      endTime = new Date(new Date(q.expectedStartDate).getTime() + 365 * DAY);
    }

    const st = recordStatus(order, startTime, endTime);

    // ⑥ cm/cq行商品名称写全: {套餐名} {tokenLabel} - {连续包月|连续包季}
    let displayName = order.displayName || order.planName;
    if (isContinuousOrder) {
      const typeLabel = order.planType === PlanType.CONTINUOUS_QUARTERLY ? '连续包季' : '连续包月';
      const tokenLbl = order.tokenLabel ?? '';
      displayName = `${order.planName} ${tokenLbl} - ${typeLabel}`;
    }

    return {
      id: order.id,
      name: displayName,
      // 团队域订单：属性 chip 展示「团队版」
      attr: order.team ? '团队版' : planTypeAttr(order.planType),
      attrClass: order.team ? 'attr-default' : planTypeAttrClass(order.planType),
      // deductCount 字段保留供后台订单口径，记录表不再展示
      deductCount: order.deductCount ?? 1,
      startTime,
      endTime,
      quota: order.quota ?? null,
      statusText: st.text,
      statusSub: '',
      statusClass: st.cls,
      isContinuous: isContinuousOrder,
      planType: order.planType
    };
  });

  // 兼容：若 boosterStore 中存在未写入 orderStore 的加油包（防往旧数据），补入列表
  const existingIds = new Set(rows.map((r) => r.id));
  boosterStore.boosterPacks.forEach((p) => {
    if (existingIds.has(p.orderId)) return;
    rows.push({
      id: p.orderId || p.id,
      name: `加油包 ${p.tokenLabel}`,
      attr: '订阅',
      attrClass: 'attr-booster',
      deductCount: 1,
      startTime: p.createTime,
      endTime: p.expireTime,
      quota: p.tokenAmount,
      statusText: new Date(p.expireTime).getTime() > Date.now() ? '生效中' : '已过期',
      statusSub: '',
      statusClass: new Date(p.expireTime).getTime() > Date.now() ? 'st-active' : 'st-expired',
      isContinuous: false,
      planType: PlanType.BOOSTER
    });
  });

  return rows;
});

/** ③ 记录表不展示词元宝，无筛选chips，直接返回全量 */
const filteredRows = computed<RecordRow[]>(() => recordRows.value);

/* ---------- 格式化 ---------- */
const fmtNum = (n: number) => n.toLocaleString('en-US');

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

/** 短日期：X 月 X 日 */
const fmtShort = (d: Date | string) => {
  const t = new Date(d);
  return `${t.getMonth() + 1} 月 ${t.getDate()} 日`;
};



/* ---------- 操作 ---------- */
const refreshAll = async () => {
  const uid = userStore.userInfo?.id;
  if (!uid) return;
  await userStore.refreshUserState();
  await orderStore.fetchUserOrders(uid);
  await boosterStore.fetchUserBoosterPacks(uid);
};

/** 预约到期购买提醒 */
const handleBookExpiryReminder = async () => {
  const uid = userStore.userInfo?.id;
  if (!uid) return;
  try {
    const result = await bookExpiryReminder(uid);
    if (result.alreadyBooked) {
      toastStore.push('您已预约过到期提醒，无需重复操作', 'success');
    } else {
      toastStore.push('已预约，到期前将提醒您重新选购', 'success');
    }
    await refreshAll();
  } catch (err) {
    toastStore.push(`预约失败：${(err as Error).message}`, 'error', 3600);
  }
};

/** renewalStopped 后续订：恢复自动续费 */
const handleResumeRenewal = async () => {
  try {
    await userStore.resumeRenewal();
    toastStore.push('已恢复自动续费', 'success');
    // 同步刷新订单/加速包数据，避免 mock 原地变更导致记录表副行不更新
    await refreshAll();
  } catch (err) {
    toastStore.push(`恢复失败：${(err as Error).message}`, 'error', 3600);
  }
};

/* ---------- 年包续订（PurchaseModal 排单流程） ---------- */
const purchaseModalVisible = ref(false);
const purchasePayload = ref<PurchasePayload | null>(null);

const openAnnualRenew = () => {
  const plan = currentPlan.value;
  if (!plan || !userStore.userInfo) return;
  const needConsent = userStore.hasContinuousMonthlySubscription;
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
};

const onPurchaseSuccess = async () => {
  await refreshAll();
};

/* ---------- ⑤ 过期态续订弹窗 ---------- */
const renewModalVisible = ref(false);

const onRenewSuccess = async () => {
  await refreshAll();
};

/* ---------- API Key ---------- */
const copyKey = async () => {
  try {
    await navigator.clipboard.writeText('sk-lbyy8q4zmxne1234');
  } catch {
    /* 浏览器限制时忽略，仍提示已复制（mock） */
  }
  toastStore.push('已复制到剪贴板', 'success');
};

/* ---------- 跳转 ---------- */
const goTeam = () => router.push('/?type=team');

onMounted(async () => {
  await Promise.all([
    planStore.fetchPlans(PlanType.CONTINUOUS_MONTHLY),
    planStore.fetchPlans(PlanType.CONTINUOUS_QUARTERLY),
    planStore.fetchPlans(PlanType.MONTHLY_ONETIME),
    planStore.fetchPlans(PlanType.ANNUAL)
  ]);
  await refreshAll();
});
</script>

<style scoped>
.sm-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fdf7f5 0%, #f5f6f8 260px, #f5f6f8 100%);
}

/* ---------- 居中二级页签 ---------- */
.sm-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  padding: 20px 0 18px;
}

.sm-tabs button {
  position: relative;
  border: none;
  background: transparent;
  padding: 4px 2px 10px;
  font-size: 15px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.sm-tabs button.on {
  color: #1a1a1a;
  font-weight: 600;
}

.sm-tabs button.on::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 28px;
  height: 2px;
  border-radius: 2px;
  background: var(--brand-red);
}

/* ---------- 主体双栏 ---------- */
.sm-body {
  max-width: 1240px;
  margin: 0 auto;
  padding: 16px 24px 72px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.sm-side {
  width: 168px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sm-side button {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 22px;
  background: transparent;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.sm-side button svg {
  width: 18px;
  height: 18px;
  color: #666;
  transition: color 0.2s;
}

.sm-side button.on {
  background: #fde8e8;
  color: var(--brand-red);
  font-weight: 600;
}

.sm-side button.on svg {
  color: var(--brand-red);
}

.sm-side button:not(.on):hover {
  background: rgba(0, 0, 0, 0.04);
}

.sm-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ---------- 无数据内嵌视图布局（仅标准tab命中）：隐藏侧栏、内容占满宽度居中 ----------
   命中条件同 noSideLayout：标准tab 且 首页 且 无标准数据内嵌视图；
   团队tab / 有数据态（B/C/D/E/F）/ API Key / 用量视图均不命中，侧栏与双栏保持现状 */
.sm-no-side .sm-side {
  display: none;
}

/* 主内容区取消侧栏左偏移，占满内容宽度 */
.sm-no-side .sm-main {
  flex: 1 1 100%;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* 内嵌商品卡片区（暂无生效中的订阅标题区+双组页签+卡片网格）水平居中平铺 */
.sm-no-side .embed-card {
  max-width: 1192px; /* 与 .sm-body 内容宽度自洽（1240 − 左右各 24 padding） */
  margin-left: auto;
  margin-right: auto;
}

/* ---------- 卡片基类 ---------- */
.sm-card {
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(20, 20, 40, 0.04);
  padding: 28px 32px;
}

.sm-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ---------- 按钮 ---------- */
.btn-red {
  border: none;
  background: var(--brand-red);
  color: #fff;
  height: 44px;
  padding: 0 32px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-red:hover {
  opacity: 0.9;
}

.btn-outline {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
  height: 40px;
  padding: 0 22px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-outline:hover {
  border-color: var(--brand-red);
  color: var(--brand-red);
}

/* ---------- 卡A 订阅概览 ---------- */
.ov-card {
  padding: 32px;
}

.ov-cols {
  display: flex;
  align-items: stretch;
  gap: 36px;
}

/* 左：红色渐变套餐卡 */
.ov-plan {
  position: relative;
  overflow: hidden;
  width: 400px;
  flex-shrink: 0;
  min-height: 212px;
  padding: 26px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff4141 0%, #ff6b6b 52%, #ff8a8a 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 斜向高光 */
.ov-plan::after {
  content: '';
  position: absolute;
  top: -30%;
  right: 6%;
  width: 34%;
  height: 160%;
  transform: skewX(-18deg);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 100%);
  pointer-events: none;
}

.ov-plan-top {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.ov-plan-name {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.ov-plan-type {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.ov-badge {
  background: #1a1a1a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
}

/* renewalStopped 灰徽章（手动取消自动续费 / 年包排队自动解约 两路径共用） */
.ov-badge-stopped {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* ⑤ 已过期徽章（概览卡）：③ 对齐截图1口径，黑底白字实心 chip */
.ov-badge-expired {
  flex-shrink: 0;
  background: #1a1a1a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
}

/* ⑤ 过期态：红渐变降为浅灰色调（截图1：浅灰卡+深色文字）
   加固：使用 .ov-plan.ov-plan-expired 复合选择器提升特异性，
   避免仅依赖源码顺序而被 .ov-plan 的红渐变覆盖 */
.ov-plan.ov-plan-expired {
  box-sizing: border-box;
  background: linear-gradient(135deg, #dfe2e7 0%, #d2d6dc 52%, #c3c8d0 100%);
  border: 1px solid #c0c5cd;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.ov-plan.ov-plan-expired::after {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 100%);
}

.ov-plan.ov-plan-expired .ov-plan-name,
.ov-plan.ov-plan-expired .ov-days,
.ov-plan.ov-plan-expired .ov-days-num,
.ov-plan.ov-plan-expired .ov-days-unit {
  color: #1a1a1a;
}

.ov-plan.ov-plan-expired .ov-days-label {
  color: #1a1a1a;
  opacity: 0.72;
}

/* ③ 过期态红字提示（粉底红字，ⓘ tooltip 说明额度随服务单失效） */
.ov-expired-note {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  background: #fde8e8;
  color: var(--brand-red);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.ov-note-info {
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.ov-note-info svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.ov-days {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #fff;
  position: relative;
  z-index: 1;
}

.ov-days-label {
  font-size: 13px;
  opacity: 0.92;
}

.ov-days-num {
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.5px;
}

.ov-days-unit {
  font-size: 14px;
}

/* 中：剩余 Token */
.ov-mid {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ov-label {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.ov-amount {
  margin: 6px 0 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.ov-num {
  font-size: 50px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.15;
  letter-spacing: 0.5px;
}

.ov-quota {
  font-size: 13px;
  color: #999;
}

.ov-pct-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ov-pct {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.ov-expire {
  background: #fde8e8;
  color: var(--brand-red);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 分段进度条 */
.ov-bars {
  margin-top: 10px;
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 13px;
}

.ov-bars i {
  flex: 1 1 0;
  max-width: 5px;
  border-radius: 1px;
  background: #e5e5e5;
}

.ov-bars i.fill {
  background: #1a1a1a;
}

.ov-period {
  margin: 12px 0 0;
  font-size: 13px;
  color: #999;
}

/* ③ 过期态中列降活：大数字 / 总额度 / 分段进度条填充降灰，
   避免呈现「剩余100% + 满格黑条」与「剩余额度已失效」相互矛盾（元素与文案口径不变） */
.ov-mid-expired .ov-num {
  color: #8c8c8c;
}

.ov-mid-expired .ov-quota {
  color: #b5b5b5;
}

.ov-mid-expired .ov-pct {
  color: #8c8c8c;
}

.ov-mid-expired .ov-bars i.fill {
  background: #b0b4bb;
}

/* 右：操作区 */
.ov-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

/* 图文取消指引入口（仅 cm/cq） */
.cancel-guide-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  padding: 4px 2px;
  font-size: 12.5px;
  color: #6b7a99;
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: color 0.2s, border-color 0.2s;
  cursor: pointer;
  background: transparent;
  border-left: none;
  border-right: none;
  border-top: none;
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

/* 卡内底部状态条 */
.ov-status {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ov-status:empty {
  display: none;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid #ececef;
  border-radius: 10px;
  background: #f7f8fa;
  font-size: 13px;
  line-height: 1.7;
}

.queued-row .ir-title {
  font-weight: 600;
  color: #333;
}

.queued-row .ir-desc {
  color: #666;
}

.stopped-row {
  color: #666;
}

/* ---------- ① 空态内嵌商品面板 ---------- */
.empty-card {
  padding: 72px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.empty-title {
  margin: 0;
  font-size: 15px;
  color: #999;
}

.embed-card {
  padding: 28px 32px 32px;
}

.embed-head {
  text-align: center;
  margin-bottom: 24px;
}

.embed-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.embed-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #999;
}

/* ---------- ① 团队版订阅卡 ---------- */
.team-ov-card {
  padding: 24px 32px;
}

.team-ov-item {
  padding: 18px 22px;
  border: 1px solid #ececf1;
  border-radius: 14px;
  background: linear-gradient(126deg, #f8f9fb 0%, #f3f4f7 46%, #edeff3 100%);
}

.team-ov-item + .team-ov-item {
  margin-top: 16px;
}

.team-ov-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-ov-name {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.team-ov-badge {
  background: #1a1a1a;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.team-ov-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  font-variant-numeric: tabular-nums;
}

.team-ov-note {
  margin: 16px 0 0;
  font-size: 12.5px;
  color: #999;
}

/* ---------- 卡C 购买/领取记录 ---------- */
.rec-card {
  padding: 24px 0 0;
  overflow: hidden;
}

.rec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 0 32px 18px;
  flex-wrap: wrap;
}

.rec-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.rec-table-wrap {
  overflow-x: auto;
}

.rec-table {
  width: 100%;
  border-collapse: collapse;
}

.rec-table th {
  background: #f7f8fa;
  color: #333;
  font-size: 12.5px;
  font-weight: 600;
  text-align: center;
  padding: 12px 10px;
  white-space: nowrap;
  border-bottom: 1px solid #ececef;
}

.rec-table td {
  border-top: 1px solid #f0f0f2;
  color: #333;
  font-size: 12.5px;
  text-align: center;
  padding: 14px 10px;
  white-space: nowrap;
  vertical-align: middle;
}

.rec-name {
  text-align: left !important;
  padding-left: 20px !important;
  font-weight: 500;
  color: #1a1a1a;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-num {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}

.rec-empty {
  color: #999;
  padding: 32px 16px;
}

/* 属性 chip */
.attr-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}

.attr-cm {
  background: #fff1f0;
  color: #d4380d;
}

.attr-cq {
  background: #fff7e6;
  color: #ad6800;
}

.attr-monthly {
  background: #e6f4ff;
  color: #0958d9;
}

.attr-annual {
  background: #f6ffed;
  color: #389e0d;
}

.attr-tokenkey {
  background: #f9f0ff;
  color: #722ed1;
}

/* ⑤ 加油包行属性 chip：文本改「订阅」，样式保持橙色系 */
.attr-booster {
  background: #fff3e6;
  color: #d46b08;
}

.attr-default {
  background: #f5f5f5;
  color: #666;
}

/* 状态 pill */
.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.st-paid {
  background: rgba(82, 196, 26, 0.12);
  color: #389e0d;
}

/* ④ 记录表状态徽章：生效中绿 / 已退款橙 / 已过期灰 / 待生效黄 */
.st-active {
  background: rgba(82, 196, 26, 0.12);
  color: #389e0d;
}

.st-refunded {
  background: rgba(250, 140, 22, 0.14);
  color: #d46b08;
}

.st-expired {
  background: #f2f3f5;
  color: #8c8c8c;
}

.st-waiting {
  background: rgba(250, 219, 20, 0.18);
  color: #ad8b00;
}

.st-queue {
  background: rgba(250, 173, 20, 0.14);
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

.status-sub {
  display: block;
  margin-top: 3px;
  font-size: 10.5px;
  color: #ad6800;
  letter-spacing: 0.2px;
}

/* 自动续费徽章 */
.renew-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.6;
  width: fit-content;
}

.renew-badge::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.renew-active {
  background: rgba(82, 196, 26, 0.12);
  color: #389e0d;
}

.renew-active::before {
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.22);
}

.renew-stopped {
  background: #f2f3f5;
  color: #8c8c8c;
}

/* ---------- 视图2 API Key ---------- */
.key-box {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: #f7f8fa;
  border: 1px solid #ececef;
  border-radius: 10px;
}

.key-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.key-value {
  display: block;
  margin-top: 7px;
  font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace;
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #333;
}

.key-time {
  margin: 14px 0 0;
  font-size: 13px;
  color: #666;
}

.key-warn {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
}

/* ---------- 视图3 用量 ---------- */
.usage-summary {
  margin: 18px 0 26px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 56px;
  background: #f7f8fa;
  border: 1px solid #ececef;
  border-radius: 10px;
}

.us-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.us-label {
  font-size: 12px;
  color: #999;
}

.us-num {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

/* ---------- 团队版空态 ---------- */
.team-card {
  padding: 88px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.team-title {
  margin: 0;
  font-size: 15px;
  color: #999;
}

/* ---------- 预约到期提醒按钮区 ---------- */
.stopped-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

/* ---------- ⑥ 扣费信息区（概览卡中部） ---------- */
.ov-deduct-info {
  margin-top: 18px;
  padding: 14px 18px;
  background: #f9fafb;
  border: 1px solid #ececef;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.deduct-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.deduct-label {
  color: #666;
}

.deduct-value {
  color: #1a1a1a;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* ---------- ① 加油包商品卡 ---------- */
.booster-card {
  padding: 24px 32px;
}

.booster-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.booster-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booster-item {
  padding: 18px 22px;
  border: 1px solid #fde8d8;
  border-radius: 14px;
  background: linear-gradient(135deg, #fffbf7 0%, #fff8f2 100%);
}

.booster-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.booster-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.booster-badge {
  background: #fff3e6;
  color: #d46b08;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.booster-remaining {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.booster-remaining-label {
  font-size: 13px;
  color: #666;
}

.booster-remaining-num {
  font-size: 32px;
  font-weight: 800;
  color: #d46b08;
  line-height: 1.2;
  letter-spacing: 0.3px;
}

.booster-pct-row {
  margin-top: 10px;
}

.booster-pct {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.booster-bars {
  margin-top: 8px;
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 10px;
}

.booster-bars i {
  flex: 1 1 0;
  max-width: 6px;
  border-radius: 1px;
  background: #f0e0d0;
}

.booster-bars i.fill {
  background: #fa8c16;
}

.booster-period {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1024px) {
  .ov-cols {
    flex-direction: column;
    gap: 24px;
  }

  .ov-plan {
    width: 100%;
  }

  .ov-actions {
    align-items: flex-start;
  }

  .sm-side {
    display: none;
  }

  .rec-head {
    padding: 0 20px 16px;
  }
}

@media (max-width: 640px) {
  .rec-head {
    padding: 0 16px 14px;
  }

  .rec-name {
    padding-left: 14px !important;
  }
}
</style>
