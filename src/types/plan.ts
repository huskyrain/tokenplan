// src/types/plan.ts
export enum PlanType {
  CONTINUOUS_MONTHLY = 'continuous_monthly',    // 连续包月
  CONTINUOUS_QUARTERLY = 'continuous_quarterly',// 连续包季
  MONTHLY_ONETIME = 'monthly_onetime',          // 一次性月包
  ANNUAL = 'annual',                            // 年包
  TOKEN_KEY = 'token_key',                      // 词元宝
  BOOSTER = 'booster'                           // 加油包
}

export enum SubscriptionMode {
  CONTINUOUS_RENEWAL = 'continuous',          // 连续包月/连续包季：微信支付自动续扣
  MANUAL_QUEUE = 'manual_queue',              // 年包：手动订阅排队
  ONE_TIME = 'one_time',                      // 一次性月包/词元宝：买断
}

/** 套餐卡（连续包月 / 连续包季 / 一次性月包 / 年包） */
export interface Plan {
  id: string;
  name: string;            // 体验版 / 基础版 / 进阶版 / 专业版
  tokenLabel: string;      // 展示用 Token 量，如 "3000 万 Token"
  price: number;           // 价格（分）
  unit: string;            // "月" | "季" | "年"
  features: string[];      // 权益列表
  planType: PlanType;
  subscriptionMode: SubscriptionMode;
  recommended?: boolean;   // 推荐态（红框红按钮）
  quota?: number;          // Token 总额度（数值，用于订阅管理页剩余量展示）
  badge?: string;          // 卡内身份徽章（红边浅底小徽章文案），如"自动续费·随时可取消"
  cycleLabel?: string;     // 周期文案，如"每3个月自动扣费"
}

/** 词元宝产品（单产品卡） */
export interface TokenKeyProduct {
  id: string;
  title: string;           // 词元宝标准版
  subtitle: string;        // 含 1 亿 Token 权益
  price: number;           // 价格（分）
  hint: string;            // 含安全硬件 · 需物流配送 · 收货后权益激活
  benefits: string[];      // 权益列表
  models: string[];        // 模型徽标
}

/** 加油包档位 */
export interface BoosterTier {
  id: string;
  tokenLabel: string;      // "500万 Token"
  tokenAmount: number;     // 5000000
  price: number;           // 价格（分）
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planType?: PlanType;     // 订阅产品类型（cm/cq/monthly/annual）
  startDate: Date | string;
  endDate?: Date | string;
  status: 'active' | 'expired' | 'cancelled';
  subscriptionMode: SubscriptionMode;
  nextDeductDate?: Date | string; // 下次扣费日期（仅签约线）
  contractId?: string;            // 微信签约ID（仅签约线）
  autoRenew?: boolean;            // 是否自动续费（签约线）
  renewalStopped?: boolean;       // 续费已停止标记（年包排队时自动解约）
}

/** 商品页签键（主页二级页签 / 订阅管理页内嵌页签共用） */
export type PlanTabKey = 'cm' | 'cq' | 'monthly' | 'annual' | 'cyb';

/** 模拟用户场景 */
export type UserScenario = 'no-subscription' | 'monthly-subscribed' | 'quarterly-subscribed' | 'onetime-monthly-subscribed' | 'annual-subscribed' | 'expired-monthly-subscribed' | 'team-subscribed';

export interface MockUserInfo {
  id: string;
  name: string;
  scenario: UserScenario;
  scenarioLabel: string;
  phone: string;            // 手机号（明文，展示时脱敏）
  realNameVerified: boolean; // 是否已实名认证
}

/** 排队订单（待生效的基础服务单） */
export interface QueuedOrder {
  orderId: string;
  planName: string;         // 如 "基础版 · 年包"
  expectedStartDate: Date | string; // 预计生效日期
  planType: PlanType;
}

/** 到期提醒预约记录 */
export interface ExpiryReminder {
  userId: string;
  bookedAt: Date | string;
  reminderType: 'monthly-after-annual' | 'expiry-purchase';
}
