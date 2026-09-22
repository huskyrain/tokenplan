<!-- src/views/sections/ModelAccessSection.vue -->
<!-- 多主流模型接入区（粉白渐变背景）：8 张模型卡 -->
<template>
  <section class="model-section">
    <div class="container">
      <h2 class="section-title">多主流模型接入</h2>

      <div class="model-grid">
        <div
          v-for="m in models"
          :key="m.name"
          class="model-card"
          :class="{ more: m.more }"
        >
          <span class="model-logo" :style="{ background: m.bg, color: m.fg }">{{ m.short }}</span>
          <span class="model-name">{{ m.name }}</span>
          <span v-if="m.more" class="model-coming">即将上线</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ModelItem {
  name: string;
  short: string;
  bg: string;
  fg: string;
  more?: boolean;
}

const models: ModelItem[] = [
  { name: 'Qwen3.7-Plus', short: 'Q', bg: 'rgba(97,92,237,0.1)', fg: '#615ced' },
  { name: 'GLM-5.2', short: 'G', bg: 'rgba(47,107,255,0.1)', fg: '#2f6bff' },
  { name: 'DeepSeek-V4-Pro', short: 'D', bg: 'rgba(26,127,142,0.1)', fg: '#1a7f8e' },
  { name: 'Seed-2.0-Pro', short: 'S', bg: 'rgba(232,100,60,0.12)', fg: '#e8643c' },
  { name: 'Hy 3', short: 'H', bg: 'rgba(154,52,201,0.1)', fg: '#9a34c9' },
  { name: 'Kimi K3', short: 'K', bg: 'rgba(17,17,17,0.08)', fg: '#111' },
  { name: 'MiniMax M3', short: 'M', bg: 'rgba(224,64,122,0.1)', fg: '#e0407a' },
  { name: '更多模型', short: '+', bg: 'rgba(153,153,153,0.12)', fg: '#999', more: true }
];
</script>

<style scoped>
/* 模型区背景：linear-gradient(#FFF5F3, #FFF) */
.model-section {
  padding: 88px 0 96px;
  background: linear-gradient(#fff5f3, #fff);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  margin: 0 0 44px;
  text-align: center;
  font-size: 40px;
  font-weight: 500;
  color: var(--text-title);
  letter-spacing: 1px;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.model-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 34px 20px 30px;
  background: #fff;
  border: 1px solid rgba(216, 216, 216, 0.8);
  border-radius: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fade-up 0.5s ease both;
}

.model-card:nth-child(2) { animation-delay: 0.05s; }
.model-card:nth-child(3) { animation-delay: 0.1s; }
.model-card:nth-child(4) { animation-delay: 0.15s; }
.model-card:nth-child(5) { animation-delay: 0.2s; }
.model-card:nth-child(6) { animation-delay: 0.25s; }
.model-card:nth-child(7) { animation-delay: 0.3s; }
.model-card:nth-child(8) { animation-delay: 0.35s; }

.model-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(255, 65, 65, 0.1);
}

/* 更多模型卡：虚线边框 */
.model-card.more {
  border-style: dashed;
}

.model-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  font-size: 21px;
  font-weight: 700;
}

.model-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
}

.model-card.more .model-name {
  color: var(--text-link);
  font-weight: 500;
}

.model-coming {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 2px 8px;
  border-radius: 100px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  font-size: 10.5px;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .model-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
