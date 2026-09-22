// src/stores/planStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Plan, PlanType } from '@/types/plan';
import { getPlans } from '@/api/subscription';

export const usePlanStore = defineStore('plan', () => {
  const plans = ref<Record<PlanType, Plan[]>>({
    [PlanType.CONTINUOUS_MONTHLY]: [],
    [PlanType.CONTINUOUS_QUARTERLY]: [],
    [PlanType.MONTHLY_ONETIME]: [],
    [PlanType.ANNUAL]: [],
    [PlanType.TOKEN_KEY]: [],
    [PlanType.BOOSTER]: []
  });
  
  const currentPlanType = ref<PlanType>(PlanType.CONTINUOUS_MONTHLY);
  const currentPlan = ref<Plan | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取特定类型的套餐列表
  const fetchPlans = async (planType: PlanType) => {
    loading.value = true;
    error.value = null;
    
    try {
      const fetchedPlans = await getPlans(planType);
      plans.value[planType] = fetchedPlans;
    } catch (err) {
      error.value = (err as Error).message;
      console.error(`Error fetching ${planType} plans:`, err);
    } finally {
      loading.value = false;
    }
  };

  // 设置当前选中的套餐类型
  const setCurrentPlanType = (planType: PlanType) => {
    currentPlanType.value = planType;
  };

  // 设置当前选中的套餐
  const setCurrentPlan = (plan: Plan | null) => {
    currentPlan.value = plan;
  };

  // 获取当前类型的套餐列表
  const getCurrentPlans = computed(() => {
    return plans.value[currentPlanType.value];
  });

  // 获取当前选中的套餐
  const getCurrentPlan = computed(() => {
    return currentPlan.value;
  });

  return {
    plans: computed(() => plans.value),
    currentPlanType: computed(() => currentPlanType.value),
    currentPlan: computed(() => currentPlan.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchPlans,
    setCurrentPlanType,
    setCurrentPlan,
    getCurrentPlans,
    getCurrentPlan,
  };
});
