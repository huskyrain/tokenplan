<!-- src/components/CancelDeductGuideModal.vue -->
<!-- 图文分步指南：如何在微信支付中关闭联想百应 Token Plan 的连续扣费服务 -->
<!-- 全部手机屏 UI 均为 CSS 绘制，未使用任何图片资源 -->
<template>
  <Teleport to="body">
    <Transition name="cdg-fade">
      <div v-if="visible" class="cdg-mask" @click.self="handleClose">
        <div class="cdg-dialog" role="dialog" aria-modal="true" aria-labelledby="cdg-title">
          <button class="cdg-close" aria-label="关闭" @click="handleClose">×</button>

          <header class="cdg-header">
            <div class="cdg-tag">微信支付 · 图文教程</div>
            <h3 class="cdg-title" id="cdg-title">如何取消连续扣费（微信支付）</h3>
            <p class="cdg-subtitle">
              按下方 6 步在微信中关闭「联想百应 Token Plan」的自动扣费服务；关闭后当前周期内已付费用不受影响。
            </p>
          </header>

          <div class="cdg-grid">
            <!-- ============ Step 1: 底部导航 → 我 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav">
                    <span class="wx-nav-title">微信</span>
                    <span class="wx-nav-plus">＋</span>
                  </div>
                  <div class="wx-chat-list">
                    <div v-for="n in 4" :key="n" class="chat-row">
                      <div class="chat-avatar" :style="{ background: chatAvatarColor(n) }"></div>
                      <div class="chat-lines">
                        <span class="ln-a"></span>
                        <span class="ln-b"></span>
                      </div>
                      <span class="chat-time">{{ ['9:32', '昨天', '昨天', '周一'][n - 1] }}</span>
                    </div>
                  </div>
                  <div class="wx-tabbar">
                    <div class="tab">
                      <i class="tab-i tab-wechat"></i>
                      <span>微信</span>
                    </div>
                    <div class="tab">
                      <i class="tab-i tab-contacts"></i>
                      <span>通讯录</span>
                    </div>
                    <div class="tab">
                      <i class="tab-i tab-discover"></i>
                      <span>发现</span>
                    </div>
                    <div class="tab hl tab-active">
                      <i class="tab-i tab-me"></i>
                      <span>我</span>
                      <em class="hl-ring"></em>
                      <em class="hl-arrow"></em>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">1</span>
                <p class="cap-text">打开微信，点击底部导航最右侧的<b>「我」</b></p>
              </div>
            </article>

            <!-- ============ Step 2: 我 → 服务 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav">
                    <span class="wx-nav-title">我</span>
                    <span class="wx-nav-plus">⚙</span>
                  </div>
                  <div class="me-profile">
                    <div class="me-avatar"></div>
                    <div class="me-lines">
                      <span class="me-name"></span>
                      <span class="me-wxid">微信号：lenovo_****</span>
                    </div>
                    <span class="me-qr">▤</span>
                  </div>
                  <div class="me-list">
                    <div class="me-row hl">
                      <i class="me-ico ico-service"></i>
                      <span class="me-label">服务</span>
                      <span class="me-arrow">›</span>
                      <em class="hl-ring"></em>
                      <em class="hl-arrow"></em>
                    </div>
                    <div class="me-row"><i class="me-ico ico-fav"></i><span class="me-label">收藏</span><span class="me-arrow">›</span></div>
                    <div class="me-row"><i class="me-ico ico-album"></i><span class="me-label">朋友圈</span><span class="me-arrow">›</span></div>
                    <div class="me-row"><i class="me-ico ico-card"></i><span class="me-label">卡包</span><span class="me-arrow">›</span></div>
                    <div class="me-row"><i class="me-ico ico-emoji"></i><span class="me-label">表情</span><span class="me-arrow">›</span></div>
                  </div>
                  <div class="wx-tabbar">
                    <div class="tab"><i class="tab-i tab-wechat"></i><span>微信</span></div>
                    <div class="tab"><i class="tab-i tab-contacts"></i><span>通讯录</span></div>
                    <div class="tab"><i class="tab-i tab-discover"></i><span>发现</span></div>
                    <div class="tab tab-active"><i class="tab-i tab-me"></i><span>我</span></div>
                  </div>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">2</span>
                <p class="cap-text">进入「我」页面，点击顶部<b>「服务」</b>入口</p>
              </div>
            </article>

            <!-- ============ Step 3: 服务 → 钱包 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav wx-nav-back">
                    <span class="wx-nav-back-ico">‹</span>
                    <span class="wx-nav-title">服务</span>
                  </div>
                  <div class="svc-scroll">
                    <div class="svc-group">
                      <p class="svc-group-title">生活服务</p>
                      <div class="svc-tiles">
                        <div class="svc-tile"><i class="sv sv-city"></i><span>城市服务</span></div>
                        <div class="svc-tile"><i class="sv sv-phone"></i><span>手机充值</span></div>
                        <div class="svc-tile"><i class="sv sv-bill"></i><span>生活缴费</span></div>
                        <div class="svc-tile"><i class="sv sv-car"></i><span>出行</span></div>
                      </div>
                    </div>
                    <div class="svc-group">
                      <p class="svc-group-title">金融理财</p>
                      <div class="svc-tiles">
                        <div class="svc-tile hl">
                          <i class="sv sv-wallet"></i>
                          <span>钱包</span>
                          <em class="hl-ring hl-ring-tile"></em>
                          <em class="hl-arrow"></em>
                        </div>
                        <div class="svc-tile"><i class="sv sv-loan"></i><span>微粒贷</span></div>
                        <div class="svc-tile"><i class="sv sv-fund"></i><span>理财通</span></div>
                        <div class="svc-tile"><i class="sv sv-insure"></i><span>保险</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">3</span>
                <p class="cap-text">在「服务」页「金融理财」下点击<b>「钱包」</b></p>
              </div>
            </article>

            <!-- ============ Step 4: 钱包 → 支付设置 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav wx-nav-back">
                    <span class="wx-nav-back-ico">‹</span>
                    <span class="wx-nav-title">钱包</span>
                  </div>
                  <div class="wallet-cards">
                    <div class="w-card w-card-balance">
                      <span class="wc-lbl">零钱</span>
                      <span class="wc-num">¥ 128.60</span>
                    </div>
                    <div class="w-card w-card-bank">
                      <span class="wc-lbl">银行卡</span>
                      <span class="wc-num">3 张</span>
                    </div>
                  </div>
                  <div class="wallet-list">
                    <div class="w-row"><i class="w-ico ic-bill"></i><span>交易账单</span><span class="me-arrow">›</span></div>
                    <div class="w-row"><i class="w-ico ic-shield"></i><span>消费者保护</span><span class="me-arrow">›</span></div>
                    <div class="w-row hl">
                      <i class="w-ico ic-gear"></i>
                      <span>支付设置</span>
                      <span class="me-arrow">›</span>
                      <em class="hl-ring"></em>
                      <em class="hl-arrow"></em>
                    </div>
                    <div class="w-row"><i class="w-ico ic-help"></i><span>帮助中心</span><span class="me-arrow">›</span></div>
                  </div>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">4</span>
                <p class="cap-text">在「钱包」页找到并点击<b>「支付设置」</b></p>
              </div>
            </article>

            <!-- ============ Step 5: 支付设置 → 自动续费 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav wx-nav-back">
                    <span class="wx-nav-back-ico">‹</span>
                    <span class="wx-nav-title">支付设置</span>
                  </div>
                  <div class="pay-list">
                    <div class="p-row"><span>免密支付</span><span class="p-hint">未开通</span><span class="me-arrow">›</span></div>
                    <div class="p-row hl">
                      <span>自动续费</span>
                      <span class="p-hint p-hint-red">1 项服务</span>
                      <span class="me-arrow">›</span>
                      <em class="hl-ring"></em>
                      <em class="hl-arrow"></em>
                    </div>
                    <div class="p-row"><span>面容/指纹支付</span><span class="p-hint">已开启</span><span class="me-arrow">›</span></div>
                    <div class="p-row"><span>数字证书</span><span class="p-hint">已安装</span><span class="me-arrow">›</span></div>
                    <div class="p-row"><span>支付管理</span><span class="me-arrow">›</span></div>
                  </div>
                  <p class="pay-tip">部分微信版本入口名为「扣费服务」，路径一致。</p>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">5</span>
                <p class="cap-text">点击<b>「自动续费」</b>（部分版本为「扣费服务」）</p>
              </div>
            </article>

            <!-- ============ Step 6: 找到联想百应 → 关闭服务 ============ -->
            <article class="cdg-step">
              <div class="phone">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="status-bar">
                    <span class="sb-time">9:41</span>
                    <span class="sb-icons">
                      <i class="ic ic-signal"></i>
                      <i class="ic ic-wifi"></i>
                      <i class="ic ic-battery"></i>
                    </span>
                  </div>
                  <div class="wx-nav wx-nav-back">
                    <span class="wx-nav-back-ico">‹</span>
                    <span class="wx-nav-title">自动续费</span>
                  </div>
                  <div class="ar-list">
                    <div class="ar-item hl-item">
                      <div class="ar-logo">联想</div>
                      <div class="ar-info">
                        <span class="ar-name">联想百应 Token Plan</span>
                        <span class="ar-desc">¥89.00 / 月 · 下次扣费 09-25</span>
                      </div>
                      <em class="hl-ring hl-ring-item"></em>
                    </div>
                    <div class="ar-detail">
                      <div class="ar-detail-row"><span>签约方</span><span>联想（北京）有限公司</span></div>
                      <div class="ar-detail-row"><span>扣费方式</span><span>零钱 / 招商银行</span></div>
                      <div class="ar-detail-row"><span>签约时间</span><span>2026-08-25</span></div>
                    </div>
                    <div class="ar-close hl">
                      <span>关闭服务</span>
                      <em class="hl-ring hl-ring-btn"></em>
                      <em class="hl-arrow hl-arrow-btn"></em>
                    </div>
                    <p class="ar-confirm">点击后在弹窗中确认「关闭服务」即可。</p>
                  </div>
                </div>
              </div>
              <div class="cdg-caption">
                <span class="cap-num">6</span>
                <p class="cap-text">找到<b>「联想百应 Token Plan」</b>→ 点<b>「关闭服务」</b>并确认</p>
              </div>
            </article>
          </div>

          <footer class="cdg-footer">
            <p class="cdg-note">
              关闭后当前周期结束将不再扣费，已付周期服务保留至周期末。
            </p>
            <button class="cdg-btn" @click="handleClose">我已了解</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const handleClose = () => emit('update:visible', false);

// 打开时锁定 body 滚动，关闭时释放
watch(
  () => props.visible,
  (v) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = v ? 'hidden' : '';
  }
);

// 聊天头像背景色（步骤 1 装饰用）
const chatAvatarColor = (n: number) => {
  const palette = ['#f4c27a', '#8fcf9b', '#7aa7e0', '#d99fc7'];
  return palette[(n - 1) % palette.length];
};
</script>

<style scoped>
/* ============ 遮罩与容器 ============ */
.cdg-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(20, 20, 26, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  overflow-y: auto;
}

.cdg-dialog {
  position: relative;
  width: min(920px, 100%);
  max-height: calc(100vh - 64px);
  background: #fff;
  border-radius: 20px;
  padding: 36px 36px 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  animation: cdg-in 0.3s ease;
  overflow-y: auto;
}

@keyframes cdg-in {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.cdg-close {
  position: absolute;
  top: 16px;
  right: 18px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 3;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}

.cdg-close:hover {
  background: #f2f3f5;
  color: var(--text-title);
}

/* ============ 头部 ============ */
.cdg-header {
  text-align: left;
  margin-bottom: 24px;
  padding-right: 40px;
}

.cdg-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.cdg-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-title);
  letter-spacing: 0.3px;
}

.cdg-subtitle {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--text-link);
}

/* ============ 6 步网格 ============ */
.cdg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px 20px;
  margin-bottom: 24px;
}

.cdg-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* ============ Caption ============ */
.cdg-caption {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 0 4px;
}

.cap-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-red);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.cap-text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--text-link);
}

.cap-text b {
  color: var(--text-title);
  font-weight: 600;
}

/* ============ 手机外框 ============ */
.phone {
  position: relative;
  width: 180px;
  height: 320px;
  border-radius: 26px;
  background: #1a1a1a;
  padding: 6px;
  box-shadow:
    0 12px 24px rgba(20, 20, 40, 0.16),
    0 2px 6px rgba(20, 20, 40, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.phone-notch {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 8px;
  border-radius: 4px;
  background: #1a1a1a;
  z-index: 4;
}

.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: #ededed;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ============ 顶部状态条 ============ */
.status-bar {
  flex-shrink: 0;
  height: 18px;
  padding: 3px 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ededed;
  font-size: 8px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.2px;
}

.sb-icons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.ic {
  display: inline-block;
  background: #1a1a1a;
}

.ic-signal {
  width: 10px;
  height: 5px;
  clip-path: polygon(0 100%, 15% 100%, 15% 60%, 32% 60%, 32% 100%, 47% 100%, 47% 30%, 64% 30%, 64% 100%, 79% 100%, 79% 0, 100% 0, 100% 100%);
}

.ic-wifi {
  width: 8px;
  height: 6px;
  clip-path: polygon(50% 100%, 40% 88%, 60% 88%, 50% 100%, 25% 65%, 75% 65%, 100% 40%, 50% 0, 0 40%, 25% 65%);
}

.ic-battery {
  width: 14px;
  height: 6px;
  border: 1px solid #1a1a1a;
  border-radius: 1.5px;
  background: linear-gradient(90deg, #1a1a1a 0 70%, transparent 70%);
  position: relative;
}

.ic-battery::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 1px;
  width: 1.5px;
  height: 3px;
  background: #1a1a1a;
  border-radius: 0 1px 1px 0;
}

/* ============ 微信顶部导航 ============ */
.wx-nav {
  flex-shrink: 0;
  height: 30px;
  padding: 0 10px;
  background: #ededed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #dcdcdc;
  position: relative;
}

.wx-nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.3px;
}

.wx-nav-plus,
.wx-nav-back-ico {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1;
  font-weight: 400;
}

.wx-nav-back-ico {
  font-size: 18px;
  margin-top: -2px;
}

.wx-nav-back .wx-nav-title {
  left: 50%;
}

/* ============ 步骤1：聊天列表 ============ */
.wx-chat-list {
  flex: 1;
  background: #fff;
  overflow: hidden;
}

.chat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 0.5px solid #f0f0f0;
  position: relative;
}

.chat-avatar {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  flex-shrink: 0;
}

.chat-lines {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ln-a,
.ln-b {
  height: 5px;
  border-radius: 2px;
  background: #d8d8d8;
  display: block;
}

.ln-a { width: 60%; background: #b8b8b8; }
.ln-b { width: 90%; }

.chat-time {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 7px;
  color: #b2b2b2;
}

/* ============ 底部 Tab 栏 ============ */
.wx-tabbar {
  flex-shrink: 0;
  height: 36px;
  background: #f7f7f7;
  border-top: 0.5px solid #dcdcdc;
  display: flex;
  align-items: stretch;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 7.5px;
  color: #7a7a7a;
  position: relative;
}

.tab.tab-active {
  color: #07c160;
}

.tab-i {
  width: 14px;
  height: 14px;
  display: block;
  background: currentColor;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* 简化图标（无外部资源，纯 CSS shape） */
.tab-wechat {
  clip-path: polygon(50% 0, 90% 25%, 90% 65%, 65% 90%, 35% 90%, 10% 65%, 10% 25%);
  opacity: 0.9;
}

.tab-contacts {
  clip-path: polygon(20% 15%, 80% 15%, 80% 25%, 60% 25%, 60% 40%, 80% 40%, 80% 50%, 60% 50%, 60% 65%, 80% 65%, 80% 75%, 20% 75%);
}

.tab-discover {
  clip-path: circle(45% at 50% 50%);
  position: relative;
}

.tab-me {
  clip-path: polygon(50% 5%, 68% 25%, 62% 45%, 85% 55%, 90% 95%, 10% 95%, 15% 55%, 38% 45%, 32% 25%);
}

/* ============ 步骤2：我 ============ */
.me-profile {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  background: #fff;
  border-bottom: 0.5px solid #ececec;
}

.me-avatar {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  background: linear-gradient(135deg, #f4c27a 0%, #d68d3f 100%);
  flex-shrink: 0;
}

.me-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.me-name {
  height: 8px;
  width: 60%;
  background: #333;
  border-radius: 2px;
}

.me-wxid {
  font-size: 8px;
  color: #999;
}

.me-qr {
  font-size: 12px;
  color: #999;
}

.me-list {
  flex: 1;
  background: #fff;
  margin-top: 6px;
  overflow: hidden;
}

.me-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 0.5px solid #f2f2f2;
  font-size: 10px;
  color: #1a1a1a;
  position: relative;
}

.me-ico {
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
  border-radius: 2px;
}

.ico-service { background: #26a4ff; }
.ico-fav { background: #ffb800; }
.ico-album { background: #ff7043; }
.ico-card { background: #f06292; }
.ico-emoji { background: #ffc107; }

.me-label {
  flex: 1;
}

.me-arrow {
  font-size: 12px;
  color: #c8c8c8;
  line-height: 1;
}

/* ============ 步骤3：服务 ============ */
.svc-scroll {
  flex: 1;
  background: #ededed;
  overflow: hidden;
  padding: 8px 0;
}

.svc-group {
  background: #fff;
  margin-bottom: 6px;
  padding: 8px 6px 10px;
}

.svc-group-title {
  margin: 0 0 6px;
  padding: 0 8px;
  font-size: 8.5px;
  color: #999;
  letter-spacing: 0.3px;
}

.svc-tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px 2px;
  padding: 0 4px;
}

.svc-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  font-size: 7.5px;
  color: #333;
  position: relative;
  border-radius: 4px;
}

.sv {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: #f2f3f5;
  display: block;
  position: relative;
}

.sv::after {
  content: '';
  position: absolute;
  inset: 5px;
  background: currentColor;
  border-radius: 2px;
  color: inherit;
}

.sv-city { color: #4caf50; }
.sv-phone { color: #29b6f6; }
.sv-bill { color: #ffa726; }
.sv-car { color: #7e57c2; }
.sv-wallet { color: #ff7043; }
.sv-loan { color: #ef5350; }
.sv-fund { color: #26a69a; }
.sv-insure { color: #42a5f5; }

.sv::after { background: currentColor; }

/* ============ 步骤4：钱包 ============ */
.wallet-cards {
  flex-shrink: 0;
  padding: 10px 8px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: #ededed;
}

.w-card {
  padding: 8px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #fff;
  min-height: 40px;
  justify-content: space-between;
}

.w-card-balance {
  background: linear-gradient(135deg, #ffb74d 0%, #ff7043 100%);
}

.w-card-bank {
  background: linear-gradient(135deg, #64b5f6 0%, #1976d2 100%);
}

.wc-lbl {
  font-size: 7.5px;
  opacity: 0.9;
}

.wc-num {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.wallet-list {
  flex: 1;
  background: #fff;
  margin: 0 0 0;
  overflow: hidden;
}

.w-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 0.5px solid #f2f2f2;
  font-size: 9.5px;
  color: #1a1a1a;
  position: relative;
}

.w-row span:first-of-type {
  flex: 1;
}

.w-ico {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.ic-bill { background: #ffa726; }
.ic-shield { background: #66bb6a; }
.ic-gear { background: #42a5f5; }
.ic-help { background: #ab47bc; }

/* ============ 步骤5：支付设置 ============ */
.pay-list {
  flex: 1;
  background: #fff;
  overflow: hidden;
  margin-top: 6px;
}

.p-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 0.5px solid #f2f2f2;
  font-size: 10px;
  color: #1a1a1a;
  position: relative;
}

.p-row > span:first-child {
  flex: 1;
}

.p-hint {
  font-size: 8.5px;
  color: #999;
}

.p-hint-red {
  color: var(--brand-red);
  font-weight: 600;
}

.pay-tip {
  margin: 0;
  padding: 8px 12px;
  font-size: 7.5px;
  color: #999;
  background: #fafafa;
  border-top: 0.5px solid #f0f0f0;
  line-height: 1.5;
}

/* ============ 步骤6：自动续费 ============ */
.ar-list {
  flex: 1;
  background: #ededed;
  overflow: hidden;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ar-item {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ar-logo {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
  color: #fff;
  font-size: 8.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}

.ar-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ar-name {
  font-size: 10px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.2px;
}

.ar-desc {
  font-size: 8px;
  color: #999;
}

.ar-detail {
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
}

.ar-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 8px;
  color: #666;
  border-bottom: 0.5px dashed #f0f0f0;
}

.ar-detail-row:last-child {
  border-bottom: none;
}

.ar-detail-row > span:last-child {
  color: #1a1a1a;
  font-size: 8px;
}

.ar-close {
  position: relative;
  height: 32px;
  border-radius: 16px;
  background: #fff;
  color: var(--brand-red);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffd7d7;
}

.ar-confirm {
  margin: 0;
  padding: 0 2px;
  font-size: 7.5px;
  color: #999;
  line-height: 1.5;
  text-align: center;
}

/* ============ 红色高亮：描边环 + 箭头 ============ */
.hl {
  position: relative;
}

.hl-ring {
  position: absolute;
  inset: -3px;
  border: 1.5px solid var(--brand-red);
  border-radius: 8px;
  pointer-events: none;
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.14);
  animation: hl-pulse 1.8s ease-in-out infinite;
  z-index: 5;
}

@keyframes hl-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.14); }
  50% { box-shadow: 0 0 0 5px rgba(255, 65, 65, 0.22); }
}

/* Tab 高亮：更圆润 */
.tab.hl .hl-ring {
  border-radius: 8px;
  inset: -2px -3px;
}

/* 磁贴高亮 */
.hl-ring-tile {
  border-radius: 6px;
  inset: -2px;
}

/* 卡片整体高亮 */
.hl-ring-item {
  border-radius: 10px;
  inset: -2px;
}

/* 关闭按钮高亮 */
.hl-ring-btn {
  border-radius: 20px;
  inset: -3px;
}

/* 红色小箭头：CSS 三角形 + 尾巴 */
.hl-arrow {
  position: absolute;
  top: -12px;
  right: -10px;
  width: 16px;
  height: 16px;
  pointer-events: none;
  z-index: 6;
}

.hl-arrow::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 12px;
  height: 2px;
  background: var(--brand-red);
  transform: rotate(-45deg);
  transform-origin: left center;
  border-radius: 1px;
}

.hl-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 7px solid var(--brand-red);
  transform: rotate(45deg);
}

.hl-arrow-btn {
  top: -10px;
  right: 4px;
}

/* ============ 底部 ============ */
.cdg-footer {
  border-top: 1px solid #f0f0f2;
  padding-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cdg-note {
  margin: 0;
  flex: 1;
  min-width: 260px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.cdg-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 8px;
  background: var(--btn-black);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cdg-btn:hover {
  opacity: 0.88;
}

/* ============ 过渡 ============ */
.cdg-fade-enter-active,
.cdg-fade-leave-active {
  transition: opacity 0.22s ease;
}

.cdg-fade-enter-from,
.cdg-fade-leave-to {
  opacity: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 860px) {
  .cdg-dialog {
    padding: 28px 22px 22px;
    border-radius: 16px;
  }

  .cdg-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 16px;
  }

  .cdg-title {
    font-size: 19px;
  }
}

@media (max-width: 520px) {
  .cdg-mask {
    padding: 16px 10px;
  }

  .cdg-dialog {
    padding: 22px 16px 18px;
    max-height: calc(100vh - 32px);
  }

  .cdg-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .cdg-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .cdg-btn {
    width: 100%;
  }
}
</style>
