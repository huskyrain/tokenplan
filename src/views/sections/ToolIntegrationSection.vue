<!-- src/views/sections/ToolIntegrationSection.vue -->
<!-- 工具跑马灯区：两行反向无限滚动（CSS keyframes） -->
<template>
  <section class="marquee-section">
    <!-- 第一行：向左滚动 -->
    <div class="marquee-row">
      <div class="marquee-track track-left">
        <span v-for="(tool, i) in doubledRow1" :key="`r1-${i}`" class="tool-chip">
          <span class="tool-logo" :style="{ background: tool.bg, color: tool.fg }">{{ tool.short }}</span>
          <span class="tool-name">{{ tool.name }}</span>
        </span>
      </div>
    </div>

    <!-- 第二行：向右滚动 -->
    <div class="marquee-row">
      <div class="marquee-track track-right">
        <span v-for="(tool, i) in doubledRow2" :key="`r2-${i}`" class="tool-chip">
          <span class="tool-logo" :style="{ background: tool.bg, color: tool.fg }">{{ tool.short }}</span>
          <span class="tool-name">{{ tool.name }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Tool {
  name: string;
  short: string;
  bg: string;
  fg: string;
}

const row1: Tool[] = [
  { name: 'OpenClaw', short: 'O', bg: 'rgba(255,65,65,0.1)', fg: '#FF4141' },
  { name: 'Hermes Agent', short: 'H', bg: 'rgba(97,92,237,0.1)', fg: '#615ced' },
  { name: 'Deepseek Harness', short: 'D', bg: 'rgba(26,127,142,0.1)', fg: '#1a7f8e' },
  { name: '联想百应Claw', short: '联', bg: 'rgba(255,94,15,0.1)', fg: '#FF5E0F' },
  { name: 'Claude Code', short: 'C', bg: 'rgba(217,119,87,0.12)', fg: '#d97757' }
];

const row2: Tool[] = [
  { name: 'Cursor', short: 'C', bg: 'rgba(51,51,51,0.08)', fg: '#333' },
  { name: 'opencode', short: 'o', bg: 'rgba(255,65,65,0.1)', fg: '#FF4141' },
  { name: 'Trae', short: 'T', bg: 'rgba(47,107,255,0.1)', fg: '#2f6bff' },
  { name: 'Grok', short: 'G', bg: 'rgba(17,17,17,0.08)', fg: '#111' },
  { name: 'OpenClaw', short: 'O', bg: 'rgba(255,65,65,0.1)', fg: '#FF4141' },
  { name: 'Hermes Agent', short: 'H', bg: 'rgba(97,92,237,0.1)', fg: '#615ced' }
];

// 复制两份实现无缝滚动
const doubledRow1 = [...row1, ...row1];
const doubledRow2 = [...row2, ...row2];
</script>

<style scoped>
.marquee-section {
  padding: 44px 0 56px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 18px;
  /* 左右渐隐遮罩 */
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.marquee-row {
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  gap: 18px;
  width: max-content;
  will-change: transform;
}

/* 双向无限滚动 */
.track-left {
  animation: marquee-left 36s linear infinite;
}

.track-right {
  animation: marquee-right 42s linear infinite;
}

@keyframes marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

/* 悬停暂停 */
.marquee-row:hover .marquee-track {
  animation-play-state: paused;
}

/* 工具徽标：文字圆标 + 名称 */
.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 26px 0 14px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 100px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s, transform 0.2s;
}

.tool-chip:hover {
  border-color: var(--brand-red);
  transform: translateY(-2px);
}

.tool-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 700;
}

.tool-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-title);
}
</style>
