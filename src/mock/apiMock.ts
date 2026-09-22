// src/mock/apiMock.ts
// 基于真实页面采集数据的 Mock 层：套餐 / 词元宝 / 加油包 / 用户场景
import {
  Plan,
  PlanType,
  SubscriptionMode,
  Subscription,
  TokenKeyProduct,
  BoosterTier,
  MockUserInfo,
  UserScenario,
  QueuedOrder,
  ExpiryReminder
} from '@/types/plan';
import { Order, BoosterPack } from '@/types/order';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY = 24 * 60 * 60 * 1000;

/** 将 Token 数值格式化为人可读标签，如 5000000 → "500万 Token" */
const formatTokenAmount = (amount: number): string => {
  if (amount >= 100000000) {
    const yi = amount / 100000000;
    return `${parseFloat(yi.toFixed(2))}亿 Token`;
  }
  if (amount >= 10000) {
    const wan = amount / 10000;
    return `${Number.isInteger(wan) ? wan : wan.toFixed(0)}万 Token`;
  }
  return `${amount} Token`;
};

/* ------------------------------------------------------------------ */
/* 套餐数据（来自真实页面，逐字采用）                                     */
/* ------------------------------------------------------------------ */

// 连续包月 / 年包共用的权益列表（注意：进阶版第二条无空格，保持原样）
const FEATURES_LITE = [
  '适合轻度尝鲜，简单问答和低频工具调用',
  '10 余款主流模型可用，多模型聚合，支持 Auto 模式',
  '约支持 1 个 OpenClaw Agent 轻量使用',
  '支持 OpenClaw、Claude Code、Cursor、Cline 等工具，持续扩展中',
  '支持用量查询与余额提醒，便于控制消耗'
];

const FEATURES_BASIC = [
  '适合日常 AI 办公、学习辅助和轻量开发',
  '10 余款主流模型可用，多模型聚合，支持 Auto 模式',
  '约支持 1-2 个 Agent 工具日常使用',
  '支持 OpenClaw、Claude Code、Cursor、Cline 等工具，持续扩展中',
  '额度更适合连续使用，减少频繁补购压力'
];

const FEATURES_ADVANCED = [
  '适合高频 Agent 使用、代码辅助和文档处理',
  '10 余款主流模型可用，多模型聚合，支持Auto模式',
  '约支持 2-3 个 Agent 编程工具组合使用',
  '支持 OpenClaw、Claude Code、Cursor、Cline 等工具，持续扩展中',
  '适合多任务连续调用，兼顾效率与成本控制'
];

const FEATURES_PRO = [
  '适合重度开发者、长任务处理和多工具协同',
  '10 余款主流模型可用，多模型聚合，支持 Auto 模式',
  '约支持 3-5 个 Agent 编程工具高频组合使用',
  '支持 OpenClaw、Claude Code、Cursor、Cline 等工具，持续扩展中',
  '更适合高频调用、长上下文任务和专业工作'
];

export const mockPlans: Record<PlanType, Plan[]> = {
  [PlanType.CONTINUOUS_MONTHLY]: [
    {
      id: 'monthly-lite',
      name: '体验版',
      tokenLabel: '3000万 Token',
      price: 3500,
      unit: '月',
      features: FEATURES_LITE,
      planType: PlanType.CONTINUOUS_MONTHLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 30000000,
      badge: '自动续费·随时可取消'
    },
    {
      id: 'monthly-basic',
      name: '基础版',
      tokenLabel: '8000万 Token',
      price: 8900,
      unit: '月',
      features: FEATURES_BASIC,
      planType: PlanType.CONTINUOUS_MONTHLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      recommended: true,
      quota: 80000000,
      badge: '自动续费·随时可取消'
    },
    {
      id: 'monthly-advanced',
      name: '进阶版',
      tokenLabel: '1.5亿 Token',
      price: 16900,
      unit: '月',
      features: FEATURES_ADVANCED,
      planType: PlanType.CONTINUOUS_MONTHLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 150000000,
      badge: '自动续费·随时可取消'
    },
    {
      id: 'monthly-pro',
      name: '专业版',
      tokenLabel: '3亿 Token',
      price: 31900,
      unit: '月',
      features: FEATURES_PRO,
      planType: PlanType.CONTINUOUS_MONTHLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 300000000,
      badge: '自动续费·随时可取消'
    }
  ],
  [PlanType.CONTINUOUS_QUARTERLY]: [
    {
      id: 'quarterly-lite',
      name: '体验版',
      tokenLabel: '9000万 Token',
      price: 10500,
      unit: '季',
      features: FEATURES_LITE,
      planType: PlanType.CONTINUOUS_QUARTERLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 90000000,
      badge: '按季自动续费·随时可取消',
      cycleLabel: '每3个月自动扣费'
    },
    {
      id: 'quarterly-basic',
      name: '基础版',
      tokenLabel: '2.4亿 Token',
      price: 26700,
      unit: '季',
      features: FEATURES_BASIC,
      planType: PlanType.CONTINUOUS_QUARTERLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      recommended: true,
      quota: 240000000,
      badge: '按季自动续费·随时可取消',
      cycleLabel: '每3个月自动扣费'
    },
    {
      id: 'quarterly-advanced',
      name: '进阶版',
      tokenLabel: '4.5亿 Token',
      price: 50700,
      unit: '季',
      features: FEATURES_ADVANCED,
      planType: PlanType.CONTINUOUS_QUARTERLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 450000000,
      badge: '按季自动续费·随时可取消',
      cycleLabel: '每3个月自动扣费'
    },
    {
      id: 'quarterly-pro',
      name: '专业版',
      tokenLabel: '9亿 Token',
      price: 95700,
      unit: '季',
      features: FEATURES_PRO,
      planType: PlanType.CONTINUOUS_QUARTERLY,
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      quota: 900000000,
      badge: '按季自动续费·随时可取消',
      cycleLabel: '每3个月自动扣费'
    }
  ],
  [PlanType.MONTHLY_ONETIME]: [
    {
      id: 'onetime-lite',
      name: '体验版',
      tokenLabel: '3000万 Token',
      price: 3500,
      unit: '月',
      features: FEATURES_LITE,
      planType: PlanType.MONTHLY_ONETIME,
      subscriptionMode: SubscriptionMode.ONE_TIME,
      quota: 30000000
    },
    {
      id: 'onetime-basic',
      name: '基础版',
      tokenLabel: '8000万 Token',
      price: 8900,
      unit: '月',
      features: FEATURES_BASIC,
      planType: PlanType.MONTHLY_ONETIME,
      subscriptionMode: SubscriptionMode.ONE_TIME,
      recommended: true,
      quota: 80000000
    },
    {
      id: 'onetime-advanced',
      name: '进阶版',
      tokenLabel: '1.5亿 Token',
      price: 16900,
      unit: '月',
      features: FEATURES_ADVANCED,
      planType: PlanType.MONTHLY_ONETIME,
      subscriptionMode: SubscriptionMode.ONE_TIME,
      quota: 150000000
    },
    {
      id: 'onetime-pro',
      name: '专业版',
      tokenLabel: '3亿 Token',
      price: 31900,
      unit: '月',
      features: FEATURES_PRO,
      planType: PlanType.MONTHLY_ONETIME,
      subscriptionMode: SubscriptionMode.ONE_TIME,
      quota: 300000000
    }
  ],
  [PlanType.ANNUAL]: [
    {
      id: 'annual-lite',
      name: '体验版',
      tokenLabel: '3.6亿 Token',
      price: 38500,
      unit: '年',
      features: FEATURES_LITE,
      planType: PlanType.ANNUAL,
      subscriptionMode: SubscriptionMode.MANUAL_QUEUE,
      quota: 360000000
    },
    {
      id: 'annual-basic',
      name: '基础版',
      tokenLabel: '9.6亿 Token',
      price: 97900,
      unit: '年',
      features: FEATURES_BASIC,
      planType: PlanType.ANNUAL,
      subscriptionMode: SubscriptionMode.MANUAL_QUEUE,
      recommended: true,
      quota: 960000000
    },
    {
      id: 'annual-advanced',
      name: '进阶版',
      tokenLabel: '18亿 Token',
      price: 185900,
      unit: '年',
      features: FEATURES_ADVANCED,
      planType: PlanType.ANNUAL,
      subscriptionMode: SubscriptionMode.MANUAL_QUEUE,
      quota: 1800000000
    },
    {
      id: 'annual-pro',
      name: '专业版',
      tokenLabel: '36亿 Token',
      price: 350900,
      unit: '年',
      features: FEATURES_PRO,
      planType: PlanType.ANNUAL,
      subscriptionMode: SubscriptionMode.MANUAL_QUEUE,
      quota: 3600000000
    }
  ],
  [PlanType.TOKEN_KEY]: [],
  [PlanType.BOOSTER]: []
};

/* ------------------------------------------------------------------ */
/* 词元宝产品                                                          */
/* ------------------------------------------------------------------ */

export const mockTokenKeyProduct: TokenKeyProduct = {
  id: 'token-key-standard',
  title: '词元宝标准版',
  subtitle: '含 1 亿 Token 权益',
  price: 39900,
  hint: '含安全硬件 · 需物流配送 · 收货后权益激活',
  benefits: [
    '含 1 亿 Token 权益，有效期激活后 30 天',
    'Token 密钥加密存储、即插即用、权益随行',
    '一键配置百应 Claw、Hermes Agent、OpenClaw、Claude Code 等智能体及编程工具',
    '10 余款主流大模型一站聚合，Auto 模式智能选型，省心更省钱'
  ],
  models: ['Qwen', 'DeepSeek', 'Doubao', 'Kimi', 'MiniMax', 'GLM', 'Hy']
};

// 团队定制：Token 基础包单价（1 亿 Token / 份）
export const TEAM_TOKEN_PACK_PRICE = 15000; // ¥150/份（分）

// 团队定制：联想百应词元宝单价（1 个）
export const TEAM_KEY_PRICE = 15000; // ¥150/个（分）

/* ------------------------------------------------------------------ */
/* 加油包档位                                                          */
/* ------------------------------------------------------------------ */

export const mockBoosterTiers: BoosterTier[] = [
  { id: 'booster-5m', tokenLabel: '500万 Token', tokenAmount: 5000000, price: 1900 },
  { id: 'booster-20m', tokenLabel: '2000万 Token', tokenAmount: 20000000, price: 5900 },
  { id: 'booster-50m', tokenLabel: '5000万 Token', tokenAmount: 50000000, price: 9900 }
];

/* ------------------------------------------------------------------ */
/* 订单号 / 生效服务单判定 / 历史订单种子                                  */
/* ------------------------------------------------------------------ */

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 19 位数字订单号：YYYYMMDDHHmmss(14 位) + 5 位尾号（种子传固定值保证确定性） */
const orderNo = (d: Date, tail?: string): string =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}${
    tail ?? String(Math.floor(10000 + Math.random() * 90000))
  }`;

/**
 * 是否生效中的服务单：已支付且未过期。
 * 已过期的已完成历史单 / 退款单不计入生效容量（不触发排队与加油包门槛）。
 */
const isServiceActive = (o: Order): boolean =>
  o.status === 'paid' && (!o.endDate || new Date(o.endDate).getTime() > Date.now());

/** 购买记录弹层：历史订单种子（1 条已退款 / 1 条已完成·有发票 / 1 条已完成·无发票） */
const historyOrders = (
  userId: string,
  refundDate: Date,
  invoiceDate: Date,
  plainDate: Date,
  invoice: { title: string; email: string }
): Order[] => [
  {
    id: orderNo(refundDate, '30995'),
    userId,
    planId: 'onetime-lite',
    planName: '体验版',
    displayName: '体验版 · 月包',
    amount: 3500,
    status: 'cancelled',
    createTime: refundDate,
    paidTime: refundDate,
    planType: PlanType.MONTHLY_ONETIME,
    startDate: refundDate,
    endDate: new Date(refundDate.getTime() + 30 * DAY),
    quota: 30000000,
    tokenLabel: '3000万 Token',
    refundAmount: 3500,
    refundTime: new Date(refundDate.getTime() + DAY)
  },
  {
    id: orderNo(invoiceDate, '57739'),
    userId,
    planId: mockTokenKeyProduct.id,
    planName: mockTokenKeyProduct.title,
    displayName: mockTokenKeyProduct.title,
    amount: mockTokenKeyProduct.price,
    status: 'paid',
    createTime: invoiceDate,
    paidTime: invoiceDate,
    planType: PlanType.TOKEN_KEY,
    startDate: invoiceDate,
    endDate: new Date(invoiceDate.getTime() + 30 * DAY),
    quota: 100000000,
    tokenLabel: '1亿 Token',
    invoiceInfo: { title: invoice.title, type: '增值税普通发票', email: invoice.email }
  },
  {
    id: orderNo(plainDate, '45128'),
    userId,
    planId: 'booster-20m',
    planName: '加油包 2000万 Token',
    displayName: '加油包 2000万 Token',
    amount: 5900,
    status: 'paid',
    createTime: plainDate,
    paidTime: plainDate,
    planType: PlanType.BOOSTER,
    startDate: plainDate,
    endDate: new Date(plainDate.getTime() + 30 * DAY),
    quota: 20000000,
    tokenLabel: '2000万 Token'
  }
];

/* ------------------------------------------------------------------ */
/* 用户场景（演示门槛逻辑）                                             */
/* ------------------------------------------------------------------ */

interface MockUserState {
  info: MockUserInfo;
  subscription: Subscription | null;
  orders: Order[];
  boosters: BoosterPack[];
  queuedOrder: QueuedOrder | null;   // 排队中的待生效基础单（容量=1）
  expiryReminder: ExpiryReminder | null; // 到期提醒预约记录
}

// 用户B（连续包月）当前周期：起 = now-25d，末 = now+5d 当日 23:59:59
const B_CYCLE_END = (() => {
  const d = new Date(Date.now() + 5 * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
})();
const B_CYCLE_START = new Date(Date.now() - 25 * DAY);

// 用户D（连续包季）当前周期：起 = now-60d，末 = now+30d
const D_CYCLE_END = (() => {
  const d = new Date(Date.now() + 30 * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
})();
const D_CYCLE_START = new Date(Date.now() - 60 * DAY);

// 用户E（一次性月包）当前周期：起 = now-10d，末 = now+20d
const E_CYCLE_END = (() => {
  const d = new Date(Date.now() + 20 * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
})();
const E_CYCLE_START = new Date(Date.now() - 10 * DAY);

// 用户F（连续包月已过期）上一周期：起 = now-33d，末 = now-3d 当日 23:59:59
const F_CYCLE_END = (() => {
  const d = new Date(Date.now() - 3 * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
})();
const F_CYCLE_START = new Date(Date.now() - 33 * DAY);

// 用户G（团队版订阅）团队服务单周期：起 = now-20d，末 = now+345d 当日 23:59:59
const G_CYCLE_END = (() => {
  const d = new Date(Date.now() + 345 * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
})();
const G_CYCLE_START = new Date(Date.now() - 20 * DAY);

const userStates: Record<string, MockUserState> = {
  'u-demo-a': {
    info: {
      id: 'u-demo-a',
      name: '演示用户 A',
      scenario: 'no-subscription',
      scenarioLabel: '无订阅用户',
      phone: '138****1234',
      realNameVerified: true
    },
    subscription: null,
    orders: historyOrders(
      'u-demo-a',
      new Date('2026-05-12 10:24:31'),
      new Date('2026-06-18 14:32:05'),
      new Date('2026-07-21 09:15:33'),
      { title: '林晓阳', email: 'linxy@lenovo.com' }
    ),
    boosters: [],
    queuedOrder: null,
    expiryReminder: null
  },
  'u-demo-b': {
    info: {
      id: 'u-demo-b',
      name: '演示用户 B',
      scenario: 'monthly-subscribed',
      scenarioLabel: '连续包月订阅用户',
      phone: '136****5167',
      realNameVerified: true
    },
    subscription: {
      id: 'sub_demo_b',
      userId: 'u-demo-b',
      planId: 'monthly-basic',
      planName: '基础版',
      planType: PlanType.CONTINUOUS_MONTHLY,
      startDate: B_CYCLE_START,
      endDate: B_CYCLE_END,
      status: 'active',
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      nextDeductDate: B_CYCLE_END,
      contractId: 'contract_demo_b',
      autoRenew: true,
      renewalStopped: false
    },
    orders: [
      ...historyOrders(
        'u-demo-b',
        new Date('2026-04-08 09:13:56'),
        new Date('2026-05-16 20:41:12'),
        new Date('2026-06-11 11:05:47'),
        { title: '何雯怡', email: 'hewy8@lenovo.com' }
      ),
      {
        id: orderNo(B_CYCLE_START, '65904'),
        userId: 'u-demo-b',
        planId: 'monthly-basic',
        planName: '基础版',
        displayName: '基础版 · 连续包月',
        amount: 8900,
        status: 'paid',
        createTime: B_CYCLE_START,
        paidTime: B_CYCLE_START,
        planType: PlanType.CONTINUOUS_MONTHLY,
        startDate: B_CYCLE_START,
        endDate: B_CYCLE_END,
        quota: 80000000,
        tokenLabel: '8000万 Token',
        deductCycle: 'monthly',
        deductCount: 1,
        nextDeductDate: B_CYCLE_END,
        autoRenewStatus: 'active'
      }
    ],
    boosters: [
      {
        id: 'booster_b_1',
        userId: 'u-demo-b',
        orderId: orderNo(new Date(Date.now() - 10 * DAY), '72103'),
        tokenAmount: 20000000,
        remaining: 12000000,
        tokenLabel: '2000万 Token',
        boundTo: 'order_b_cm',
        boundToName: '基础版 · 连续包月',
        status: 'active',
        createTime: new Date(Date.now() - 10 * DAY),
        expireTime: B_CYCLE_END
      }
    ],
    queuedOrder: null,
    expiryReminder: null
  },
  'u-demo-c': {
    info: {
      id: 'u-demo-c',
      name: '演示用户 C',
      scenario: 'annual-subscribed',
      scenarioLabel: '年包订阅用户',
      phone: '139****8821',
      realNameVerified: true
    },
    subscription: {
      id: 'sub_demo_c',
      userId: 'u-demo-c',
      planId: 'annual-basic',
      planName: '基础版',
      planType: PlanType.ANNUAL,
      startDate: new Date('2026-03-14'),
      endDate: new Date('2027-03-13'),
      status: 'active',
      subscriptionMode: SubscriptionMode.MANUAL_QUEUE
    },
    orders: [
      ...historyOrders(
        'u-demo-c',
        new Date('2026-01-09 15:35:47'),
        new Date('2026-02-14 10:02:33'),
        new Date('2026-03-02 18:26:09'),
        { title: '陈立群', email: 'chenlq@lenovo.com' }
      ),
      {
        id: orderNo(new Date('2026-03-13'), '88126'),
        userId: 'u-demo-c',
        planId: 'annual-basic',
        planName: '基础版',
        displayName: '基础版 · 年包',
        amount: 97900,
        status: 'paid',
        createTime: new Date('2026-03-13'),
        paidTime: new Date('2026-03-13'),
        planType: PlanType.ANNUAL,
        startDate: new Date('2026-03-14'),
        endDate: new Date('2027-03-13'),
        quota: 960000000,
        tokenLabel: '9.6亿 Token'
      }
    ],
    boosters: [],
    queuedOrder: null,
    expiryReminder: null
  },
  'u-demo-d': {
    info: {
      id: 'u-demo-d',
      name: '演示用户 D',
      scenario: 'quarterly-subscribed',
      scenarioLabel: '连续包季订阅用户',
      phone: '137****6688',
      realNameVerified: true
    },
    subscription: {
      id: 'sub_demo_d',
      userId: 'u-demo-d',
      planId: 'quarterly-basic',
      planName: '基础版',
      planType: PlanType.CONTINUOUS_QUARTERLY,
      startDate: D_CYCLE_START,
      endDate: D_CYCLE_END,
      status: 'active',
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      nextDeductDate: D_CYCLE_END,
      contractId: 'contract_demo_d',
      autoRenew: true,
      renewalStopped: false
    },
    orders: [
      ...historyOrders(
        'u-demo-d',
        new Date('2026-03-21 08:47:15'),
        new Date('2026-04-25 13:19:40'),
        new Date('2026-05-30 16:08:22'),
        { title: '赵启明', email: 'zhaoqm@lenovo.com' }
      ),
      {
        id: orderNo(D_CYCLE_START, '20382'),
        userId: 'u-demo-d',
        planId: 'quarterly-basic',
        planName: '基础版',
        displayName: '基础版 · 连续包季',
        amount: 26700,
        status: 'paid',
        createTime: D_CYCLE_START,
        paidTime: D_CYCLE_START,
        planType: PlanType.CONTINUOUS_QUARTERLY,
        startDate: D_CYCLE_START,
        endDate: D_CYCLE_END,
        quota: 240000000,
        tokenLabel: '2.4亿 Token',
        deductCycle: 'quarterly',
        deductCount: 1,
        nextDeductDate: D_CYCLE_END,
        autoRenewStatus: 'active'
      }
    ],
    boosters: [],
    queuedOrder: null,
    expiryReminder: null
  },
  'u-demo-e': {
    info: {
      id: 'u-demo-e',
      name: '演示用户 E',
      scenario: 'onetime-monthly-subscribed',
      scenarioLabel: '一次性月包用户',
      phone: '135****9900',
      realNameVerified: true
    },
    subscription: {
      id: 'sub_demo_e',
      userId: 'u-demo-e',
      planId: 'onetime-basic',
      planName: '基础版',
      planType: PlanType.MONTHLY_ONETIME,
      startDate: E_CYCLE_START,
      endDate: E_CYCLE_END,
      status: 'active',
      subscriptionMode: SubscriptionMode.ONE_TIME
    },
    orders: [
      ...historyOrders(
        'u-demo-e',
        new Date('2026-06-06 10:11:24'),
        new Date('2026-07-08 15:44:51'),
        new Date('2026-08-02 09:31:17'),
        { title: '孙语涵', email: 'sunyh@lenovo.com' }
      ),
      {
        id: orderNo(E_CYCLE_START, '46659'),
        userId: 'u-demo-e',
        planId: 'onetime-basic',
        planName: '基础版',
        displayName: '基础版 · 月包',
        amount: 8900,
        status: 'paid',
        createTime: E_CYCLE_START,
        paidTime: E_CYCLE_START,
        planType: PlanType.MONTHLY_ONETIME,
        startDate: E_CYCLE_START,
        endDate: E_CYCLE_END,
        quota: 80000000,
        tokenLabel: '8000万 Token'
      }
    ],
    boosters: [
      {
        id: 'booster_e_1',
        userId: 'u-demo-e',
        orderId: orderNo(new Date(Date.now() - 5 * DAY), '83245'),
        tokenAmount: 5000000,
        remaining: 3000000,
        tokenLabel: '500万 Token',
        boundTo: 'order_e_monthly',
        boundToName: '基础版 · 月包',
        status: 'active',
        createTime: new Date(Date.now() - 5 * DAY),
        expireTime: E_CYCLE_END
      },
      {
        id: 'booster_e_2',
        userId: 'u-demo-e',
        orderId: orderNo(new Date(Date.now() - 3 * DAY), '91082'),
        tokenAmount: 50000000,
        remaining: 48500000,
        tokenLabel: '5000万 Token',
        boundTo: 'order_e_monthly',
        boundToName: '基础版 · 月包',
        status: 'active',
        createTime: new Date(Date.now() - 3 * DAY),
        expireTime: E_CYCLE_END
      }
    ],
    queuedOrder: null,
    expiryReminder: null
  },
  'u-demo-f': {
    info: {
      id: 'u-demo-f',
      name: '演示用户 F',
      scenario: 'expired-monthly-subscribed',
      scenarioLabel: '连续包月已过期用户',
      phone: '133****2048',
      realNameVerified: true
    },
    subscription: {
      id: 'sub_demo_f',
      userId: 'u-demo-f',
      planId: 'monthly-basic',
      planName: '基础版',
      planType: PlanType.CONTINUOUS_MONTHLY,
      startDate: F_CYCLE_START,
      endDate: F_CYCLE_END,
      status: 'expired',
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      nextDeductDate: F_CYCLE_END,
      contractId: 'contract_demo_f',
      autoRenew: false,
      renewalStopped: false
    },
    orders: [
      ...historyOrders(
        'u-demo-f',
        new Date('2026-05-20 11:26:38'),
        new Date('2026-06-27 09:52:14'),
        new Date('2026-07-19 16:40:55'),
        { title: '周雨桐', email: 'zhouyt@lenovo.com' }
      ),
      {
        id: orderNo(F_CYCLE_START, '51837'),
        userId: 'u-demo-f',
        planId: 'monthly-basic',
        planName: '基础版',
        displayName: '基础版 · 连续包月',
        amount: 8900,
        status: 'paid',
        createTime: F_CYCLE_START,
        paidTime: F_CYCLE_START,
        planType: PlanType.CONTINUOUS_MONTHLY,
        startDate: F_CYCLE_START,
        endDate: F_CYCLE_END,
        quota: 80000000,
        tokenLabel: '8000万 Token',
        deductCycle: 'monthly',
        deductCount: 1,
        nextDeductDate: F_CYCLE_END,
        autoRenewStatus: 'stopped'
      }
    ],
    boosters: [],
    queuedOrder: null,
    expiryReminder: null
  },
  // ① 演示用户G：团队版有订阅数据 + 标准版无数据
  // 团队tab呈现团队版套餐卡；标准tab呈现内嵌商品页签空态
  'u-demo-g': {
    info: {
      id: 'u-demo-g',
      name: '演示用户 G',
      scenario: 'team-subscribed',
      scenarioLabel: '团队版订阅用户',
      phone: '132****7753',
      realNameVerified: true
    },
    subscription: null,
    orders: [
      {
        id: orderNo(G_CYCLE_START, '60417'),
        userId: 'u-demo-g',
        planId: 'team-token-pack',
        planName: '团队 Token 基础包 × 40',
        displayName: '团队 Token 基础包 × 40',
        amount: 600000,
        status: 'paid',
        createTime: G_CYCLE_START,
        paidTime: G_CYCLE_START,
        team: true,
        startDate: G_CYCLE_START,
        endDate: G_CYCLE_END,
        quota: 4000000000,
        tokenLabel: '40亿 Token'
      }
    ],
    boosters: [],
    queuedOrder: null,
    expiryReminder: null
  }
};

// 当前登录用户 ID（null = 未登录）
let currentUserId: string | null = null;

const getState = (userId: string) => userStates[userId];

/* ------------------------------------------------------------------ */
/* Mock API                                                            */
/* ------------------------------------------------------------------ */

export const mockApis = {
  /* ---------- 套餐 / 产品 ---------- */
  getPlans: async (planType: PlanType): Promise<Plan[]> => {
    await delay(150);
    return mockPlans[planType];
  },

  getTokenKeyProduct: async (): Promise<TokenKeyProduct> => {
    await delay(150);
    return mockTokenKeyProduct;
  },

  getBoosterTiers: async (): Promise<BoosterTier[]> => {
    await delay(150);
    return mockBoosterTiers;
  },

  /* ---------- 用户 / 登录 ---------- */
  login: async (scenario: UserScenario): Promise<MockUserInfo> => {
    await delay(400);
    const scenarioToUser: Record<UserScenario, string> = {
      'no-subscription': 'u-demo-a',
      'monthly-subscribed': 'u-demo-b',
      'quarterly-subscribed': 'u-demo-d',
      'onetime-monthly-subscribed': 'u-demo-e',
      'annual-subscribed': 'u-demo-c',
      'expired-monthly-subscribed': 'u-demo-f',
      'team-subscribed': 'u-demo-g'
    };
    const userId = scenarioToUser[scenario];
    currentUserId = userId;
    return userStates[userId].info;
  },

  logout: async (): Promise<void> => {
    await delay(200);
    currentUserId = null;
  },

  getCurrentUser: async (): Promise<MockUserInfo | null> => {
    await delay(150);
    return currentUserId ? userStates[currentUserId].info : null;
  },

  getUserSubscription: async (userId: string): Promise<Subscription | null> => {
    await delay(150);
    const state = getState(userId);
    return state ? state.subscription : null;
  },

  /** 创建签约订阅（连续包月/连续包季：微信签约扣款成功后调用） */
  createSubscription: async (
    planId: string,
    userId: string
  ): Promise<{ orderId: string; prepayId: string; contractCode: string; subscription: Subscription }> => {
    await delay(1200);
    const plan = Object.values(mockPlans).flat().find((p) => p.id === planId);
    const state = getState(userId);
    if (!plan || !state) throw new Error('套餐不存在或用户不存在');

    const now = new Date();
    const isQuarterly = plan.planType === PlanType.CONTINUOUS_QUARTERLY;
    const cycleDays = isQuarterly ? 90 : 30;
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.name,
      planType: plan.planType,
      startDate: now,
      endDate: new Date(now.getTime() + cycleDays * DAY),
      status: 'active',
      subscriptionMode: SubscriptionMode.CONTINUOUS_RENEWAL,
      nextDeductDate: new Date(now.getTime() + cycleDays * DAY),
      contractId: `contract_${Date.now()}`,
      autoRenew: true,
      renewalStopped: false
    };
    state.subscription = subscription;

    const displayName = `${plan.name} · ${isQuarterly ? '连续包季' : '连续包月'}`;
    const order: Order = {
      id: orderNo(now),
      userId,
      planId: plan.id,
      planName: plan.name,
      displayName,
      amount: plan.price,
      status: 'paid',
      createTime: now,
      paidTime: now,
      planType: plan.planType,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      quota: plan.quota,
      tokenLabel: plan.tokenLabel,
      deductCycle: isQuarterly ? 'quarterly' : 'monthly',
      deductCount: 1,
      nextDeductDate: subscription.nextDeductDate,
      autoRenewStatus: 'active'
    };
    state.orders.push(order);

    return {
      orderId: order.id,
      prepayId: `prepay_${Date.now()}`,
      contractCode: subscription.contractId || `contract_${Date.now()}`,
      subscription
    };
  },

  /**
   * 取消自动续费（签约线）：仅停止未来续扣，当前已付周期服务保留至周期末。
   */
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    await delay(400);
    Object.values(userStates).forEach((state) => {
      const sub = state.subscription;
      if (sub && sub.id === subscriptionId) {
        sub.autoRenew = false;
        sub.renewalStopped = true;
        // 同步更新对应签约线订单的续费状态徽章
        state.orders.forEach((o) => {
          if (
            o.planId === sub.planId &&
            (o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY)
          ) {
            o.autoRenewStatus = 'stopped';
          }
        });
      }
    });
  },

  /** 恢复自动续费（renewalStopped 后续订） */
  resumeRenewal: async (userId: string): Promise<void> => {
    await delay(400);
    const state = getState(userId);
    if (!state) throw new Error('用户不存在');
    const sub = state.subscription;
    if (!sub || sub.status !== 'active' || sub.subscriptionMode !== SubscriptionMode.CONTINUOUS_RENEWAL) {
      throw new Error('仅签约线生效中的订阅可恢复自动续费');
    }
    sub.autoRenew = true;
    sub.renewalStopped = false;
    // 同步恢复订单续费状态徽章
    state.orders.forEach((o) => {
      if (
        o.planId === sub.planId &&
        (o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY)
      ) {
        o.autoRenewStatus = 'active';
      }
    });
  },

  /* ---------- 订单 ---------- */
  /**
   * 创建订单（年包/词元宝/一次性月包/团队定制等手动购买）：
   * queueable 且已有生效套餐/服务单时进入排队
   * 年包排队时，若当前生效单为签约线，自动解约
   */
  createOrder: async (
    planId: string,
    userId: string,
    opts?: { displayName?: string; price?: number; tokenLabel?: string; queueable?: boolean; autoStopRenewal?: boolean }
  ): Promise<Order> => {
    await delay(1000);
    const plan = Object.values(mockPlans).flat().find((p) => p.id === planId);
    const isTokenKey = planId === mockTokenKeyProduct.id;
    const state = getState(userId);
    if (!state) throw new Error('用户不存在');
    if (!plan && !isTokenKey && !opts) throw new Error('套餐不存在');

    const now = new Date();
    const queueable = opts?.queueable ?? true;
    const hasActive =
      queueable &&
      ((state.subscription && state.subscription.status === 'active') ||
        state.orders.some((o) => !o.team && isServiceActive(o)));

    const name = opts?.displayName || (isTokenKey ? mockTokenKeyProduct.title : plan?.name) || '套餐';
    const price = opts?.price ?? (isTokenKey ? mockTokenKeyProduct.price : plan?.price) ?? 0;

    const order: Order = {
      id: orderNo(now),
      userId,
      planId,
      planName: name,
      displayName: name,
      amount: price,
      status: hasActive ? 'queue' : 'paid',
      createTime: now,
      paidTime: now,
      queuePosition: hasActive ? state.orders.filter((o) => o.status === 'queue').length + 1 : undefined,
      planType: isTokenKey ? PlanType.TOKEN_KEY : plan?.planType,
      startDate: hasActive ? undefined : now,
      endDate: hasActive
        ? undefined
        : (isTokenKey
            ? new Date(now.getTime() + 30 * DAY)
            : (plan ? new Date(now.getTime() + (plan.planType === PlanType.ANNUAL ? 365 : 30) * DAY) : undefined)),
      quota: isTokenKey ? 100000000 : plan?.quota,
      tokenLabel: isTokenKey ? '1亿 Token' : plan?.tokenLabel
    };
    state.orders.push(order);

    // 年包排队 + 自动解约：当前生效单为签约线时，标记停止续费
    if (hasActive && opts?.autoStopRenewal && state.subscription) {
      if (
        state.subscription.subscriptionMode === SubscriptionMode.CONTINUOUS_RENEWAL &&
        state.subscription.status === 'active'
      ) {
        state.subscription.autoRenew = false;
        state.subscription.renewalStopped = true;
        // 同步更新已存在的签约线订单续费状态徽章
        state.orders.forEach((o) => {
          if (
            o.planId === state.subscription!.planId &&
            (o.planType === PlanType.CONTINUOUS_MONTHLY || o.planType === PlanType.CONTINUOUS_QUARTERLY)
          ) {
            o.autoRenewStatus = 'stopped';
          }
        });
      }
    }

    // 排队单记录（容量=1）
    if (hasActive && queueable && plan?.planType === PlanType.ANNUAL) {
      const subEnd = state.subscription?.endDate
        ? new Date(state.subscription.endDate)
        : new Date(now.getTime() + 30 * DAY);
      state.queuedOrder = {
        orderId: order.id,
        planName: name,
        expectedStartDate: new Date(subEnd.getTime() + DAY),
        planType: PlanType.ANNUAL
      };
    }

    return order;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    await delay(150);
    const state = getState(userId);
    return state ? [...state.orders] : [];
  },

  /** 生效中的服务单（加油包可绑定的对象；团队版订单属团队域，不计入标准版口径） */
  getActiveServiceOrders: async (userId: string): Promise<Order[]> => {
    await delay(150);
    const state = getState(userId);
    return state ? state.orders.filter((o) => isServiceActive(o) && !o.team) : [];
  },

  hasActiveServiceOrder: async (userId: string): Promise<boolean> => {
    await delay(150);
    const state = getState(userId);
    if (!state) return false;
    const hasActiveSub = !!state.subscription && state.subscription.status === 'active';
    const hasPaidOrders = state.orders.some((o) => !o.team && isServiceActive(o));
    return hasActiveSub || hasPaidOrders;
  },

  /* ---------- 加油包 ---------- */
  purchaseBooster: async (
    tierId: string,
    userId: string,
    boundTo: string,
    qty: number = 1
  ): Promise<{ boosterPack: BoosterPack; order: Order }> => {
    await delay(1000);
    const tier = mockBoosterTiers.find((t) => t.id === tierId);
    const state = getState(userId);
    if (!tier || !state) throw new Error('档位不存在或用户不存在');

    const boundOrder = state.orders.find((o) => o.id === boundTo && o.status === 'paid');
    if (!boundOrder) throw new Error('需先订阅生效中的套餐后方可购买加油包');

    const now = new Date();
    const totalAmount = tier.tokenAmount * qty;
    const totalPrice = tier.price * qty;
    const totalTokenLabel = formatTokenAmount(totalAmount);

    const order: Order = {
      id: orderNo(now),
      userId,
      planId: tier.id,
      planName: `加油包 ${totalTokenLabel}`,
      displayName: `加油包 ${totalTokenLabel}`,
      amount: totalPrice,
      status: 'paid',
      createTime: now,
      paidTime: now,
      boundTo,
      planType: PlanType.BOOSTER,
      startDate: now,
      endDate: boundOrder.paidTime
        ? new Date(new Date(boundOrder.paidTime).getTime() + 30 * DAY)
        : new Date(now.getTime() + 30 * DAY),
      quota: totalAmount,
      tokenLabel: totalTokenLabel
    };
    state.orders.push(order);

    const boosterPack: BoosterPack = {
      id: `booster_${Date.now()}`,
      userId,
      orderId: order.id,
      tokenAmount: totalAmount,
      remaining: totalAmount,
      tokenLabel: totalTokenLabel,
      boundTo,
      boundToName: boundOrder.displayName,
      status: 'active',
      createTime: now,
      expireTime: boundOrder.paidTime
        ? new Date(new Date(boundOrder.paidTime).getTime() + 30 * DAY)
        : new Date(now.getTime() + 30 * DAY)
    };
    state.boosters.push(boosterPack);

    return { boosterPack, order };
  },

  getUserBoosterPacks: async (userId: string): Promise<BoosterPack[]> => {
    await delay(150);
    const state = getState(userId);
    return state ? [...state.boosters] : [];
  },

  /* ---------- 排队单 / 预约提醒 ---------- */

  /** 获取用户排队中的待生效基础单 */
  getQueuedOrder: async (userId: string): Promise<QueuedOrder | null> => {
    await delay(100);
    const state = getState(userId);
    return state ? state.queuedOrder : null;
  },

  /** 预约到期提醒 */
  bookExpiryReminder: async (userId: string): Promise<{ success: boolean; alreadyBooked: boolean }> => {
    await delay(400);
    const state = getState(userId);
    if (!state) throw new Error('用户不存在');
    if (state.expiryReminder) {
      return { success: false, alreadyBooked: true };
    }
    state.expiryReminder = {
      userId,
      bookedAt: new Date(),
      reminderType: 'expiry-purchase'
    };
    return { success: true, alreadyBooked: false };
  },

  /** 获取用户到期提醒预约状态 */
  getExpiryReminder: async (userId: string): Promise<ExpiryReminder | null> => {
    await delay(100);
    const state = getState(userId);
    return state ? state.expiryReminder : null;
  }
};

/** 兼容旧引用 */
export const mockUserSubscription: Subscription | null = null;
export const mockUserOrders: Order[] = [];
