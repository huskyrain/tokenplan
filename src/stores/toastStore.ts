// src/stores/toastStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

let seed = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([]);

  const push = (message: string, type: ToastItem['type'] = 'info', duration = 2800) => {
    const id = ++seed;
    toasts.value.push({ id, message, type });
    setTimeout(() => dismiss(id), duration);
  };

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return { toasts, push, dismiss };
});
