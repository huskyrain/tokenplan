// src/api/subscription.ts
import type { Plan, PlanType, Subscription, TokenKeyProduct, BoosterTier, MockUserInfo, UserScenario } from '@/types/plan';
import { mockApis } from '@/mock/apiMock';

// 团队定制：Token 基础包单价（1 亿 Token / 份，¥150）
export { TEAM_TOKEN_PACK_PRICE } from '@/mock/apiMock';

// 团队定制：联想百应词元宝单价（¥150/个）
export { TEAM_KEY_PRICE } from '@/mock/apiMock';

// 获取套餐列表
export const getPlans = async (planType: PlanType): Promise<Plan[]> => {
  return mockApis.getPlans(planType);
};

// 获取词元宝产品信息
export const getTokenKeyProduct = async (): Promise<TokenKeyProduct> => {
  return mockApis.getTokenKeyProduct();
};

// 获取加油包档位
export const getBoosterTiers = async (): Promise<BoosterTier[]> => {
  return mockApis.getBoosterTiers();
};

// 模拟登录（scenario: no-subscription / monthly-subscribed）
export const login = async (scenario: UserScenario): Promise<MockUserInfo> => {
  return mockApis.login(scenario);
};

export const logout = async (): Promise<void> => {
  return mockApis.logout();
};

export const getCurrentUser = async (): Promise<MockUserInfo | null> => {
  return mockApis.getCurrentUser();
};

// 创建订阅（连续包月，微信签约扣款）
export const createSubscription = async (
  planId: string,
  userId: string
): Promise<{ orderId: string; prepayId: string; contractCode: string; subscription: Subscription }> => {
  return mockApis.createSubscription(planId, userId);
};

// 获取用户订阅状态
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  return mockApis.getUserSubscription(userId);
};

// 取消连续包月订阅
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  return mockApis.cancelSubscription(subscriptionId);
};

// 恢复自动续费（renewalStopped 后续订）
export const resumeRenewal = async (userId: string): Promise<void> => {
  return mockApis.resumeRenewal(userId);
};
