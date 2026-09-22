<!-- src/views/sections/HeroSection.vue -->
<template>
  <section class="hero-section">
    <!-- 背景装饰 -->
    <div class="hero-decor decor-1"></div>
    <div class="hero-decor decor-2"></div>

    <div class="container hero-main">
      <div class="hero-left">
        <!-- H1：Token 红色，Token 与 Plan 之间为双空格 -->
        <h1 class="hero-title">
          联想百应 <span class="token-red">Token</span>&nbsp;&nbsp;Plan
        </h1>

        <p class="hero-subtitle">
          联想百应 Token Plan — 聚合旗舰模型、即买即用的 AI 算力订阅服务，兼容主流编程工具和智能体，助力高效落地
          AI 生产力。
        </p>

        <!-- 模型徽标条 -->
        <div class="model-badges">
          <span v-for="m in models" :key="m" class="model-badge">{{ m }}</span>
        </div>
      </div>

      <!-- 右侧吉祥物 -->
      <div class="hero-right">
        <div class="mascot-glow"></div>
        <svg class="mascot" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 天线 -->
          <line x1="130" y1="34" x2="130" y2="66" stroke="#FF4141" stroke-width="5" stroke-linecap="round" />
          <circle cx="130" cy="26" r="9" fill="#FF4141" />
          <!-- 头部 -->
          <rect x="55" y="62" width="150" height="112" rx="40" fill="#FFFFFF" stroke="#FF4141" stroke-width="5" />
          <!-- 眼睛 -->
          <circle cx="103" cy="112" r="11" fill="#1A1A1A" />
          <circle cx="157" cy="112" r="11" fill="#1A1A1A" />
          <circle cx="106.5" cy="108" r="3.5" fill="#fff" />
          <circle cx="160.5" cy="108" r="3.5" fill="#fff" />
          <!-- 腮红 -->
          <ellipse cx="80" cy="132" rx="9" ry="6" fill="#FFD9D9" />
          <ellipse cx="180" cy="132" rx="9" ry="6" fill="#FFD9D9" />
          <!-- 嘴巴 -->
          <path d="M118 134 Q130 144 142 134" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round" />
          <!-- 身体 -->
          <path
            d="M70 186 C70 172 190 172 190 186 L196 258 C196 274 64 274 64 258 Z"
            fill="#FF4141"
          />
          <!-- 身体高光 -->
          <path d="M84 190 C84 182 116 180 116 188 L112 252 C112 264 84 262 84 250 Z" fill="#FFFFFF" opacity="0.18" />
          <!-- Token 徽章 -->
          <circle cx="130" cy="224" r="30" fill="#FFFFFF" />
          <text x="130" y="219" text-anchor="middle" font-size="12" font-weight="700" fill="#FF4141">Token</text>
          <text x="130" y="236" text-anchor="middle" font-size="11" font-weight="600" fill="#1A1A1A">Key</text>
          <!-- 手 -->
          <circle cx="52" cy="216" r="16" fill="#FFFFFF" stroke="#FF4141" stroke-width="4" />
          <circle cx="208" cy="216" r="16" fill="#FFFFFF" stroke="#FF4141" stroke-width="4" />
          <!-- 脚 -->
          <ellipse cx="98" cy="278" rx="22" ry="12" fill="#1A1A1A" />
          <ellipse cx="162" cy="278" rx="22" ry="12" fill="#1A1A1A" />
        </svg>
      </div>
    </div>

    <!-- 4 格价值主张卡（磨砂白卡） -->
    <div class="container value-grid">
      <div v-for="v in values" :key="v.title" class="value-card">
        <svg class="value-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path :d="v.icon" />
        </svg>
        <span class="value-title">{{ v.title }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const models = ['Qwen', 'DeepSeek', 'Doubao', 'Kimi', 'MiniMax', 'GLM', 'Hy'];

const values = [
  { title: '主流模型覆盖', icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 4V6z' },
  { title: '套餐灵活可选', icon: 'M12 3v18M3 8l9-5 9 5-9 5-9-5zM3 16l9 5 9-5' },
  { title: '权益快捷绑定', icon: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z' },
  { title: '实体安全交付', icon: 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4zM9 12l2 2 4-4' }
];
</script>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 88px 0 72px;
  background: linear-gradient(180deg, #fff5f3 0%, #fff 100%);
}

/* 装饰光斑 */
.hero-decor {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.decor-1 {
  width: 420px;
  height: 420px;
  right: -140px;
  top: -160px;
  background: radial-gradient(circle, rgba(255, 65, 65, 0.1) 0%, rgba(255, 65, 65, 0) 70%);
}

.decor-2 {
  width: 300px;
  height: 300px;
  left: -120px;
  bottom: -100px;
  background: radial-gradient(circle, rgba(255, 94, 15, 0.07) 0%, rgba(255, 94, 15, 0) 70%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.hero-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

/* H1：70px / 700 */
.hero-title {
  margin: 0;
  font-size: 70px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1px;
  color: var(--text-title);
  animation: fade-up 0.6s ease both;
}

.token-red {
  color: var(--brand-red);
}

.hero-subtitle {
  margin: 22px 0 0;
  max-width: 640px;
  font-size: 20px;
  line-height: 1.7;
  color: var(--text-link);
  animation: fade-up 0.6s 0.08s ease both;
}

/* 模型徽标条 */
.model-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
  animation: fade-up 0.6s 0.16s ease both;
}

.model-badge {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 18px;
  border-radius: 100px;
  background: #fff;
  border: 1px solid var(--card-border);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-title);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s, transform 0.2s;
}

.model-badge:hover {
  border-color: var(--brand-red);
  transform: translateY(-2px);
}

/* 右侧吉祥物 */
.hero-right {
  position: relative;
  flex-shrink: 0;
  width: 320px;
  display: flex;
  justify-content: center;
}

.mascot-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 65, 65, 0.12) 0%, rgba(255, 65, 65, 0) 70%);
}

.mascot {
  position: relative;
  width: 260px;
  height: auto;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* 4 格价值主张卡：磨砂白 */
.value-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 56px;
}

.value-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fade-up 0.6s ease both;
}

.value-card:nth-child(2) { animation-delay: 0.06s; }
.value-card:nth-child(3) { animation-delay: 0.12s; }
.value-card:nth-child(4) { animation-delay: 0.18s; }

.value-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(255, 65, 65, 0.1);
}

.value-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  color: var(--brand-red);
}

.value-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-title);
}

@media (max-width: 1000px) {
  .hero-title {
    font-size: 46px;
  }

  .hero-right {
    display: none;
  }

  .value-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
