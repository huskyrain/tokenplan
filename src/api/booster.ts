// src/api/booster.ts
import type { BoosterPack, Order } from '@/types/order';
import { mockApis } from '@/mock/apiMock';

// 购买加油包（档位 + 绑定生效服务单 + 数量）
export const purchaseBoosterPack = async (
  tierId: string,
  userId: string,
  boundTo: string,
  qty: number = 1
): Promise<{ boosterPack: BoosterPack; order: Order }> => {
  return mockApis.purchaseBooster(tierId, userId, boundTo, qty);
};

// 获取用户的加油包列表
export const getUserBoosterPacks = async (userId: string): Promise<BoosterPack[]> => {
  return mockApis.getUserBoosterPacks(userId);
};

// 检查加油包是否仍然有效
export const isBoosterPackValid = async (boosterId: string): Promise<boolean> => {
  // 简化模拟：以本地状态为准
  await new Promise((resolve) => setTimeout(resolve, 200));
  return !!boosterId;
};
