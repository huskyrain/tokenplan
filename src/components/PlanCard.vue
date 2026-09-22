<!-- src/components/PlanCard.vue -->
<template>
  <div class="plan-card" :class="{ recommended: isRecommended, subscribed: subscribed || blocked }">
    <!-- 推荐角标 -->
    <span v-if="isRecommended" class="recommend-badge">推荐</span>

    <div class="card-body">
      <!-- 套餐名 + 身份徽章 -->
      <div class="plan-name-row">
        <h3 class="plan-name">{{ plan.name }}</h3>
        <span v-if="plan.badge" class="plan-badge">{{ plan.badge }}</span>
      </div>

      <!-- Token 量 -->
      <div class="plan-token">{{ plan.tokenLabel }}</div>

      <!-- 价格 -->
      <div class="plan-price">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ priceInteger }}</span>
        <span class="price-unit">/{{ plan.unit }}</span>
      </div>

      <!-- 周期文案（连续包季） -->
      <p v-if="plan.cycleLabel" class="plan-cycle">{{ plan.cycleLabel }}</p>

      <!-- 分隔线 -->
      <div class="card-divider"></div>

      <!-- 权益列表 -->
      <ul class="plan-features">
        <li v-for="(feature, index) in plan.features" :key="index">
          <svg
            class="feature-check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <!-- 订阅/购买按钮 -->
      <button
        class="plan-btn"
        :class="{
          'btn-red': isRecommended && !subscribed && !blocked,
          'btn-gray': subscribed || blocked
        }"
        :disabled="subscribed || blocked"
        :title="buttonTitle"
        @click="handleClick"
      >
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plan, PlanType } from '@/types/plan';

const props = defineProps<{
  plan: Plan;
  recommended?: boolean;
  /** 当前生效的同档套餐（显示"已订阅"） */
  subscribed?: boolean;
  /** 被其他生效单阻止（同线其他档：置灰「立即订阅」+ title 提示） */
  blocked?: boolean;
  /** blocked 状态的 tooltip */
  blockedTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'purchase', plan: Plan): void;
  (e: 'blocked', plan: Plan): void;
}>();

const isRecommended = computed(() => props.recommended ?? !!props.plan.recommended);

// 价格：千分位
const priceInteger = computed(() => (props.plan.price / 100).toLocaleString('zh-CN'));

/** 按钮文案（② 同线其他档置灰态文本统一为「立即订阅」，当前档仍「已订阅」） */
const buttonLabel = computed(() => {
  if (props.subscribed) return '已订阅';
  if (props.blocked) return '立即订阅';
  // 签约线 → 立即订阅；买断线 → 立即购买
  if (props.plan.planType === PlanType.CONTINUOUS_MONTHLY || props.plan.planType === PlanType.CONTINUOUS_QUARTERLY) {
    return '立即订阅';
  }
  return '立即购买';
});

/** 按钮 title 提示（禁用态辅助说明） */
const buttonTitle = computed(() => {
  if (props.subscribed) return '您已开通该套餐';
  if (props.blocked && props.blockedTitle) return props.blockedTitle;
  return '';
});

const handleClick = () => {
  if (props.subscribed || props.blocked) {
    emit('blocked', props.plan);
    return;
  }
  emit('purchase', props.plan);
};
</script>

<style scoped>
/* 卡片：白底 288px 圆角16 边框 #D8D8D8 */
.plan-card {
  position: relative;
  width: 288px;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-sizing: border-box;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  animation: fade-up 0.5s ease both;
}

.plan-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

/* 推荐态：红边框 + 内阴影 + 外阴影 */
.plan-card.recommended {
  border: 1px solid var(--brand-red);
  box-shadow: inset 0 0 0 4px #ff4141, 0 8px 24px rgba(255, 65, 65, 0.18);
}

.plan-card.recommended:hover {
  box-shadow: inset 0 0 0 4px #ff4141, 0 12px 30px rgba(255, 65, 65, 0.28);
}

.recommend-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  padding: 3px 14px;
  border-radius: 100px;
  background: var(--brand-red);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  box-shadow: 0 4px 10px rgba(255, 65, 65, 0.35);
}

.card-body {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
}

.plan-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
  text-align: center;
}

/* 身份徽章：红边浅底小徽章 */
.plan-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid rgba(255, 65, 65, 0.35);
  border-radius: 4px;
  background: rgba(255, 65, 65, 0.06);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--brand-red);
  white-space: nowrap;
}

.plan-token {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-title);
  text-align: center;
}

.plan-price {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  color: var(--text-title);
}

.price-symbol {
  font-size: 18px;
  font-weight: 600;
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.5px;
}

.price-unit {
  font-size: 14px;
  color: var(--text-link);
}

.plan-cycle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

/* 分隔线 */
.card-divider {
  height: 1px;
  margin: 18px 0 16px;
  background: #f0f0f0;
}

.plan-features {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-link);
}

.feature-check {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
  margin-top: 3px;
  color: var(--brand-red);
}

/* 订阅按钮：236×44 圆角8 */
.plan-btn {
  width: 236px;
  height: 44px;
  margin: 0 auto;
  border: none;
  border-radius: 8px;
  background: var(--btn-black);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.plan-btn:not(.btn-gray):hover {
  opacity: 0.88;
}

.plan-btn:not(.btn-gray):active {
  transform: scale(0.98);
}

.plan-btn.btn-red {
  background: var(--brand-red);
}

.plan-btn.btn-gray {
  background: #d8d8d8;
  color: #fff;
  cursor: not-allowed;
}
</style>
