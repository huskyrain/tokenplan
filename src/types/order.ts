// src/types/order.ts
import type { PlanType } from './plan';

/**
 * 扣费周期（仅签约线 cm/cq）
 * - monthly：每月自动扣费
 * - quarterly：每 3 个月自动扣费
 */
export type DeductCycle = 'monthly' | 'quarterly';

/**
 * 自动续费状态
 * - active：续费中（绿色徽章）
 * - stopped：已停止（灰色徽章，用户主动取消或年包排队自动解约）
 */
export type AutoRenewStatus = 'active' | 'stopped';

/** 发票信息（购买记录弹层展示；存在即视为已开票） */
export interface OrderInvoiceInfo {
  title: string;   // 发票抬头
  type: string;    // 发票类型，如 "增值税普通发票"
  email: string;   // 收票人邮箱
}

export interface Order {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  displayName: string;    // 服务单显示名，如 "基础版 · 连续包月"
  amount: number;         // 订单金额（分）
  status: 'pending' | 'paid' | 'cancelled' | 'failed' | 'queue';
  createTime: Date | string;
  paidTime?: Date | string;
  queuePosition?: number; // 排队位置（仅手动排队订单）
  boundTo?: string;       // 绑定的服务单ID（加油包）

  /* ---------- 购买记录页扩展字段 ---------- */
  planType?: PlanType;         // 产品线（用于分类筛选）
  team?: boolean;              // 团队版订单（团队域：不计入标准版生效服务单容量/加油包门槛）
  startDate?: Date | string;   // 服务生效开始日期
  endDate?: Date | string;     // 服务失效日期
  quota?: number;              // Token 额度（数值）
  tokenLabel?: string;         // Token 额度展示文案，如 "8000万 Token"

  /* ---------- 签约线（cm/cq）专属：连续扣费信息 ---------- */
  deductCycle?: DeductCycle;        // 扣费周期：每月 / 每 3 个月
  deductCount?: number;             // 连续扣费次数（初始购买 = 1）
  nextDeductDate?: Date | string;   // 下次扣费时间（renewalStopped 后仍保留原值，页面展示为 '-'）
  autoRenewStatus?: AutoRenewStatus; // 自动续费状态徽章

  /* ---------- 购买记录弹层扩展字段 ---------- */
  refundAmount?: number;            // 退款金额（分）；存在即视为已退款单
  refundTime?: Date | string;       // 退款时间
  invoiceInfo?: OrderInvoiceInfo;   // 发票信息（存在 = 已开票，否则展示"申请发票"按钮）
}

export interface BoosterPack {
  id: string;
  userId: string;
  orderId: string;
  tokenAmount: number;    // Token数量（总额度）
  remaining: number;      // 剩余Token数量
  tokenLabel: string;     // 展示用，如 "500万 Token"
  boundTo: string;        // 绑定的服务单ID
  boundToName: string;    // 绑定的服务单显示名
  status: 'active' | 'expired' | 'consumed';
  createTime: Date | string;
  expireTime: Date | string;
}
