// src/stores/boosterStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { BoosterPack } from '@/types/order';
import { getUserBoosterPacks, purchaseBoosterPack, isBoosterPackValid } from '@/api/booster';

export const useBoosterStore = defineStore('booster', () => {
  const boosterPacks = ref<BoosterPack[]>([]);
  const selectedBooster = ref<BoosterPack | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取用户加油包列表
  const fetchUserBoosterPacks = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const packs = await getUserBoosterPacks(userId);
      boosterPacks.value = packs;
    } catch (err) {
      error.value = (err as Error).message;
      console.error('Error fetching booster packs:', err);
    } finally {
      loading.value = false;
    }
  };

  // 购买加油包（档位 + 绑定生效服务单 + 数量）
  const buyBoosterPack = async (tierId: string, userId: string, boundTo: string, qty: number = 1) => {
    loading.value = true;
    error.value = null;
    try {
      const { boosterPack } = await purchaseBoosterPack(tierId, userId, boundTo, qty);
      boosterPacks.value.push(boosterPack);
      return boosterPack;
    } catch (err) {
      error.value = (err as Error).message;
      console.error('Error purchasing booster pack:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 检查加油包是否有效
  const checkBoosterValidity = async (boosterId: string) => {
    try {
      const isValid = await isBoosterPackValid(boosterId);
      const index = boosterPacks.value.findIndex((pack) => pack.id === boosterId);
      if (index !== -1) {
        boosterPacks.value[index].status = isValid ? 'active' : 'expired';
      }
      return isValid;
    } catch (err) {
      console.error('Error checking booster validity:', err);
      return false;
    }
  };

  const setSelectedBooster = (booster: BoosterPack | null) => {
    selectedBooster.value = booster;
  };

  // 获取有效的加油包
  const validBoosterPacks = computed(() => {
    return boosterPacks.value.filter((pack) => pack.status === 'active');
  });

  // 获取已过期的加油包
  const expiredBoosterPacks = computed(() => {
    return boosterPacks.value.filter((pack) => pack.status === 'expired');
  });

  // 获取绑定某服务单的加油包 Token 总量
  const getTotalTokenBalance = (boundTo: string) => {
    return boosterPacks.value
      .filter((pack) => pack.boundTo === boundTo && pack.status === 'active')
      .reduce((sum, pack) => sum + pack.tokenAmount, 0);
  };

  return {
    boosterPacks: computed(() => boosterPacks.value),
    selectedBooster: computed(() => selectedBooster.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    validBoosterPacks,
    expiredBoosterPacks,
    fetchUserBoosterPacks,
    buyBoosterPack,
    checkBoosterValidity,
    setSelectedBooster,
    getTotalTokenBalance
  };
});
