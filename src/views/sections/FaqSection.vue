<!-- src/views/sections/FaqSection.vue -->
<!-- FAQ 区：7 条手风琴（首条默认展开，答案 v-html 渲染 <br>） -->
<template>
  <section class="faq-section">
    <div class="container">
      <!-- 标题行 -->
      <div class="faq-head">
        <h2 class="section-title">常见问题</h2>
        <div class="faq-head-right">
          <span class="faq-more">更多问题查看文档中心</span>
          <button class="faq-btn" @click="handleViewDocs">查看文档中心 →</button>
        </div>
      </div>

      <!-- 手风琴 -->
      <div class="faq-list">
        <div
          v-for="(item, index) in faqs"
          :key="index"
          class="faq-item"
          :class="{ open: openIndex === index }"
        >
          <button class="faq-question" @click="toggle(index)">
            <span class="q-text">{{ item.q }}</span>
            <span class="q-arrow" :class="{ rotated: openIndex === index }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          <div class="faq-answer-wrap" :style="{ maxHeight: openIndex === index ? '600px' : '0' }">
            <!-- 答案含 <br>，用 v-html 渲染 -->
            <p class="faq-answer" v-html="item.a"></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToastStore } from '@/stores/toastStore';

const toastStore = useToastStore();

// 真实采集 FAQ 数据（逐字采用，含 <br>）
const faqs = [
  {
    q: '购买后如何获取 API Key ？',
    a: '购买成功后，系统会自动为当前订阅创建一个默认 API Key。<br>查看路径：<br>1. 打开百应智能体。<br>2. 进入「我的」-「订阅管理」-「API Key」。<br>3. 复制并保存当前订阅的 API Key。<br>API Key 是调用凭证，请勿公开分享或上传至公开代码仓库。'
  },
  {
    q: '购买后套餐多久有效 ？',
    a: '百应 Token Plan 为月度订阅套餐。购买并支付成功后，额度立即激活，购买当日可直接使用。<br>套餐有效期从次日 00:00 开始计算，共 30 个自然日，并在第 30 日 23:59:59 到期。例如，5 月 14 日购买套餐，5 月 14 日当天即可使用；正式有效期为 5 月 15 日 00:00 至 6 月 13 日 23:59:59。<br>套餐到期后，未使用额度将自动失效，不结转至下一周期。'
  },
  {
    q: '如何查看 Token Plan 用量 ？',
    a: '进入百应智能体「我的」-「订阅管理」-「用量」，即可查看总额度、已消耗额度、剩余额度和有效期。'
  },
  {
    q: '词元宝安全实体是什么？',
    a: '词元宝不止是硬件。它将 Token 权益、AI 工具配置、API Key 安全管理和资源管控整合为一体，是完整的 AI 权益交付入口。插入即激活，无需手动填写配置，个人极简上手，企业可管可控。'
  },
  {
    q: '词元宝支持哪些 AI 工具？',
    a: '支持 Token Plan 生态内的主流 AI 编程与生产力工具。具体工具范围会跟随产品配置持续更新，企业用户也可以按团队场景进行组合配置。'
  },
  {
    q: '购买后多久可以收到词元宝？',
    a: '购买后可在订阅管理中查看交付状态，企业批量采购会由专属顾问确认交付周期。'
  },
  {
    q: '词元宝的硬件安全是如何保障的？',
    a: '通过硬件绑定、密钥隔离、拔出停用和企业后台集中管理，降低未授权使用和密钥泄露风险。'
  }
];

// 首条默认展开
const openIndex = ref<number>(0);

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? -1 : index;
};

const handleViewDocs = () => {
  toastStore.push('即将前往文档中心（演示）', 'info');
};
</script>

<style scoped>
.faq-section {
  padding: 88px 0 100px;
  background: #fff;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.faq-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}

.section-title {
  margin: 0;
  font-size: 40px;
  font-weight: 500;
  color: var(--text-title);
  letter-spacing: 1px;
}

.faq-head-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.faq-more {
  font-size: 13px;
  color: var(--text-secondary);
}

.faq-btn {
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: var(--btn-black);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.faq-btn:hover {
  opacity: 0.88;
}

/* 手风琴 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  background: #fff;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.faq-item.open {
  border-color: rgba(255, 65, 65, 0.4);
  box-shadow: 0 8px 24px rgba(255, 65, 65, 0.06);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.q-text {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text-title);
}

.q-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fafafa;
  color: var(--text-link);
  transition: transform 0.25s, background 0.25s, color 0.25s;
}

.q-arrow svg {
  width: 15px;
  height: 15px;
}

.q-arrow.rotated {
  transform: rotate(180deg);
  background: var(--brand-red);
  color: #fff;
}

/* 展开答案 */
.faq-answer-wrap {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-answer {
  margin: 0;
  padding: 0 24px 22px;
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--text-link);
}

@media (max-width: 700px) {
  .faq-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
