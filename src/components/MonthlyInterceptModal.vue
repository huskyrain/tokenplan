<!-- src/components/MonthlyInterceptModal.vue -->
<!-- 需求2：年包生效中 → 点击连续包月 → 拦截弹窗（预约到期提醒） -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-mask" @click.self="handleClose">
        <div class="modal-dialog">
          <button class="modal-close" @click="handleClose">×</button>

          <!-- 拦截态 -->
          <div v-if="!booked" class="modal-body intercept-body">
            <div class="intercept-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3 class="intercept-title">暂不可开通{{ productName }}</h3>
            <p class="intercept-desc">{{ interceptText }}</p>
            <div class="intercept-actions">
              <button class="modal-btn btn-black" @click="handleBookReminder" :disabled="booking">
                {{ booking ? '预约中…' : '预约到期提醒' }}
              </button>
              <button class="modal-btn btn-outline" @click="handleClose">我知道了</button>
            </div>
          </div>

          <!-- 预约成功态 -->
          <div v-else class="modal-body success-body">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="intercept-title">预约成功</h3>
            <p class="intercept-desc">年包到期前我们将通过短信与站内消息提醒您开通{{ productName }}。</p>
            <button class="modal-btn btn-black" @click="handleClose">完成</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import { bookExpiryReminder } from '@/api/order';

const props = withDefaults(defineProps<{
  visible: boolean;
  productName?: string;
}>(), {
  productName: '连续包月'
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const userStore = useUserStore();
const toastStore = useToastStore();

const booked = ref(false);
const booking = ref(false);
const alreadyBooked = ref(false);

watch(
  () => props.visible,
  (v) => {
    if (v) {
      // 如果已预约过，直接显示已预约提示
      alreadyBooked.value = !!userStore.expiryReminder;
      booked.value = false;
      booking.value = false;
      if (alreadyBooked.value) {
        toastStore.push('您已预约到期提醒，无需重复预约', 'info', 3000);
      }
    }
  }
);

// 拦截正文：取 mock 中的年包信息
const interceptText = computed(() => {
  const sub = userStore.userSubscription;
  if (!sub) return `您已有生效中的年包，${props.productName}需待年包结束后方可开通。`;
  const planName = sub.planName || '基础版';
  const endStr = sub.endDate ? formatDate(new Date(sub.endDate)) : '';
  return `您已有生效中的年包（${planName} · 年包，有效期至 ${endStr}）。为避免权益重叠，${props.productName}需待年包结束后方可开通。`;
});

const handleBookReminder = async () => {
  if (!userStore.userInfo?.id) return;
  if (alreadyBooked.value) {
    toastStore.push('您已预约到期提醒，无需重复预约', 'info', 3000);
    booked.value = true;
    return;
  }
  booking.value = true;
  try {
    const result = await bookExpiryReminder(userStore.userInfo.id);
    if (result.alreadyBooked) {
      toastStore.push('您已预约到期提醒，无需重复预约', 'info', 3000);
    }
    await userStore.refreshUserState();
    booked.value = true;
  } catch (err) {
    toastStore.push(`预约失败：${(err as Error).message}`, 'error');
  } finally {
    booking.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-dialog {
  position: relative;
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.25s ease;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 2;
}

.modal-close:hover {
  color: var(--text-title);
}

.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 拦截态 */
.intercept-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff7e6;
  margin-bottom: 16px;
}

.intercept-icon svg {
  width: 28px;
  height: 28px;
  color: #fa8c16;
}

.intercept-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
  text-align: center;
}

.intercept-desc {
  margin: 0 0 22px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-link);
  text-align: center;
}

.intercept-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 成功态 */
.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(26, 26, 26, 0.06);
  margin-bottom: 16px;
}

.success-icon svg {
  width: 26px;
  height: 26px;
  color: var(--btn-black);
}

/* 按钮 */
.modal-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.modal-btn:hover {
  opacity: 0.88;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-black {
  background: var(--btn-black);
  color: #fff;
}

.btn-outline {
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
}

.btn-outline:hover {
  border-color: var(--text-secondary);
  color: var(--text-title);
  opacity: 1;
}

/* 过渡 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
