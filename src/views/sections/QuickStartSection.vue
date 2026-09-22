<!-- src/views/sections/QuickStartSection.vue -->
<!-- 极速接入区：API 配置卡 + 联想百应Claw 零配置卡 -->
<template>
  <section class="quick-section">
    <div class="container">
      <!-- 标题行：H2 + 右侧文档链接 -->
      <div class="quick-head">
        <h2 class="section-title">极速接入</h2>
        <a href="#" class="doc-link" @click.prevent>详细步骤请看 完整文档 →</a>
      </div>

      <div class="quick-grid">
        <!-- 卡1：API 介入，自由配置 -->
        <div class="quick-card">
          <span class="card-tag tag-dark">API 介入，自由配置</span>
          <h3 class="card-title">AI 工具配置</h3>
          <p class="card-desc">
            通过 API Key 将 Token Plan 接入任意 AI 工具或自建系统中。兼容 OpenAI 与 Anthropic
            标准协议，配置简单，一个 Key 通用多个平台。
          </p>
          <button class="card-btn btn-black" @click="handleGetKey">
            获取API Key →
          </button>
        </div>

        <!-- 卡2：推荐使用 -->
        <div class="quick-card recommended">
          <span class="card-tag tag-red">推荐使用</span>
          <h3 class="card-title">联想百应Claw · 零配置</h3>
          <p class="card-desc">
            联想官方 Claw 桌面应用，购买 Token Plan 后无需任何额外配置，即可立即使用。
          </p>
          <button class="card-btn btn-red" @click="handleGoClaw">
            前往使用 →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore';

const toastStore = useToastStore();

const handleGetKey = () => {
  toastStore.push('查看路径：百应智能体 →「我的」→「订阅管理」→「API Key」', 'info', 3400);
};

const handleGoClaw = () => {
  toastStore.push('即将前往联想百应Claw（演示）', 'info');
};
</script>

<style scoped>
.quick-section {
  padding: 88px 0 96px;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.quick-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 44px;
}

.section-title {
  margin: 0;
  font-size: 40px;
  font-weight: 500;
  color: var(--text-title);
  letter-spacing: 1px;
}

.doc-link {
  font-size: 14px;
  color: var(--text-link);
  text-decoration: none;
  transition: color 0.2s;
}

.doc-link:hover {
  color: var(--brand-red);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-card {
  position: relative;
  padding: 36px 36px 32px;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.quick-card.recommended {
  border-color: rgba(255, 65, 65, 0.45);
}

.quick-card.recommended::after {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 65, 65, 0.08) 0%, rgba(255, 65, 65, 0) 70%);
}

/* 标签 */
.card-tag {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 18px;
}

.tag-dark {
  background: #f2f2f2;
  color: var(--text-title);
}

.tag-red {
  background: rgba(255, 65, 65, 0.1);
  color: var(--brand-red);
}

.card-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-title);
}

.card-desc {
  margin: 0 0 26px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-link);
  min-height: 74px;
}

.card-btn {
  height: 44px;
  padding: 0 26px;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.card-btn:hover {
  opacity: 0.88;
}

.btn-black {
  background: var(--btn-black);
}

.btn-red {
  background: var(--brand-red);
}

@media (max-width: 900px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .quick-head {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
