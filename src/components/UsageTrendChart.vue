<!-- src/components/UsageTrendChart.vue -->
<!-- 消耗趋势：纯 SVG 折线图（总用量/输入Token/输出Token），近7天/近30天切换 -->
<template>
  <div class="utc">
    <div class="utc-head">
      <h3 class="utc-title">{{ title }}</h3>
      <div class="utc-seg" role="tablist">
        <button :class="{ on: range === 7 }" @click="range = 7">近7天</button>
        <button :class="{ on: range === 30 }" @click="range = 30">近30天</button>
      </div>
    </div>

    <svg class="utc-svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid meet">
      <!-- Y 轴刻度 -->
      <text
        v-for="t in yTicks"
        :key="`y${t.v}`"
        :x="PAD_L - 10"
        :y="yFor(t.v) + 4"
        text-anchor="end"
        class="utc-axis"
      >{{ t.label }}</text>

      <!-- X 轴日期刻度 -->
      <text
        v-for="i in xTickIdx"
        :key="`x${i}`"
        :x="xFor(i)"
        :y="H - PAD_B + 22"
        :text-anchor="i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'"
        class="utc-axis"
      >{{ points[i].label }}</text>

      <!-- 三序列折线 + 圆点 -->
      <g v-for="s in series" :key="s.key">
        <polyline
          :points="polylineOf(s.key)"
          fill="none"
          :stroke="s.color"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <circle
          v-for="(p, i) in points"
          :key="`${s.key}-${i}`"
          :cx="xFor(i)"
          :cy="yFor(p[s.key])"
          :r="range === 7 ? 3 : 2.2"
          :fill="s.color"
        />
      </g>
    </svg>

    <div class="utc-legend">
      <span v-for="s in series" :key="`lg-${s.key}`" class="utc-legend-item">
        <i :style="{ background: s.color }"></i>{{ s.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

withDefaults(defineProps<{ title?: string }>(), { title: '消耗趋势' });

const DAY = 24 * 60 * 60 * 1000;
const range = ref<7 | 30>(7);

/* ---------- 画布几何 ---------- */
const W = 960;
const H = 300;
const PAD_L = 46;
const PAD_R = 20;
const PAD_T = 14;
const PAD_B = 40;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const Y_MAX = 10000;

const yTicks = [
  { v: 0, label: '0' },
  { v: 2000, label: '2k' },
  { v: 4000, label: '4k' },
  { v: 6000, label: '6k' },
  { v: 8000, label: '8k' },
  { v: 10000, label: '1w' }
];

const series = [
  { key: 'total' as const, name: '总用量', color: '#FF4141' },
  { key: 'input' as const, name: '输入Token', color: '#2B6DE8' },
  { key: 'output' as const, name: '输出Token', color: '#22A06B' }
];

interface TrendPoint {
  label: string;
  total: number;
  input: number;
  output: number;
}

/* ---------- 数据（mock：默认全 0，平线贴 0 轴） ---------- */
const points = computed<TrendPoint[]>(() => {
  const n = range.value;
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getTime() - (n - 1 - i) * DAY);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { label: `${mm}-${dd}`, total: 0, input: 0, output: 0 };
  });
});

/* 近7天：每日一个刻度；近30天：取 6 个刻度标签 */
const xTickIdx = computed<number[]>(() => {
  if (range.value === 7) return points.value.map((_, i) => i);
  return [0, 6, 12, 18, 24, 29];
});

const yFor = (v: number) => PAD_T + (1 - Math.min(v, Y_MAX) / Y_MAX) * PLOT_H;
const xFor = (i: number) => {
  const n = points.value.length;
  return n <= 1 ? PAD_L + PLOT_W / 2 : PAD_L + (i * PLOT_W) / (n - 1);
};

const polylineOf = (key: 'total' | 'input' | 'output') =>
  points.value.map((p, i) => `${xFor(i)},${yFor(p[key])}`).join(' ');
</script>

<style scoped>
.utc {
  width: 100%;
}

.utc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.utc-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 分段切换：灰底容器 + 白底激活段 */
.utc-seg {
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 8px;
  background: #f2f3f5;
}

.utc-seg button {
  height: 32px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.utc-seg button.on {
  background: #fff;
  border-color: #e0e0e0;
  color: #1a1a1a;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.utc-svg {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 18px;
}

.utc-axis {
  font-size: 12px;
  fill: #999;
}

/* 底部居中图例 */
.utc-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 6px;
}

.utc-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #333;
}

.utc-legend-item i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
</style>
