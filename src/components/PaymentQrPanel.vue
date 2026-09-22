<!-- src/components/PaymentQrPanel.vue -->
<!-- 共享支付二维码页：标题栏 + 支付方式页签 + 四角扫描框二维码（伪二维码+协议遮罩）+ 倒计时 -->
<!-- mode='continuous' 连续包月：仅微信支付页签，遮罩内增补自动扣费协议与连续包月必要信息 -->
<!-- mode='normal' 一次性购买：微信/支付宝双通道页签可切换，支付宝视图换种子+蓝色定位角+中心"支"标识 -->
<template>
  <div class="pay-panel">
    <!-- 标题栏：左"购买支付" + 右上灰色× -->
    <div class="pay-header">
      <h3 class="pay-title">购买支付</h3>
      <button class="pay-close" @click="emit('close')">×</button>
    </div>

    <!-- 支付方式页签（居中）：continuous 仅微信支付；normal 双通道可切换 -->
    <div class="pay-tabs">
      <button class="tab" :class="isAlipay ? 'tab-plain' : 'tab-active'" @click="payMethod = 'wechat'">
        微信支付
      </button>
      <button
        v-if="mode === 'normal'"
        class="tab"
        :class="isAlipay ? 'tab-active' : 'tab-plain'"
        @click="payMethod = 'alipay'"
      >
        支付宝
      </button>
    </div>

    <!-- 二维码区：外层白色区域带四角扫描框括号 -->
    <div class="qr-frame">
      <span class="corner corner-tl"></span>
      <span class="corner corner-tr"></span>
      <span class="corner corner-bl"></span>
      <span class="corner corner-br"></span>

      <div class="qr-box">
        <!-- 伪二维码：固定种子生成的方块矩阵，每次渲染一致 -->
        <svg
          class="qr-svg"
          :class="{ blurred: masked }"
          :viewBox="`0 0 ${QR_N} ${QR_N}`"
          shape-rendering="crispEdges"
          aria-hidden="true"
        >
          <rect :width="QR_N" :height="QR_N" fill="#ffffff" />
          <rect v-for="(r, i) in qrRects" :key="i" :x="r.x" :y="r.y" :width="r.w" :height="r.h" fill="#1a1a1a" />
          <g v-for="(f, i) in qrFinders" :key="`f${i}`">
            <rect :x="f.c" :y="f.r" width="7" height="7" :fill="finderColor" />
            <rect :x="f.c + 1" :y="f.r + 1" width="5" height="5" fill="#ffffff" />
            <rect :x="f.c + 2" :y="f.r + 2" width="3" height="3" :fill="finderColor" />
          </g>
          <!-- 支付宝视图：中心白底"支"字小标识 -->
          <g v-if="isAlipay">
            <rect x="9.5" y="9.5" width="6" height="6" rx="1" fill="#ffffff" />
            <text
              x="12.5"
              y="12.6"
              text-anchor="middle"
              dominant-baseline="central"
              font-size="4.2"
              font-weight="700"
              fill="#1677FF"
            >支</text>
          </g>
        </svg>

        <!-- 协议遮罩（勾选复选框后掀起） -->
        <div v-if="masked" class="qr-mask">
          <!-- 签约线必要信息 -->
          <div v-if="mode === 'continuous'" class="mask-renew">
            <p class="mask-renew-amount">{{ cycleType === 'quarterly' ? '每3个月自动扣费' : '每月自动扣费' }} ¥{{ amountText }}</p>
            <p>首次扣款后立即生效，{{ cycleType === 'quarterly' ? '每季度' : '每月' }}到期前自动续扣</p>
            <p>可随时在订阅管理中取消自动续费</p>
          </div>
          <!-- 通用协议 + 复选框 -->
          <div class="mask-agree" @click="agreed = true">
            <span class="mask-checkbox"></span>
            <p class="mask-agree-text">
              您已同意
              <a class="mask-link" href="#" @click.prevent.stop>Token Plan 服务条款</a>、<a
                class="mask-link"
                href="#"
                @click.prevent.stop
                >隐私条款</a
              ><template v-if="mode === 'continuous'"
                >、<a class="mask-link" href="#" @click.prevent.stop>自动续费服务协议</a></template
              >。虚拟服务一经购买不支持退款。
            </p>
          </div>
        </div>

        <!-- 倒计时归零：失效态 -->
        <div v-else-if="expired" class="qr-expired">
          <p class="expired-text">二维码已失效</p>
          <button class="refresh-btn" @click="refreshQr">刷新二维码</button>
        </div>
      </div>
    </div>

    <!-- 勾选后的原型演示触发入口（continuous模式直接展示，normal模式勾选后展示） -->
    <button v-if="(mode === 'continuous' || agreed) && !expired" class="demo-pay-btn" @click="emit('paid')">
      （原型演示）模拟扫码支付成功
    </button>

    <!-- 底部倒计时：10:00 起 mm分ss秒 -->
    <p class="countdown">二维码将在 <span class="cd-time">{{ mmText }}分{{ ssText }}秒</span> 后失效</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  mode: 'continuous' | 'normal';
  amount?: number; // 元，签约线每次自动扣费金额
  cycleType?: 'monthly' | 'quarterly'; // 签约周期类型（continuous 模式下生效）
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'paid'): void;
}>();

const TOTAL_SECONDS = 600; // 10:00 起倒计时
const agreed = ref(false);
const remain = ref(TOTAL_SECONDS);

// 支付方式：默认微信支付；弹窗关闭/重开随 v-if 重新挂载即重置回微信
const payMethod = ref<'wechat' | 'alipay'>('wechat');
const isAlipay = computed(() => payMethod.value === 'alipay');

const expired = computed(() => remain.value <= 0);
// continuous模式不展示遮罩，二维码直接可见；normal模式保持原有勾选掀罩逻辑
const masked = computed(() => props.mode !== 'continuous' && !agreed.value && !expired.value);
const amountText = computed(() => (props.amount ?? 0).toLocaleString('zh-CN'));

const mmText = computed(() => String(Math.floor(remain.value / 60)).padStart(2, '0'));
const ssText = computed(() => String(remain.value % 60).padStart(2, '0'));

// 倒计时：组件挂载启动、卸载清理（弹窗关闭/重开随 v-if 重新挂载即重置）
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => {
    if (remain.value > 0) remain.value -= 1;
  }, 1000);
});
onUnmounted(() => {
  if (timer !== undefined) window.clearInterval(timer);
});

const refreshQr = () => {
  remain.value = TOTAL_SECONDS;
};

/* ---------- 伪二维码：固定种子矩阵，保证每次渲染一致 ---------- */
const QR_N = 25;

interface QrRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// mulberry32 固定种子伪随机数
const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const inFinder = (r: number, c: number) =>
  (r < 8 && c < 8) || (r < 8 && c >= QR_N - 8) || (r >= QR_N - 8 && c < 8);

const buildQrRects = (seed: number): QrRect[] => {
  const rnd = mulberry32(seed);
  const rects: QrRect[] = [];
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      if (!inFinder(r, c) && rnd() < 0.46) rects.push({ x: c, y: r, w: 1, h: 1 });
    }
  }
  return rects;
};

// 双通道伪二维码：微信/支付宝不同种子，矩阵互不相同
const wechatRects = buildQrRects(20260911);
const alipayRects = buildQrRects(20260913);
const qrRects = computed(() => (isAlipay.value ? alipayRects : wechatRects));
// 支付宝视图：定位角点缀支付宝蓝
const finderColor = computed(() => (isAlipay.value ? '#1677FF' : '#1a1a1a'));
// 三处定位角（同心回字）
const qrFinders = [
  { r: 0, c: 0 },
  { r: 0, c: QR_N - 7 },
  { r: QR_N - 7, c: 0 },
];
</script>

<style scoped>
.pay-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 标题栏 */
.pay-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.pay-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.pay-close {
  border: none;
  background: transparent;
  padding: 2px 4px;
  font-size: 22px;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
}

.pay-close:hover {
  color: var(--text-title);
}

/* 支付方式页签 */
.pay-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.tab {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
}

.tab-active {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 32px;
  border-radius: 9px;
  background: #000;
  color: #fff;
  font-weight: 600;
  cursor: default;
}

.tab-plain {
  border: none;
  background: transparent;
  padding: 0 4px;
  color: #1a1a1a;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-plain:hover {
  color: var(--text-secondary);
}

/* 二维码区：四角扫描框括号 */
.qr-frame {
  position: relative;
  width: 348px;
  max-width: 100%;
  padding: 19px;
  box-sizing: border-box;
}

.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 0 solid #1a1a1a;
}

.corner-tl {
  top: 0;
  left: 0;
  border-top-width: 1.5px;
  border-left-width: 1.5px;
  border-top-left-radius: 6px;
}

.corner-tr {
  top: 0;
  right: 0;
  border-top-width: 1.5px;
  border-right-width: 1.5px;
  border-top-right-radius: 6px;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-bottom-width: 1.5px;
  border-left-width: 1.5px;
  border-bottom-left-radius: 6px;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-bottom-width: 1.5px;
  border-right-width: 1.5px;
  border-bottom-right-radius: 6px;
}

.qr-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.qr-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.qr-svg.blurred {
  filter: blur(2px);
}

/* 协议遮罩（深灰半透明，叠在二维码上） */
.qr-mask {
  position: absolute;
  inset: 0;
  background: rgba(74, 74, 74, 0.86);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  box-sizing: border-box;
}

/* 连续包月必要信息 */
.mask-renew {
  text-align: center;
}

.mask-renew p {
  margin: 0 0 4px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.mask-renew-amount {
  font-size: 14px !important;
  font-weight: 600;
  color: #fff !important;
}

/* 复选框 + 协议文案 */
.mask-agree {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.mask-checkbox {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  border: 1.5px solid #fff;
  border-radius: 5px;
  background: transparent;
  box-sizing: border-box;
}

.mask-agree-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #fff;
  text-align: left;
}

.mask-link {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* 失效态 */
.qr-expired {
  position: absolute;
  inset: 0;
  background: rgba(74, 74, 74, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.expired-text {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}

.refresh-btn {
  height: 34px;
  padding: 0 22px;
  border: 1px solid #fff;
  border-radius: 17px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 原型演示触发入口 */
.demo-pay-btn {
  margin: 12px 0 0;
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.demo-pay-btn:hover {
  color: var(--text-link);
}

/* 底部倒计时 */
.countdown {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--text-link);
}

.cd-time {
  color: #2b6de8;
  font-weight: 500;
}
</style>
