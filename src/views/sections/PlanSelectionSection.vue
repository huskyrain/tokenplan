<!-- src/views/sections/PlanSelectionSection.vue -->
<!-- 套餐选择区（核心）：一级页签 / 团队定制 / URL 同步；标准版商品体系复用 PlanMarketPanel -->
<template>
  <section id="plans" class="plan-section">
    <div class="container">
      <!-- H2：选择您的套餐（左右装饰线） -->
      <div class="section-head">
        <span class="section-title-line left"></span>
        <h2 class="section-title">选择您的套餐</h2>
        <span class="section-title-line right"></span>
      </div>

      <!-- 一级页签：标准版 / 团队版 -->
      <div class="lv1-tabs">
        <button
          v-for="t in lv1Tabs"
          :key="t.key"
          class="lv1-tab"
          :class="{ active: level1 === t.key }"
          @click="changeTabLevel1(t.key)"
        >
          {{ t.name }}
        </button>
      </div>

      <!-- 标准版：商品页签面板（双组二级页签 / 套餐卡 / 词元宝 / 加油包 / 全部购买弹窗接线） -->
      <PlanMarketPanel
        v-if="level1 === 'standard'"
        ref="marketRef"
        :tab="level2"
        @update:tab="changeTabLevel2"
      />

      <!-- 团队版：团队灵活定制大卡（无二级页签，直接呈现） -->
      <div v-else class="team-flex-card">
        <div class="tf-head">
          <h3 class="tf-title">团队灵活定制</h3>
          <p class="tf-desc">Token 资源包可独立购买，Token Key 作为团队硬件交付载体随资源包组合</p>
        </div>

        <div class="tf-body">
          <!-- 左栏：单价 + 购买数量面板 -->
          <div class="tf-left">
            <h4 class="tf-col-title">Token基础包（1亿Token）</h4>
            <div class="tf-price">
              <span class="tf-price-symbol">¥</span>
              <span class="tf-price-value">150</span>
              <span class="tf-price-unit">/份</span>
            </div>

            <div class="tf-panel">
              <div class="tf-panel-title">购买数量</div>

              <!-- Token 基础包 -->
              <div class="tf-line">
                <div class="tf-line-label">
                  <span class="tf-line-name">Token基础包（1亿Token）</span>
                </div>
                <div class="tf-line-ctrl">
                  <div class="tf-stepper">
                    <button
                      class="tf-step-btn"
                      :disabled="teamPackQty <= TEAM_PACK_MIN"
                      @click="teamPackQty > TEAM_PACK_MIN && teamPackQty--"
                    >−</button>
                    <span class="tf-step-value">{{ teamPackQty }} 亿Token</span>
                    <button
                      class="tf-step-btn"
                      :disabled="teamPackQty >= TEAM_STEP_MAX"
                      @click="teamPackQty < TEAM_STEP_MAX && teamPackQty++"
                    >+</button>
                  </div>
                  <div class="tf-subtotal"><span class="tf-sub-symbol">¥</span>{{ fmtYuan(teamPackSubtotalYuan) }}</div>
                </div>
              </div>

              <!-- 词元宝 -->
              <div class="tf-line">
                <div class="tf-line-label">
                  <span class="tf-line-name">联想百应词元宝</span>
                  <span class="tf-line-note">(不含 Token 权益)</span>
                  <span class="tf-line-note">¥150/个</span>
                </div>
                <div class="tf-line-ctrl">
                  <div class="tf-stepper">
                    <button
                      class="tf-step-btn"
                      :disabled="teamKeyQty <= 0"
                      @click="teamKeyQty > 0 && teamKeyQty--"
                    >−</button>
                    <span class="tf-step-value">{{ teamKeyQty }} 个</span>
                    <button
                      class="tf-step-btn"
                      :disabled="teamKeyQty >= TEAM_STEP_MAX"
                      @click="teamKeyQty < TEAM_STEP_MAX && teamKeyQty++"
                    >+</button>
                  </div>
                  <div class="tf-subtotal"><span class="tf-sub-symbol">¥</span>{{ fmtYuan(teamKeySubtotalYuan) }}</div>
                </div>
              </div>

              <p class="tf-panel-note">词元宝 Token Key 可按团队成员规模购买</p>

              <div class="tf-total">
                <span class="tf-total-label">合计</span>
                <span class="tf-total-price"><span class="tf-total-symbol">¥</span>{{ fmtYuan(teamTotalYuan) }}</span>
              </div>
            </div>

            <button class="tf-buy-btn" @click="handleTeamPurchase">立即购买</button>
            <div class="tf-hint">
              <svg class="tf-hint-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="M11 7h2v7h-2zM11 16h2v2h-2z" fill="#fff" />
              </svg>
              <span>含安全硬件 · 需物流配送 · 收货后权益激活</span>
            </div>
          </div>

          <!-- 右栏：版本能力 -->
          <div class="tf-right">
            <h4 class="tf-col-title tf-col-title--side">版本能力</h4>
            <ul class="tf-caps">
              <li v-for="(cap, i) in teamCapabilities" :key="i">
                <svg class="tf-cap-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ cap }}</span>
              </li>
            </ul>
            <div class="tf-models">
              <template v-for="(m, i) in teamModelBadges" :key="m.name">
                <span v-if="i > 0" class="tf-model-divider"></span>
                <span class="tf-model">
                  <i class="tf-model-dot" :style="{ background: m.color }"></i>{{ m.name }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部注释 -->
      <div class="plan-note">
        <span class="note-icon">?</span>
        <span>不同模型存在抵扣系数差异</span>
        <a href="#" class="note-link" @click.prevent>点击查看详情</a>
      </div>
    </div>

    <!-- 团队专属定制侧栏 -->
    <aside class="team-sidebar">
      <h4 class="sidebar-title">团队专属定制</h4>
      <p class="sidebar-desc">为团队提供专属套餐、额度管理与安全部署，支持线下对公采购与合同签署。</p>
      <button class="sidebar-btn" @click="handleTeamConsult">预约团队咨询</button>
    </aside>

    <!-- 团队定制购买弹窗 -->
    <PurchaseModal v-model:visible="purchaseModalVisible" :order="purchasePayload" @success="onPurchased" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import type { PlanTabKey } from '@/types/plan';
import { createOrder } from '@/api/order';
import { TEAM_TOKEN_PACK_PRICE, TEAM_KEY_PRICE } from '@/api/subscription';
import {
  MODEL_BRANDS,
  MODEL_BADGE_COLORS,
  TEAM_CAPABILITIES
} from '@/constants/tokenKey';
import PlanMarketPanel from '@/components/PlanMarketPanel.vue';
import PurchaseModal, { PurchasePayload } from '@/components/PurchaseModal.vue';

/* ---------------- URL tab 映射 ---------------- */
const VALID_TABS: PlanTabKey[] = ['cm', 'cq', 'monthly', 'annual', 'cyb'];
/** 旧值兼容映射 */
const LEGACY_TAB_MAP: Record<string, PlanTabKey> = { standard: 'cm' };

const lv1Tabs: Array<{ key: 'standard' | 'team'; name: string }> = [
  { key: 'standard', name: '标准版' },
  { key: 'team', name: '团队版' }
];

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const toastStore = useToastStore();

/* ---------------- 状态 ---------------- */
const level1 = ref<'standard' | 'team'>('standard');
const level2 = ref<PlanTabKey>('cm');
const marketRef = ref<InstanceType<typeof PlanMarketPanel> | null>(null);

/* 团队灵活定制 */
const TEAM_PACK_MIN = 30;
const TEAM_STEP_MAX = 999;
const teamPackQty = ref(TEAM_PACK_MIN);
const teamKeyQty = ref(0);
const teamCapabilities = TEAM_CAPABILITIES;
const teamModelBadges = MODEL_BRANDS.map((name) => ({ name, color: MODEL_BADGE_COLORS[name] || '#8a8f99' }));

// 团队定制购买弹窗状态
const purchaseModalVisible = ref(false);
const purchasePayload = ref<PurchasePayload | null>(null);

/* 团队卡金额 */
const teamPackSubtotalYuan = computed(() => (teamPackQty.value * TEAM_TOKEN_PACK_PRICE) / 100);
const teamKeySubtotalYuan = computed(() => (teamKeyQty.value * TEAM_KEY_PRICE) / 100);
const teamTotalYuan = computed(() => teamPackSubtotalYuan.value + teamKeySubtotalYuan.value);
const teamTotalFen = computed(() => Math.round(teamTotalYuan.value * 100));
const fmtYuan = (v: number) => v.toLocaleString('zh-CN');

/* ---------------- URL 同步 ---------------- */
const syncUrl = () => {
  const query: Record<string, string> =
    level1.value === 'team' ? { type: 'team' } : { tab: level2.value };
  router.replace({ query });
};

const changeTabLevel1 = (key: 'standard' | 'team') => {
  if (level1.value === key) return;
  level1.value = key;
  syncUrl();
};

/** 二级页签切换：仅同步本地状态与 URL，数据加载由 PlanMarketPanel 内部 watch 驱动 */
const changeTabLevel2 = (key: PlanTabKey) => {
  if (level2.value === key) return;
  level2.value = key;
  syncUrl();
};

/* ---------------- 团队灵活定制购买 ---------------- */
const handleTeamPurchase = () => {
  if (!userStore.isLoggedIn) {
    toastStore.push('请先点击右上角「登录」按钮模拟登录后再购买', 'info');
    return;
  }
  const qty = teamPackQty.value;
  const keyQty = teamKeyQty.value;
  const totalFen = teamTotalFen.value;
  purchasePayload.value = {
    name: `团队 Token 基础包 × ${qty}`,
    nameLabel: '定制内容',
    tokenLabel: `${qty} 亿 Token`,
    price: totalFen,
    unit: '',
    cycleLabel: 'Token 资源包 + Token Key 硬件组合交付',
    successLines: [
      `含 <b>${qty} 亿 Token</b> 权益与 <b>${keyQty} 个</b> 词元宝 Token Key 硬件交付载体。`,
      '含安全硬件 · 需物流配送 · 收货后权益激活。'
    ],
    submit: async (userId) => {
      const order = await createOrder('team-token-pack', userId, {
        displayName: `团队 Token 基础包 × ${qty}`,
        price: totalFen,
        queueable: false
      });
      return { queued: order.status === 'queue' };
    }
  };
  purchaseModalVisible.value = true;
};

// 侧栏：预约团队咨询
const handleTeamConsult = () => {
  toastStore.push('已提交团队咨询预约（演示），顾问将尽快与您联系', 'success');
};

const onPurchased = () => { /* 状态已在弹窗内刷新 */ };

/* 词元宝购买入口（TokenKeySection 通过 ref 调用）：委托给面板 */
const handleTokenKeyPurchase = () => marketRef.value?.handleTokenKeyPurchase();
defineExpose({ handleTokenKeyPurchase });

/* ---------------- 初始化：URL 恢复 ---------------- */
onMounted(() => {
  const tabQ = route.query.tab as string;
  const typeQ = route.query.type as string;
  // 兼容旧值
  const resolvedTab = LEGACY_TAB_MAP[tabQ] || tabQ;
  if (VALID_TABS.includes(resolvedTab as PlanTabKey)) {
    level2.value = resolvedTab as PlanTabKey;
  }
  if (typeQ === 'team') {
    level1.value = 'team';
  }
});
</script>

<style scoped>
.plan-section {
  position: relative;
  padding: 80px 0 88px;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* H2 40px/500 + 装饰线 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 40px;
}

.section-title {
  margin: 0;
  font-size: 40px;
  font-weight: 500;
  color: var(--text-title);
  letter-spacing: 1px;
}

/* 一级页签 */
.lv1-tabs {
  display: flex;
  justify-content: center;
  gap: 56px;
  margin-bottom: 28px;
}

.lv1-tab {
  position: relative;
  padding: 6px 4px 12px;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 400;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.lv1-tab.active {
  color: var(--text-title);
  font-weight: 500;
}

.lv1-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: #000;
}

/* ---------------- 团队版 ---------------- */
.team-flex-card {
  width: 100%;
  box-sizing: border-box;
  padding: 48px;
  border: 1px solid #ececf1;
  border-radius: 24px;
  background:
    repeating-linear-gradient(112deg, rgba(126, 138, 160, 0.055) 0 1px, transparent 1px 7px),
    linear-gradient(126deg, #f8f9fb 0%, #f3f4f7 46%, #edeff3 100%);
  animation: fade-up 0.4s ease both;
}

.tf-head { text-align: center; }
.tf-title { margin: 0; font-size: 32px; font-weight: 500; letter-spacing: 1px; color: var(--text-title); }
.tf-desc { margin: 14px 0 0; font-size: 15px; color: var(--text-link); }
.tf-body { display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px; margin-top: 44px; }
.tf-col-title { margin: 0; font-size: 20px; font-weight: 500; color: var(--text-title); }
.tf-price { display: flex; align-items: baseline; gap: 2px; margin: 18px 0 22px; color: var(--text-title); }
.tf-price-symbol { font-size: 18px; font-weight: 600; }
.tf-price-value { font-size: 58px; font-weight: 700; line-height: 1; letter-spacing: -1.5px; }
.tf-price-unit { margin-left: 4px; font-size: 14px; color: var(--text-secondary); }
.tf-panel { padding: 26px 28px 24px; border-radius: 16px; background: #fff; box-shadow: 0 2px 10px rgba(31, 35, 41, 0.04); }
.tf-panel-title { font-size: 15px; font-weight: 600; color: var(--text-title); }
.tf-line { margin-top: 20px; }
.tf-line-label { display: flex; align-items: baseline; gap: 6px; font-size: 15px; font-weight: 500; color: var(--text-title); }
.tf-line-name { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tf-line-note { font-size: 13px; font-weight: 400; color: var(--text-secondary); }
.tf-line-ctrl { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 12px; }
.tf-stepper { display: flex; align-items: center; flex: 0 0 232px; height: 48px; border: 1px solid #e6e7eb; border-radius: 8px; background: #fff; }
.tf-step-btn { flex: 0 0 40px; height: 100%; border: none; background: transparent; font-size: 18px; line-height: 1; color: var(--text-title); cursor: pointer; transition: color 0.2s; }
.tf-step-btn:hover:not(:disabled) { color: var(--brand-red); }
.tf-step-btn:disabled { color: #c9ccd2; cursor: not-allowed; }
.tf-step-value { flex: 1; text-align: center; font-size: 15px; font-weight: 500; color: var(--text-title); }
.tf-subtotal { font-size: 26px; font-weight: 600; color: var(--text-title); line-height: 1; white-space: nowrap; }
.tf-sub-symbol { margin-right: 1px; font-size: 15px; font-weight: 600; }
.tf-panel-note { margin: 16px 0 0; font-size: 12.5px; color: var(--text-secondary); }
.tf-total { display: flex; align-items: center; justify-content: space-between; margin-top: 26px; }
.tf-total-label { font-size: 15px; font-weight: 500; color: var(--text-title); }
.tf-total-price { font-size: 30px; font-weight: 700; color: var(--brand-red); line-height: 1; }
.tf-total-symbol { margin-right: 1px; font-size: 17px; font-weight: 700; }
.tf-buy-btn { width: 100%; height: 52px; margin-top: 24px; border: none; border-radius: 10px; background: var(--btn-black); color: #fff; font-size: 17px; font-weight: 500; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
.tf-buy-btn:hover { opacity: 0.88; }
.tf-buy-btn:active { transform: scale(0.99); }
.tf-hint { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 13px; color: var(--text-link); }
.tf-hint-icon { flex-shrink: 0; width: 15px; height: 15px; color: var(--text-title); }
.tf-right { padding-left: 56px; border-left: 1px solid #e2e4e9; }
.tf-col-title--side { font-size: 18px; font-weight: 600; }
.tf-caps { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.tf-caps li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; line-height: 1.65; color: var(--text-title); }
.tf-cap-check { flex-shrink: 0; width: 15px; height: 15px; margin-top: 5px; color: var(--text-title); }
.tf-models { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
.tf-model { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 500; color: var(--text-title); }
.tf-model-dot { width: 16px; height: 16px; border-radius: 50%; }
.tf-model-divider { width: 1px; height: 12px; background: #d9dbe0; }

/* ---------------- 底部注释 ---------------- */
.plan-note { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 26px; font-size: 12.5px; color: var(--text-secondary); }
.note-icon { display: inline-flex; align-items: center; justify-content: center; width: 15px; height: 15px; border: 1px solid var(--text-secondary); border-radius: 50%; font-size: 10px; line-height: 1; }
.note-link { margin-left: 6px; color: var(--text-link); text-decoration: none; }
.note-link:hover { color: var(--brand-red); }

/* ---------------- 团队专属定制侧栏 ---------------- */
.team-sidebar { position: fixed; right: 0; top: 42%; z-index: 90; width: 168px; padding: 18px 16px; background: #fff; border: 1px solid var(--card-border); border-right: none; border-radius: 12px 0 0 12px; box-shadow: -6px 8px 24px rgba(0, 0, 0, 0.08); }
.sidebar-title { margin: 0 0 8px; font-size: 15px; font-weight: 600; color: var(--brand-red); }
.sidebar-desc { margin: 0 0 14px; font-size: 11.5px; line-height: 1.65; color: var(--text-link); }
.sidebar-btn { width: 108px; height: 26px; border: none; border-radius: 8px; background: var(--btn-black); color: #fff; font-size: 11.5px; cursor: pointer; transition: opacity 0.2s; }
.sidebar-btn:hover { opacity: 0.88; }

@media (max-width: 1560px) {
  .team-sidebar { display: none; }
}

@media (max-width: 1280px) {
  .tf-body { grid-template-columns: 1fr; }
  .tf-right { padding-left: 0; border-left: none; border-top: 1px solid #f0f0f0; padding-top: 24px; }
}
</style>
