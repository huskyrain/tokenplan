<!-- src/views/sections/TokenKeySection.vue -->
<template>
  <section class="token-key-section">
    <div class="container">
      <!-- 标题区 -->
      <div class="tk-head">
        <div class="tk-launch">
          <span class="launch-tag">震撼上市</span>
          <span class="new-badge">NEW</span>
        </div>
        <h2 class="tk-title">
          词元宝 <span class="token-red">Token Key</span>
        </h2>
      </div>

      <div class="tk-body">
        <!-- 左：金色硬件设备图 + 购买 -->
        <div class="tk-device">
          <div class="device-stage">
            <div class="device-halo"></div>
            <!-- 金色硬件设备（占位图形） -->
            <svg class="device" viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#F7E3A1" />
                  <stop offset="45%" stop-color="#E3B34C" />
                  <stop offset="100%" stop-color="#B8860B" />
                </linearGradient>
                <linearGradient id="gold-dark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#D9A93F" />
                  <stop offset="100%" stop-color="#9C6F14" />
                </linearGradient>
              </defs>
              <!-- 挂绳孔 -->
              <ellipse cx="120" cy="34" rx="26" ry="10" fill="none" stroke="url(#gold-dark)" stroke-width="6" />
              <!-- 主体 -->
              <rect x="70" y="40" width="100" height="196" rx="26" fill="url(#gold)" />
              <rect x="70" y="40" width="100" height="196" rx="26" stroke="url(#gold-dark)" stroke-width="2" />
              <!-- 侧面高光 -->
              <rect x="82" y="52" width="12" height="172" rx="6" fill="#fff" opacity="0.35" />
              <!-- USB 接口 -->
              <path d="M95 236 h50 l-6 26 a6 6 0 01-6 5 h-26 a6 6 0 01-6-5 z" fill="url(#gold-dark)" />
              <rect x="104" y="246" width="6" height="10" rx="2" fill="#7a5a10" />
              <rect x="130" y="246" width="6" height="10" rx="2" fill="#7a5a10" />
              <!-- 红色品牌环 -->
              <rect x="70" y="88" width="100" height="10" fill="#FF4141" opacity="0.9" />
              <!-- Token 标识 -->
              <circle cx="120" cy="146" r="30" fill="#fff" opacity="0.92" />
              <text x="120" y="141" text-anchor="middle" font-size="13" font-weight="700" fill="#B8860B">Token</text>
              <text x="120" y="158" text-anchor="middle" font-size="12" font-weight="600" fill="#1A1A1A">Key</text>
              <!-- 指示灯 -->
              <circle cx="120" cy="200" r="5" fill="#FF4141">
                <animate attributeName="opacity" values="1;0.25;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          <!-- 立即购买：黑 180×52 圆角8 -->
          <button class="tk-buy-btn" @click="emit('buy')">立即购买</button>
          <p class="tk-platform">当前支持 Windows，Mac、Linux 敬请期待</p>
        </div>

        <!-- 右：5 特性项 -->
        <div class="tk-features">
          <div v-for="f in features" :key="f.title" class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="f.icon" />
              </svg>
            </div>
            <div class="feature-text">
              <h4 class="feature-title">{{ f.title }}</h4>
              <p class="feature-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TOKEN_KEY_FEATURES as features } from '@/constants/tokenKey';

const emit = defineEmits<{ buy: [] }>();
</script>

<style scoped>
.token-key-section {
  padding: 88px 0 96px;
  background: #fff;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 标题区 */
.tk-head {
  text-align: center;
}

.tk-launch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  border-radius: 100px;
  background: linear-gradient(90deg, rgba(255, 65, 65, 0.08), rgba(255, 94, 15, 0.08));
  border: 1px solid rgba(255, 65, 65, 0.2);
}

.launch-tag {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--brand-red);
}

.new-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  border-radius: 100px;
  background: var(--brand-red);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 标题 40px/500 */
.tk-title {
  margin: 18px 0 0;
  font-size: 40px;
  font-weight: 500;
  color: var(--text-title);
}

.token-red {
  color: var(--brand-red);
}

/* 主体双栏 */
.tk-body {
  display: flex;
  align-items: stretch;
  gap: 72px;
  margin-top: 56px;
}

/* 左：设备 */
.tk-device {
  flex-shrink: 0;
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-stage {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24px 0 40px;
}

.device-halo {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 134, 11, 0.14) 0%, rgba(184, 134, 11, 0) 70%);
}

.device {
  position: relative;
  width: 232px;
  filter: drop-shadow(0 24px 40px rgba(184, 134, 11, 0.3));
  animation: float 4.5s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 购买按钮：黑 180×52 圆角8 */
.tk-buy-btn {
  width: 180px;
  height: 52px;
  border: none;
  border-radius: 8px;
  background: var(--btn-black);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.tk-buy-btn:hover {
  opacity: 0.88;
}

.tk-buy-btn:active {
  transform: scale(0.98);
}

.tk-platform {
  margin: 14px 0 0;
  font-size: 12.5px;
  color: var(--text-secondary);
}

/* 右：5 特性 */
.tk-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.25s, transform 0.25s;
}

.feature-item:hover {
  border-color: rgba(255, 65, 65, 0.35);
  box-shadow: 0 8px 24px rgba(255, 65, 65, 0.08);
  transform: translateX(4px);
}

.feature-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 65, 65, 0.08), rgba(255, 94, 15, 0.08));
}

.feature-icon svg {
  width: 22px;
  height: 22px;
  color: var(--brand-red);
}

.feature-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
}

.feature-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-link);
}

@media (max-width: 1000px) {
  .tk-body {
    flex-direction: column;
    align-items: center;
  }

  .tk-features {
    width: 100%;
    max-width: 560px;
  }
}
</style>
