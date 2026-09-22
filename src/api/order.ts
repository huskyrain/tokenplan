// src/api/order.ts
import type { Order } from '@/types/order';
import type { QueuedOrder, ExpiryReminder } from '@/types/plan';
import { mockApis } from '@/mock/apiMock';

// 创建订单（年包/词元宝/一次性月包/团队定制：queueable 且已有生效套餐时排队生效）
export const createOrder = async (
  planId: string,
  userId: string,
  opts?: { displayName?: string; price?: number; tokenLabel?: string; queueable?: boolean; autoStopRenewal?: boolean }
): Promise<Order> => {
  return mockApis.createOrder(planId, userId, opts);
};

// 获取用户订单列表
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return mockApis.getUserOrders(userId);
};

// 获取生效中的服务单（加油包可绑定对象）
export const getActiveServiceOrders = async (userId: string): Promise<Order[]> => {
  return mockApis.getActiveServiceOrders(userId);
};

// 检查用户是否有生效中的服务单（用于加油包资格校验）
export const hasActiveServiceOrder = async (userId: string): Promise<boolean> => {
  return mockApis.hasActiveServiceOrder(userId);
};

// 获取排队中的待生效基础单
export const getQueuedOrder = async (userId: string): Promise<QueuedOrder | null> => {
  return mockApis.getQueuedOrder(userId);
};

// 预约到期提醒
export const bookExpiryReminder = async (userId: string): Promise<{ success: boolean; alreadyBooked: boolean }> => {
  return mockApis.bookExpiryReminder(userId);
};

// 获取到期提醒预约状态
export const getExpiryReminder = async (userId: string): Promise<ExpiryReminder | null> => {
  return mockApis.getExpiryReminder(userId);
};
