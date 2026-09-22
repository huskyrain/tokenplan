<!-- src/components/InvoiceForm.vue -->
<!-- 共享发票表单组件：开关 + 抬头类型/发票类型单选 + 发票抬头/税号/邮箱输入 + 校验 -->
<template>
  <div class="invoice-section">
    <!-- 灰色卡片包裹整个发票区 -->
    <div class="invoice-card">
      <!-- 需要发票开关行 -->
      <div class="toggle-row">
        <span class="toggle-label">需要发票</span>
        <button
          class="ios-toggle"
          :class="{ on: needInvoice }"
          @click="needInvoice = !needInvoice"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>

      <!-- 展开的发票表单 -->
      <div v-if="needInvoice" class="invoice-form">
        <!-- 抬头类型 -->
        <div class="form-row">
          <label class="form-label">抬头类型<span class="req">*</span></label>
          <div class="radio-group">
            <label class="radio-item" @click="titleType = 'individual'">
              <span class="radio-dot" :class="{ checked: titleType === 'individual' }"></span>
              <span>个人</span>
            </label>
            <label class="radio-item" @click="titleType = 'enterprise'">
              <span class="radio-dot" :class="{ checked: titleType === 'enterprise' }"></span>
              <span>企业</span>
            </label>
          </div>
        </div>

        <!-- 发票类型 -->
        <div class="form-row">
          <label class="form-label">发票类型<span class="req">*</span></label>
          <div class="radio-group">
            <label class="radio-item" @click="invoiceType = 'general'">
              <span class="radio-dot" :class="{ checked: invoiceType === 'general' }"></span>
              <span>增值税普通发票</span>
            </label>
            <label class="radio-item" @click="invoiceType = 'special'">
              <span class="radio-dot" :class="{ checked: invoiceType === 'special' }"></span>
              <span>增值税专用发票</span>
            </label>
          </div>
        </div>

        <!-- 发票抬头 -->
        <div class="form-row">
          <label class="form-label">发票抬头<span class="req">*</span></label>
          <input
            v-model.trim="invoiceTitle"
            class="form-input"
            :class="{ error: errors.invoiceTitle }"
            type="text"
            :placeholder="titleType === 'individual' ? '请输入姓名' : '请输入企业名称'"
          />
        </div>
        <p v-if="errors.invoiceTitle" class="field-error">{{ errors.invoiceTitle }}</p>

        <!-- 纳税人识别号（仅企业） -->
        <div v-if="titleType === 'enterprise'" class="form-row">
          <label class="form-label">纳税人识别号<span class="req">*</span></label>
          <input
            v-model.trim="taxId"
            class="form-input"
            :class="{ error: errors.taxId }"
            type="text"
            placeholder="请输入纳税人识别号"
          />
        </div>
        <p v-if="errors.taxId" class="field-error">{{ errors.taxId }}</p>

        <!-- 收票人邮箱 -->
        <div class="form-row">
          <label class="form-label">收票人邮箱<span class="req">*</span></label>
          <input
            v-model.trim="email"
            class="form-input"
            :class="{ error: errors.email }"
            type="email"
            placeholder="请输入接受发票的邮箱"
          />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

type TitleType = 'individual' | 'enterprise';
type InvoiceType = 'general' | 'special';

const needInvoice = ref(false);
const titleType = ref<TitleType>('enterprise');
const invoiceType = ref<InvoiceType>('general');
const invoiceTitle = ref('');
const taxId = ref('');
const email = ref('');
const errors = ref<Record<string, string>>({});

// 切换抬头类型时清空对应字段
watch(titleType, () => {
  invoiceTitle.value = '';
  taxId.value = '';
  errors.value = {};
});

/** 校验发票表单，返回是否通过 */
const validate = (): boolean => {
  errors.value = {};
  if (!needInvoice.value) return true;

  if (!invoiceTitle.value) {
    errors.value.invoiceTitle = titleType.value === 'individual' ? '请输入姓名' : '请输入企业名称';
  }

  if (titleType.value === 'enterprise' && !taxId.value) {
    errors.value.taxId = '请输入纳税人识别号';
  }

  if (!email.value) {
    errors.value.email = '请输入接受发票的邮箱';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '邮箱格式不正确';
  }

  return Object.keys(errors.value).length === 0;
};

/** 重置表单状态 */
const reset = () => {
  needInvoice.value = false;
  titleType.value = 'enterprise';
  invoiceType.value = 'general';
  invoiceTitle.value = '';
  taxId.value = '';
  email.value = '';
  errors.value = {};
};

defineExpose({ validate, reset });
</script>

<style scoped>
.invoice-section {
  width: 100%;
}

.invoice-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px 18px;
}

/* 开关行 */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-label {
  font-size: 14px;
  color: var(--text-title);
  font-weight: 500;
}

/* iOS 风格开关 */
.ios-toggle {
  position: relative;
  width: 42px;
  height: 24px;
  border: none;
  border-radius: 14px;
  background: #d8d8d8;
  cursor: pointer;
  transition: background 0.25s;
  padding: 0;
  flex-shrink: 0;
}

.ios-toggle.on {
  background: #333333;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s ease;
}

.ios-toggle.on .toggle-slider {
  transform: translateX(18px);
}

/* 发票表单 */
.invoice-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: var(--text-title);
  font-weight: 400;
}

.req {
  color: var(--brand-red);
  margin-left: 2px;
}

/* 单选组 */
.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-title);
  user-select: none;
}

.radio-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid #c0c0c0;
  background: #fff;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.radio-dot.checked {
  border-color: #1a1a1a;
}

.radio-dot.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1a1a1a;
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: var(--text-title);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input::placeholder {
  color: #b0b0b0;
  font-size: 13px;
}

.form-input:focus {
  border-color: var(--text-title);
}

.form-input.error {
  border-color: var(--brand-red);
}

/* 行内错误提示 */
.field-error {
  margin: -8px 0 0;
  font-size: 12px;
  color: var(--brand-red);
}
</style>
