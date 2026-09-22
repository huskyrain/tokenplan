// src/composables/useSubscription.ts
import { ref, computed } from 'vue';
import { Plan } from '@/types/plan';
import {
  createSubscription as createSubscriptionApi,
  cancelSubscription as cancelSubscriptionApi
} from '@/api/subscription';
import { createOrder } from '@/api/order';

interface SubscriptionFlowState {
  currentStep: 'select_plan' | 'confirm_order' | 'payment_processing' | 'success' | 'error';
  selectedPlan: Plan | null;
  orderId: string | null;
  error: string | null;
}

export const useSubscription = () => {
  const state = ref<SubscriptionFlowState>({
    currentStep: 'select_plan',
    selectedPlan: null,
    orderId: null,
    error: null
  });

  const selectPlan = (plan: Plan) => {
    state.value.selectedPlan = plan;
    state.value.currentStep = 'confirm_order';
    state.value.error = null;
  };

  // 开始订阅流程（连续包月：弹窗内使用 SubscribeModal，此方法保留供旧流程）
  const startSubscription = async (userId: string) => {
    if (!state.value.selectedPlan) {
      state.value.error = '未选择套餐';
      return;
    }
    state.value.currentStep = 'payment_processing';
    try {
      const result = await createSubscriptionApi(state.value.selectedPlan.id, userId);
      state.value.orderId = result.orderId;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      state.value.currentStep = 'success';
    } catch (err) {
      state.value.error = (err as Error).message;
      state.value.currentStep = 'error';
    }
  };

  // 取消订阅（连续包月）
  const cancelCurrentSubscription = async (subscriptionId: string) => {
    await cancelSubscriptionApi(subscriptionId);
    if (state.value.selectedPlan) {
      state.value.currentStep = 'select_plan';
    }
  };

  // 购买年包（手动排队）
  const purchaseAnnualPlan = async (plan: Plan, userId: string) => {
    state.value.selectedPlan = plan;
    state.value.currentStep = 'payment_processing';
    try {
      const order = await createOrder(plan.id, userId);
      state.value.orderId = order.id;
      state.value.currentStep = 'success';
    } catch (err) {
      state.value.error = (err as Error).message;
      state.value.currentStep = 'error';
    }
  };

  const reset = () => {
    state.value = {
      currentStep: 'select_plan',
      selectedPlan: null,
      orderId: null,
      error: null
    };
  };

  return {
    state: computed(() => state.value),
    selectPlan,
    startSubscription,
    cancelCurrentSubscription,
    purchaseAnnualPlan,
    reset
  };
};
