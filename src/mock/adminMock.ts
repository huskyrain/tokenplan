// src/mock/adminMock.ts
// 后台管理 mock 数据：token 订单列表/详情（含捆绑·绑定关系）+ 连续订阅管理（行/日志/操作）
// 与前台 apiMock 的用户订单体系隔离，仅供 /admin/* 后台页使用

import { reactive } from 'vue';

/* ------------------------------------------------------------------ */
/* ① token 订单                                                        */
/* ------------------------------------------------------------------ */

export type AdminOrderStatus =
  | 'pendingPay'      // 待付款
  | 'pendingDeliver'  // 待交付
  | 'refunding'       // 退款中
  | 'done'            // 已完成
  | 'failed'          // 交易失败
  | 'cancelled'       // 已取消
  | 'refunded';       // 已退款（新增：加油包订单后台退款）

/** 业务类型：订阅=套餐订单；booster=加油包订单（新增枚举） */
export type AdminBizType = 'subscription' | 'booster';

export interface AdminTokenOrder {
  id: number;                  // 编号（= 首购订单ID）
  orderNo: string;             // 订单号（19 位）
  mainOrderNo: string;         // 主订单号（19 位）
  firstOrderId: number;        // 首购订单ID
  createTime: string;          // 下单时间
  payTime: string | null;      // 付款时间
  productName: string;         // 商品名称
  productId: number;           // 商品ID
  spec: string;                // 规格
  pn: string;                  // PN号
  materialNo: string;          // 物料编号
  tokenTotal: string;          // 套餐Token总量
  validDays: string;           // 套餐有效期
  qty: number;                 // 数量
  unitPrice: number;           // 单价（分）
  actual: number;              // 实收（分）
  orderSource: string;         // 订单来源
  customerType: string;        // 客户类型
  bizType: AdminBizType;       // 业务类型
  subSource: string;           // 订阅来源
  phone: string;               // 下单人电话
  status: AdminOrderStatus;    // 订单状态
  payMethod: string;           // 支付方式
  invoiceTitle?: string;       // 发票抬头
  invoiceType?: string;        // 发票类型
  invoiceEmail?: string;       // 收票人邮箱
  /** 加油包订单 → 绑定生效中套餐订单号 */
  bindOrderNo?: string;
  /** 绑定套餐名称（bindOrderNo 的展示名） */
  bindPlanName?: string;
  /** 套餐订单 → 被捆绑购买的加油包订单号列表 */
  bundledBoosterNos?: string[];
  /** 退款信息（退款成功后写入，详情「退款信息」块展示） */
  refundInfo?: AdminRefundInfo;
}

/** 退款原因（退款确认弹窗下拉枚举） */
export type AdminRefundReason = '用户申请' | '重复购买' | '协商一致';

export const ADMIN_REFUND_REASONS: AdminRefundReason[] = ['用户申请', '重复购买', '协商一致'];

/** 退款信息（mock 退款落库结构） */
export interface AdminRefundInfo {
  refundNo: string;              // 退款单号（RF + 时间戳）
  amount: number;                // 退款金额（分）= 订单金额
  reason: AdminRefundReason;     // 退款原因
  time: string;                  // 退款时间
  operator: string;              // 操作人（后台管理员）
}

export const ADMIN_STATUS_LABEL: Record<AdminOrderStatus, string> = {
  pendingPay: '待付款',
  pendingDeliver: '待交付',
  refunding: '退款中',
  done: '已完成',
  failed: '交易失败',
  cancelled: '已取消',
  refunded: '已退款'
};

export const ADMIN_BIZ_LABEL: Record<AdminBizType, string> = {
  subscription: '订阅',
  booster: '加油包'
};

export const ADMIN_PAY_METHODS = ['微信支付', '0元支付', '支付宝支付'];
export const ADMIN_ORDER_SOURCES = ['claw客户端-win', '词元宝', '活动', 'H5商城'];
export const ADMIN_SUB_SOURCES = ['首页漂浮卡片', '词元宝激活码', '活动-主机SN', '扫码入口'];
export const ADMIN_CUSTOMER_TYPES = ['OPC', '企业', '个人'];

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

/** 种子随机（mulberry32）：保证每次刷新 mock 数据稳定 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pnOf = (productId: number): string => String(82000000 + (productId % 10000));

interface ProductDef {
  name: string;
  productId: number;
  tokenTotal: string;
  validDays: string;
  price: number; // 分
  biz: AdminBizType;
}

const SUB_PRODUCTS: ProductDef[] = [
  { name: '体验版', productId: 190951, tokenTotal: '3000万', validDays: '30天', price: 3500, biz: 'subscription' },
  { name: '基础版', productId: 190952, tokenTotal: '8000万', validDays: '30天', price: 8900, biz: 'subscription' },
  { name: '进阶版', productId: 190953, tokenTotal: '1.5亿', validDays: '30天', price: 16900, biz: 'subscription' },
  { name: '专业版', productId: 190954, tokenTotal: '3亿', validDays: '30天', price: 31900, biz: 'subscription' },
  { name: '联想百应 Token PlanL7 旗舰版', productId: 190957, tokenTotal: '5亿', validDays: '90天', price: 59900, biz: 'subscription' },
  { name: '联想百应 Token PlanL5 高级版', productId: 190958, tokenTotal: '2亿', validDays: '365天', price: 49900, biz: 'subscription' }
];

const BOOSTER_PRODUCTS: ProductDef[] = [
  { name: '加油包 500万 Token', productId: 191001, tokenTotal: '500万', validDays: '30天', price: 1900, biz: 'booster' },
  { name: '加油包 2000万 Token', productId: 191002, tokenTotal: '2000万', validDays: '30天', price: 5900, biz: 'booster' },
  { name: '加油包 5000万 Token', productId: 191003, tokenTotal: '5000万', validDays: '30天', price: 9900, biz: 'booster' }
];

/** 展示名（绑定关系行文案用）：套餐订单 → 「名称 · 连续包月」口径 */
const displayNameOf = (o: AdminTokenOrder): string =>
  o.bizType === 'booster' ? o.productName : `${o.productName} · 连续包月`;

let seq = 940000;
const nextId = (): number => ++seq;

function mkOrder(p: {
  id: number;
  prefix: string;      // 14 位时间前缀
  mainTail: string;    // 主订单号 5 位尾
  orderTail: string;   // 订单号 5 位尾
  create: string;
  pay?: string | null;
  product: ProductDef;
  qty?: number;
  actual?: number;     // 实收（分），缺省按状态推导
  orderSource: string;
  customerType?: string;
  subSource: string;
  phone: string;
  status: AdminOrderStatus;
  payMethod: string;
  invoice?: { title: string; type: string; email: string };
  bindOrderNo?: string;
  bindPlanName?: string;
  bundledBoosterNos?: string[];
}): AdminTokenOrder {
  const qty = p.qty ?? 1;
  const paidLike = p.status === 'done' || p.status === 'refunding' || p.status === 'pendingDeliver';
  const actual = p.actual ?? (paidLike && p.payMethod !== '0元支付' ? p.product.price * qty : 0);
  return {
    id: p.id,
    orderNo: `${p.prefix}${p.orderTail}`,
    mainOrderNo: `${p.prefix}${p.mainTail}`,
    firstOrderId: p.id,
    createTime: p.create,
    payTime: p.pay ?? null,
    productName: p.product.name,
    productId: p.product.productId,
    spec: p.product.name,
    pn: pnOf(p.product.productId),
    materialNo: pnOf(p.product.productId),
    tokenTotal: p.product.tokenTotal,
    validDays: p.product.validDays,
    qty,
    unitPrice: p.product.price,
    actual,
    orderSource: p.orderSource,
    customerType: p.customerType ?? 'OPC',
    bizType: p.product.biz,
    subSource: p.subSource,
    phone: p.phone,
    status: p.status,
    payMethod: p.payMethod,
    invoiceTitle: p.invoice?.title,
    invoiceType: p.invoice?.type,
    invoiceEmail: p.invoice?.email,
    bindOrderNo: p.bindOrderNo,
    bindPlanName: p.bindPlanName,
    bundledBoosterNos: p.bundledBoosterNos ? [...p.bundledBoosterNos] : undefined
  };
}

/* ---------- 种子订单（基准截图首屏 + 捆绑/绑定关系演示） ---------- */

// B 态连续包月订单号（捆绑 2 笔加油包 + 1 笔独立加油包绑定）
const CM_ORDER_NO = '2026091609212200876';

const seedOrders: AdminTokenOrder[] = [
  // 截图行 1：已完成 · 微信支付
  mkOrder({
    id: 943466, prefix: '20260917155804', mainTail: '27522', orderTail: '00083',
    create: '2026-09-17 15:58:04', pay: '2026-09-17 15:58:34',
    product: SUB_PRODUCTS[0], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '13716760628', status: 'done', payMethod: '微信支付',
    invoice: { title: '个人', type: '增值税普通发票', email: 'user943466@lenovo.com' }
  }),
  // 截图行 2：待付款 · 0元支付 · 词元宝来源
  mkOrder({
    id: 943302, prefix: '20260917151338', mainTail: '46396', orderTail: '61571',
    create: '2026-09-17 15:13:38',
    product: SUB_PRODUCTS[0], orderSource: '词元宝', subSource: '词元宝激活码',
    phone: '18688872833', status: 'pendingPay', payMethod: '0元支付'
  }),
  // 截图行 3：待交付 · 活动来源 · 旗舰版
  mkOrder({
    id: 943144, prefix: '20260917144300', mainTail: '80373', orderTail: '95080',
    create: '2026-09-17 14:43:00',
    product: SUB_PRODUCTS[4], orderSource: '活动', subSource: '活动-主机SN',
    phone: '15300835779', status: 'pendingDeliver', payMethod: '0元支付'
  }),
  // B 态连续包月订单：捆绑 2 笔加油包订单
  mkOrder({
    id: 942876, prefix: '20260916092122', mainTail: '15440', orderTail: '00876',
    create: '2026-09-16 09:21:22', pay: '2026-09-16 09:21:58',
    product: SUB_PRODUCTS[1], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '13672545167', status: 'done', payMethod: '微信支付',
    bundledBoosterNos: ['2026091609220300877', '2026091609220300878'],
    invoice: { title: '何雯怡', type: '增值税普通发票', email: 'hewy8@lenovo.com' }
  }),
  // 捆绑加油包 1：2000万 ×1，绑定 B 态 cm 订单
  mkOrder({
    id: 942877, prefix: '20260916092203', mainTail: '18771', orderTail: '00877',
    create: '2026-09-16 09:22:03', pay: '2026-09-16 09:22:40',
    product: BOOSTER_PRODUCTS[1], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '13672545167', status: 'done', payMethod: '微信支付',
    bindOrderNo: CM_ORDER_NO, bindPlanName: '基础版 · 连续包月'
  }),
  // 捆绑加油包 2：500万 ×2，绑定 B 态 cm 订单
  mkOrder({
    id: 942878, prefix: '20260916092203', mainTail: '18772', orderTail: '00878',
    create: '2026-09-16 09:22:03', pay: '2026-09-16 09:22:41', qty: 2,
    product: BOOSTER_PRODUCTS[0], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '13672545167', status: 'done', payMethod: '微信支付',
    bindOrderNo: CM_ORDER_NO, bindPlanName: '基础版 · 连续包月'
  }),
  // 独立加油包订单：绑定 B 态 cm 订单（非捆绑购买）
  mkOrder({
    id: 942879, prefix: '20260916103512', mainTail: '20879', orderTail: '00879',
    create: '2026-09-16 10:35:12', pay: '2026-09-16 10:35:47',
    product: BOOSTER_PRODUCTS[2], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '13672545167', status: 'done', payMethod: '微信支付',
    bindOrderNo: CM_ORDER_NO, bindPlanName: '基础版 · 连续包月'
  }),
  // 退款中
  mkOrder({
    id: 942650, prefix: '20260915110246', mainTail: '33650', orderTail: '02650',
    create: '2026-09-15 11:02:46', pay: '2026-09-15 11:03:19',
    product: SUB_PRODUCTS[2], orderSource: 'H5商城', subSource: '扫码入口',
    phone: '13911112222', status: 'refunding', payMethod: '微信支付'
  }),
  // 交易失败
  mkOrder({
    id: 942511, prefix: '20260914173012', mainTail: '44511', orderTail: '02511',
    create: '2026-09-14 17:30:12',
    product: SUB_PRODUCTS[1], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '15866667777', status: 'failed', payMethod: '微信支付'
  }),
  // 已取消（加油包）
  mkOrder({
    id: 942402, prefix: '20260913091845', mainTail: '55402', orderTail: '02402',
    create: '2026-09-13 09:18:45',
    product: BOOSTER_PRODUCTS[0], orderSource: 'claw客户端-win', subSource: '首页漂浮卡片',
    phone: '18755554321', status: 'cancelled', payMethod: '微信支付'
  })
];

/* ---------- 生成池：补足至 1452 条（对齐截图「全部(1452)」） ---------- */

const GEN_BASE_TIME = new Date('2026-09-17 16:00:00').getTime();
const PHONE_PREFIX = ['130', '136', '137', '139', '150', '153', '176', '186', '187', '188'];

function buildOrders(): AdminTokenOrder[] {
  const rows: AdminTokenOrder[] = [...seedOrders];
  // 可被加油包绑定/捆绑的套餐订单引用池（种子 cm 订单入池）
  const planPool: AdminTokenOrder[] = rows.filter((o) => o.bizType === 'subscription' && o.status === 'done');

  const rng = mulberry32(20260917);
  const STATUS_WEIGHTS: Array<[AdminOrderStatus, number]> = [
    ['done', 0.7], ['pendingPay', 0.08], ['pendingDeliver', 0.07],
    ['refunding', 0.05], ['failed', 0.05], ['cancelled', 0.05]
  ];
  const pickStatus = (): AdminOrderStatus => {
    const r = rng();
    let acc = 0;
    for (const [s, w] of STATUS_WEIGHTS) {
      acc += w;
      if (r < acc) return s;
    }
    return 'done';
  };

  while (rows.length < 1452) {
    const isBooster = rng() < 0.12;
    const product = isBooster
      ? BOOSTER_PRODUCTS[Math.floor(rng() * BOOSTER_PRODUCTS.length)]
      : SUB_PRODUCTS[Math.floor(rng() * SUB_PRODUCTS.length)];
    const status = pickStatus();
    const createMs = GEN_BASE_TIME - Math.floor(rng() * 30 * 24 * 3600 * 1000);
    const createD = new Date(createMs);
    const prefix = `${createD.getFullYear()}${pad2(createD.getMonth() + 1)}${pad2(createD.getDate())}${pad2(createD.getHours())}${pad2(createD.getMinutes())}${pad2(createD.getSeconds())}`;
    const paidLike = status === 'done' || status === 'refunding' || status === 'pendingDeliver';
    const payD = paidLike ? new Date(createMs + 20000 + Math.floor(rng() * 40000)) : null;
    const payMethod = rng() < 0.8 ? '微信支付' : rng() < 0.6 ? '0元支付' : '支付宝支付';
    const qty = isBooster && rng() < 0.3 ? 1 + Math.floor(rng() * 3) : 1;
    const id = nextId();

    const order = mkOrder({
      id,
      prefix,
      mainTail: String(10000 + Math.floor(rng() * 90000)),
      orderTail: String(10000 + Math.floor(rng() * 90000)),
      create: fmt(createD),
      pay: payD ? fmt(payD) : null,
      product,
      qty,
      payMethod,
      orderSource: ADMIN_ORDER_SOURCES[Math.floor(rng() * ADMIN_ORDER_SOURCES.length)],
      customerType: rng() < 0.85 ? 'OPC' : rng() < 0.6 ? '企业' : '个人',
      subSource: ADMIN_SUB_SOURCES[Math.floor(rng() * ADMIN_SUB_SOURCES.length)],
      phone: `${PHONE_PREFIX[Math.floor(rng() * PHONE_PREFIX.length)]}${String(Math.floor(rng() * 10000)).padStart(4, '0')}${String(Math.floor(rng() * 10000)).padStart(4, '0')}`,
      status,
      invoice:
        status === 'done' && rng() < 0.4
          ? { title: rng() < 0.6 ? '个人' : '联想（北京）有限公司', type: '增值税普通发票', email: `inv${id}@lenovo.com` }
          : undefined
    });

    // 加油包订单：绑定到一个已完成的套餐订单；其中约 35% 为捆绑购买（回写 bundledBoosterNos）
    if (isBooster && planPool.length > 0) {
      const target = planPool[Math.max(0, planPool.length - 1 - Math.floor(rng() * Math.min(60, planPool.length)))];
      order.bindOrderNo = target.orderNo;
      order.bindPlanName = displayNameOf(target);
      if (rng() < 0.35) {
        (target.bundledBoosterNos ??= []).push(order.orderNo);
      }
    } else if (!isBooster && status === 'done') {
      planPool.push(order);
    }
    rows.push(order);
  }
  return rows;
}

// reactive 包裹：列表页/详情页/主单关联块读同一响应式状态源，退款后状态同步可见
export const adminTokenOrders: AdminTokenOrder[] = reactive(buildOrders());

const orderNoMap = new Map<string, AdminTokenOrder>(adminTokenOrders.map((o) => [o.orderNo, o]));

/** 按订单号查订单（详情/互跳） */
export const findAdminOrder = (orderNo: string): AdminTokenOrder | undefined => orderNoMap.get(orderNo);

/**
 * 关联订单（双向，同列表口径）：
 * - 加油包单 → 绑定生效中套餐订单行
 * - 套餐单 → 捆绑加油包订单行（bundledBoosterNos）+ 独立绑定到本单的加油包行（反向 bindOrderNo）
 */
export interface RelatedOrderRow {
  label: string;
  orderNo: string;
  desc: string;
}

export const relatedOrdersOf = (o: AdminTokenOrder): RelatedOrderRow[] => {
  const rows: RelatedOrderRow[] = [];
  if (o.bizType === 'booster' && o.bindOrderNo) {
    rows.push({ label: '绑定生效中套餐订单', orderNo: o.bindOrderNo, desc: o.bindPlanName ?? '' });
  }
  if (o.bizType === 'subscription') {
    (o.bundledBoosterNos ?? []).forEach((no) => {
      const b = orderNoMap.get(no);
      rows.push({ label: '捆绑加油包订单', orderNo: no, desc: b ? `${b.productName}×${b.qty}` : '' });
    });
    adminTokenOrders.forEach((b) => {
      if (b.bizType === 'booster' && b.bindOrderNo === o.orderNo && !(o.bundledBoosterNos ?? []).includes(b.orderNo)) {
        rows.push({ label: '绑定加油包订单', orderNo: b.orderNo, desc: `${b.productName}×${b.qty}` });
      }
    });
  }
  return rows;
};

/** 列表组内互显行（仅列表口径）：加油包→绑定套餐；套餐→捆绑加油包 */
export const listLinkRowsOf = (o: AdminTokenOrder): RelatedOrderRow[] => {
  if (o.bizType === 'booster' && o.bindOrderNo) {
    return [{ label: '绑定生效中套餐订单', orderNo: o.bindOrderNo, desc: o.bindPlanName ?? '' }];
  }
  if (o.bizType === 'subscription' && (o.bundledBoosterNos ?? []).length > 0) {
    return (o.bundledBoosterNos ?? []).map((no) => {
      const b = orderNoMap.get(no);
      return { label: '捆绑加油包订单', orderNo: no, desc: b ? `${b.productName}×${b.qty}` : '' };
    });
  }
  return [];
};

/**
 * 后台退款（加油包订单）：状态置「已退款」+ 写入退款信息
 * 与列表页/主单关联加油包块共用同一 reactive 数据源，状态变更即时同步
 */
export function refundAdminOrder(orderNo: string, reason: AdminRefundReason): AdminRefundInfo | null {
  const o = orderNoMap.get(orderNo);
  if (!o || o.status === 'refunded') return null;
  const info: AdminRefundInfo = {
    refundNo: `RF${Date.now()}`,
    amount: o.unitPrice * o.qty,
    reason,
    time: fmt(new Date()),
    operator: '后台管理员'
  };
  o.status = 'refunded';
  o.refundInfo = info;
  return info;
}

/* ------------------------------------------------------------------ */
/* ③ 连续订阅管理                                                      */
/* ------------------------------------------------------------------ */

export type PayChannel = '微信支付' | '支付宝支付';

export interface RenewRow {
  id: number;
  phone: string;
  phoneMasked: string;
  planName: string;
  quotaLabel: string;   // 额度label，与 planName 拼成「商品名称」，如 "2.4亿 Token"
  planVersion: '连续订阅';
  subStatus: 'active' | 'expired';
  autoRenew: 'on' | 'off';
  payChannel: PayChannel;
  cycleStart: string;
  cycleEnd: string;
  nextDeduct: string;   // 下次扣费时间（关闭态页面展示 '-'）
  deductCount: number;  // 累计连续扣费次数
  switchCount: number;  // 开关操作次数
}

export type RenewOperator = '用户' | '微信平台' | '系统' | '后台管理员';
export type RenewAction = '签约开启' | '关闭连续订阅' | '开启连续订阅' | '周期扣费';

export interface RenewLog {
  id: number;
  time: string;
  phoneMasked: string;
  operator: RenewOperator;
  action: RenewAction;
  result: '成功' | '失败';
  remark: string;
}

const DAY = 24 * 60 * 60 * 1000;
const maskPhone = (phone: string): string => `${phone.slice(0, 3)}****${phone.slice(7)}`;
const dayFmt = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

// 与前台演示用户 B/D/F 同周期口径
const B_START = new Date(Date.now() - 25 * DAY);
const B_END = new Date(Date.now() + 5 * DAY);
const D_START = new Date(Date.now() - 60 * DAY);
const D_END = new Date(Date.now() + 30 * DAY);
const F_START = new Date(Date.now() - 33 * DAY);
const F_END = new Date(Date.now() - 3 * DAY);

function mkRenewRow(p: Omit<RenewRow, 'phoneMasked' | 'planVersion'>): RenewRow {
  return { ...p, phoneMasked: maskPhone(p.phone), planVersion: '连续订阅' };
}

export const renewRows = reactive<RenewRow[]>([
  mkRenewRow({ id: 1, phone: '13672545167', planName: '基础版', quotaLabel: '2.4亿 Token', subStatus: 'active', autoRenew: 'on', payChannel: '微信支付', cycleStart: dayFmt(B_START), cycleEnd: dayFmt(B_END), nextDeduct: dayFmt(B_END), deductCount: 3, switchCount: 1 }),
  mkRenewRow({ id: 2, phone: '13713276688', planName: '基础版', quotaLabel: '2.4亿 Token', subStatus: 'active', autoRenew: 'on', payChannel: '支付宝支付', cycleStart: dayFmt(D_START), cycleEnd: dayFmt(D_END), nextDeduct: dayFmt(D_END), deductCount: 2, switchCount: 0 }),
  mkRenewRow({ id: 3, phone: '13358922048', planName: '基础版', quotaLabel: '2.4亿 Token', subStatus: 'expired', autoRenew: 'off', payChannel: '微信支付', cycleStart: dayFmt(F_START), cycleEnd: dayFmt(F_END), nextDeduct: dayFmt(F_END), deductCount: 1, switchCount: 2 }),
  mkRenewRow({ id: 4, phone: '17620585002', planName: '权益版 Plus', quotaLabel: '3亿 Token', subStatus: 'active', autoRenew: 'on', payChannel: '支付宝支付', cycleStart: dayFmt(new Date(Date.now() - 12 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 18 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 18 * DAY)), deductCount: 5, switchCount: 3 }),
  mkRenewRow({ id: 5, phone: '15066359669', planName: '体验版', quotaLabel: '3000万 Token', subStatus: 'active', autoRenew: 'off', payChannel: '微信支付', cycleStart: dayFmt(new Date(Date.now() - 20 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 10 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 10 * DAY)), deductCount: 1, switchCount: 1 }),
  mkRenewRow({ id: 6, phone: '18615940210', planName: '进阶版', quotaLabel: '4.5亿 Token', subStatus: 'active', autoRenew: 'on', payChannel: '支付宝支付', cycleStart: dayFmt(new Date(Date.now() - 40 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 50 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 50 * DAY)), deductCount: 4, switchCount: 0 }),
  mkRenewRow({ id: 7, phone: '13047611827', planName: '专业版', quotaLabel: '9亿 Token', subStatus: 'expired', autoRenew: 'off', payChannel: '微信支付', cycleStart: dayFmt(new Date(Date.now() - 95 * DAY)), cycleEnd: dayFmt(new Date(Date.now() - 5 * DAY)), nextDeduct: dayFmt(new Date(Date.now() - 5 * DAY)), deductCount: 3, switchCount: 4 }),
  mkRenewRow({ id: 8, phone: '18774138999', planName: '体验版', quotaLabel: '3000万 Token', subStatus: 'active', autoRenew: 'on', payChannel: '微信支付', cycleStart: dayFmt(new Date(Date.now() - 8 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 22 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 22 * DAY)), deductCount: 1, switchCount: 0 }),
  mkRenewRow({ id: 9, phone: '15381465779', planName: '旗舰版', quotaLabel: '18亿 Token', subStatus: 'active', autoRenew: 'off', payChannel: '支付宝支付', cycleStart: dayFmt(new Date(Date.now() - 55 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 35 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 35 * DAY)), deductCount: 2, switchCount: 2 }),
  mkRenewRow({ id: 10, phone: '17392805822', planName: '基础版', quotaLabel: '2.4亿 Token', subStatus: 'expired', autoRenew: 'off', payChannel: '微信支付', cycleStart: dayFmt(new Date(Date.now() - 120 * DAY)), cycleEnd: dayFmt(new Date(Date.now() - 30 * DAY)), nextDeduct: dayFmt(new Date(Date.now() - 30 * DAY)), deductCount: 4, switchCount: 1 }),
  mkRenewRow({ id: 11, phone: '18659022833', planName: '进阶版', quotaLabel: '4.5亿 Token', subStatus: 'active', autoRenew: 'on', payChannel: '微信支付', cycleStart: dayFmt(new Date(Date.now() - 3 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 27 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 27 * DAY)), deductCount: 1, switchCount: 0 }),
  mkRenewRow({ id: 12, phone: '13742140628', planName: '体验版', quotaLabel: '3000万 Token', subStatus: 'active', autoRenew: 'on', payChannel: '支付宝支付', cycleStart: dayFmt(new Date(Date.now() - 66 * DAY)), cycleEnd: dayFmt(new Date(Date.now() + 24 * DAY)), nextDeduct: dayFmt(new Date(Date.now() + 24 * DAY)), deductCount: 6, switchCount: 2 })
]);

let logSeq = 1000;
const mkLog = (time: string, phoneMasked: string, operator: RenewOperator, action: RenewAction, result: '成功' | '失败', remark: string): RenewLog =>
  ({ id: ++logSeq, time, phoneMasked, operator, action, result, remark });

export const renewLogs = reactive<RenewLog[]>([
  mkLog(dayFmt(new Date(Date.now() - 1 * DAY)), maskPhone('13672545167'), '微信平台', '周期扣费', '成功', '第 3 期周期扣费，扣费金额 ¥89.00'),
  mkLog(dayFmt(new Date(Date.now() - 2 * DAY)), maskPhone('18615940210'), '微信平台', '周期扣费', '成功', '第 4 期周期扣费，扣费金额 ¥169.00'),
  mkLog(dayFmt(new Date(Date.now() - 3 * DAY)), maskPhone('13358922048'), '系统', '周期扣费', '失败', '扣费失败：用户微信余额不足，重试 3 次后停止'),
  mkLog(dayFmt(new Date(Date.now() - 3 * DAY)), maskPhone('13358922048'), '用户', '关闭连续订阅', '成功', '用户在订阅管理页主动关闭，当前周期服务保留至周期末'),
  mkLog(dayFmt(new Date(Date.now() - 6 * DAY)), maskPhone('17620585002'), '后台管理员', '开启连续订阅', '成功', '客服工单 #4521：用户申请恢复自动续费'),
  mkLog(dayFmt(new Date(Date.now() - 9 * DAY)), maskPhone('15066359669'), '用户', '关闭连续订阅', '成功', '用户在订阅管理页主动关闭'),
  mkLog(dayFmt(new Date(Date.now() - 11 * DAY)), maskPhone('18774138999'), '用户', '签约开启', '成功', '微信签约成功，协议号 contract_demo_h'),
  mkLog(dayFmt(new Date(Date.now() - 15 * DAY)), maskPhone('15381465779'), '后台管理员', '关闭连续订阅', '成功', '风控工单 #4488：异常扣费申诉，暂停续扣'),
  mkLog(dayFmt(new Date(Date.now() - 21 * DAY)), maskPhone('13742140628'), '微信平台', '周期扣费', '成功', '第 6 期周期扣费，扣费金额 ¥35.00'),
  mkLog(dayFmt(new Date(Date.now() - 25 * DAY)), maskPhone('13672545167'), '微信平台', '周期扣费', '成功', '第 2 期周期扣费，扣费金额 ¥89.00'),
  mkLog(dayFmt(new Date(Date.now() - 31 * DAY)), maskPhone('13047611827'), '系统', '周期扣费', '失败', '扣费失败：签约协议已解约'),
  mkLog(dayFmt(new Date(Date.now() - 33 * DAY)), maskPhone('13358922048'), '用户', '签约开启', '成功', '微信签约成功，协议号 contract_demo_f'),
  mkLog(dayFmt(new Date(Date.now() - 55 * DAY)), maskPhone('13672545167'), '用户', '签约开启', '成功', '微信签约成功，协议号 contract_demo_b'),
  mkLog(dayFmt(new Date(Date.now() - 60 * DAY)), maskPhone('13713276688'), '用户', '签约开启', '成功', '微信签约成功，协议号 contract_demo_d')
]);

/** 后台开关连续订阅：更新行状态 + 追加一条「后台管理员」日志（日志表即时刷新） */
export function adminToggleAutoRenew(rowId: number): void {
  const row = renewRows.find((r) => r.id === rowId);
  if (!row) return;
  const turningOn = row.autoRenew === 'off';
  row.autoRenew = turningOn ? 'on' : 'off';
  row.switchCount += 1;
  renewLogs.unshift(
    mkLog(
      dayFmt(new Date()),
      row.phoneMasked,
      '后台管理员',
      turningOn ? '开启连续订阅' : '关闭连续订阅',
      '成功',
      turningOn
        ? `后台恢复自动续费，下次扣费时间 ${row.nextDeduct}`
        : '后台停止自动续费，当前周期服务保留至周期末'
    )
  );
}
