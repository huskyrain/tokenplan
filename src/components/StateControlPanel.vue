<!-- src/components/StateControlPanel.vue -->
<!--
  ③ 原型演示状态控制层（脱离页面内容的 fixed 覆盖层）
  - 收起态：屏幕右下角悬浮圆钮「状态控制」
  - 展开态：面板列举全部演示状态，点击即时切换 userStore 场景（含 orderStore / boosterStore 联动刷新）
  - 保持当前路由，面板不关闭以便连续切换；当前态高亮 + 「当前」标记
  - 挂载于 App.vue 全局，与头像下拉切换入口并存互不影响
-->
<template>
  <Teleport to="body">
    <div class="scp-layer">
      <!-- 展开面板 -->
      <Transition name="scp-panel">
        <section
          v-if="open"
          class="scp-panel"
          role="dialog"
          aria-label="原型演示状态控制层"
        >
          <!-- 面板头 -->
          <header class="scp-head">
            <div class="scp-head-left">
              <span class="scp-pulse" aria-hidden="true"></span>
              <div class="scp-head-text">
                <h2 class="scp-title">状态控制</h2>
                <p class="scp-title-en">STATE CONSOLE</p>
              </div>
            </div>
            <button class="scp-x" aria-label="收起状态控制面板" @click="open = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <!-- 说明文字 -->
          <p class="scp-desc">
            原型演示状态控制层：点击切换演示状态，页面即时呈现对应场景
          </p>

          <!-- 状态清单 -->
          <ul class="scp-list">
            <li v-for="(s, i) in STATES" :key="s.scenario" :style="{ animationDelay: i * 34 + 'ms' }">
              <button
                class="scp-item"
                :class="{ on: s.scenario === currentScenario, busy: switching === s.scenario }"
                :disabled="switching !== null"
                :aria-current="s.scenario === currentScenario ? 'true' : undefined"
                @click="applyState(s)"
              >
                <span class="scp-code">{{ s.code }}</span>
                <span class="scp-name">{{ s.name }}</span>
                <span v-if="switching === s.scenario" class="scp-spin" aria-hidden="true"></span>
                <span v-else-if="s.scenario === currentScenario" class="scp-flag">当前</span>
                <span v-else class="scp-go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </button>
            </li>
          </ul>

          <!-- 面板脚：当前登录态回显 -->
          <footer class="scp-foot">
            <span class="scp-foot-k">登录态</span>
            <span class="scp-foot-v">{{ currentLabel }}</span>
          </footer>
        </section>
      </Transition>

      <!-- 收起态悬浮圆钮 -->
      <button
        class="scp-fab"
        :class="{ on: open }"
        :aria-expanded="open"
        aria-label="状态控制"
        title="状态控制"
        @click="open = !open"
      >
        <span class="scp-fab-icon" aria-hidden="true">
          <svg v-if="!open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h10M18 17h2" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="16" cy="17" r="2" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 15l6-6 6 6" />
            <path d="M4 20h16" stroke-width="1.6" />
          </svg>
        </span>
        <span class="scp-fab-text">状态控制</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { UserScenario } from '@/types/plan';
import { useUserStore } from '@/stores/userStore';
import { useOrderStore } from '@/stores/orderStore';
import { useBoosterStore } from '@/stores/boosterStore';
import { useToastStore } from '@/stores/toastStore';

/** 演示状态清单：面板仅收敛保留 A/B/D/F/G 五态（E 一次性月包、C 年包不再列于面板；
 *  scenario 数据与头像下拉循环不受影响，仍为全量七态） */
interface DemoState {
  code: string;
  name: string;
  scenario: UserScenario;
}

const STATES: DemoState[] = [
  { code: 'A', name: '无订阅', scenario: 'no-subscription' },
  { code: 'B', name: '连续包月生效中', scenario: 'monthly-subscribed' },
  { code: 'D', name: '连续包季生效中', scenario: 'quarterly-subscribed' },
  { code: 'F', name: '连续包月已过期', scenario: 'expired-monthly-subscribed' },
  { code: 'G', name: '团队版+标准版空', scenario: 'team-subscribed' }
];

/** 全量状态口径（含面板未列的 E/C）：仅用于面板脚登录态回显，
 *  保证头像下拉循环切到 E/C 时脚部仍显示精确口径 */
const FULL_STATE_LABELS: Record<UserScenario, string> = {
  'no-subscription': 'A · 无订阅',
  'monthly-subscribed': 'B · 连续包月生效中',
  'quarterly-subscribed': 'D · 连续包季生效中',
  'onetime-monthly-subscribed': 'E · 一次性月包生效中',
  'annual-subscribed': 'C · 年包生效中',
  'expired-monthly-subscribed': 'F · 连续包月已过期',
  'team-subscribed': 'G · 团队版+标准版空'
};

const userStore = useUserStore();
const orderStore = useOrderStore();
const boosterStore = useBoosterStore();
const toastStore = useToastStore();

const open = ref(false);
/** 正在切换的目标场景（非空时禁用全部按钮，防连点） */
const switching = ref<UserScenario | null>(null);

const currentScenario = computed<UserScenario | null>(() => userStore.userInfo?.scenario ?? null);

const currentLabel = computed(() => {
  if (!userStore.isLoggedIn) return '未登录（点击任一状态即以该演示用户登录）';
  const sc = currentScenario.value;
  return sc ? FULL_STATE_LABELS[sc] : '已登录';
});

/**
 * 切换演示状态：与头像下拉切换同机制
 * login(内部已 refreshUserState) → orderStore.fetchUserOrders + boosterStore.fetchUserBoosterPacks
 * 不做任何路由跳转，保持当前路由立即呈现对应状态页面；面板保持展开以便连续切换
 */
const applyState = async (s: DemoState) => {
  if (switching.value) return;
  switching.value = s.scenario;
  try {
    await userStore.login(s.scenario);
    const uid = userStore.userInfo?.id;
    if (uid) {
      await Promise.all([
        orderStore.fetchUserOrders(uid),
        boosterStore.fetchUserBoosterPacks(uid)
      ]);
    }
    toastStore.push(`已切换演示状态：${s.code} ${s.name}`, 'success');
  } catch (err) {
    toastStore.push(`切换失败：${(err as Error).message || '未知错误'}`, 'error', 3600);
  } finally {
    switching.value = null;
  }
};

/** Esc 收起面板 */
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) open.value = false;
};

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
/* ---------- 覆盖层容器：不拦截页面交互 ---------- */
.scp-layer {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  pointer-events: none;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
}

.scp-layer > * {
  pointer-events: auto;
}

/* ---------- 收起态悬浮圆钮 ---------- */
.scp-fab {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: radial-gradient(120% 120% at 30% 20%, #23262e 0%, #14161b 62%, #0e1014 100%);
  color: #cfd4de;
  cursor: pointer;
  box-shadow:
    0 12px 30px rgba(10, 12, 18, 0.42),
    0 2px 6px rgba(10, 12, 18, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.09);
  transition: transform 0.24s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.24s ease, color 0.2s ease,
    border-color 0.2s ease;
}

.scp-fab::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(255, 176, 32, 0);
  transition: border-color 0.24s ease;
}

.scp-fab:hover {
  transform: translateY(-2px) scale(1.04);
  color: #ffb020;
  border-color: rgba(255, 176, 32, 0.45);
  box-shadow:
    0 16px 36px rgba(10, 12, 18, 0.5),
    0 0 0 4px rgba(255, 176, 32, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.scp-fab:hover::before {
  border-color: rgba(255, 176, 32, 0.22);
}

.scp-fab:active {
  transform: translateY(0) scale(0.98);
}

.scp-fab.on {
  color: #ffb020;
  border-color: rgba(255, 176, 32, 0.5);
}

.scp-fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.scp-fab-icon svg {
  width: 19px;
  height: 19px;
}

.scp-fab-text {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  line-height: 1;
  white-space: nowrap;
}

/* ---------- 展开面板 ---------- */
.scp-panel {
  position: relative;
  width: 336px;
  max-width: calc(100vw - 44px);
  max-height: min(560px, calc(100vh - 150px));
  overflow: hidden auto;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #15171c;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 92px),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 26px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 26px);
  box-shadow:
    0 24px 60px rgba(8, 10, 15, 0.5),
    0 4px 14px rgba(8, 10, 15, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  padding: 16px 16px 12px;
}

/* 面板头 */
.scp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.scp-head-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.scp-pulse {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #ffb020;
  box-shadow: 0 0 0 0 rgba(255, 176, 32, 0.55);
  animation: scp-pulse 1.9s ease-out infinite;
}

@keyframes scp-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 176, 32, 0.5);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(255, 176, 32, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 176, 32, 0);
  }
}

.scp-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 1.6px;
  color: #f2f4f8;
  line-height: 1.2;
}

.scp-head-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.scp-title-en {
  margin: 2px 0 0;
  font-family: ui-monospace, 'SFMono-Regular', 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 2.2px;
  color: rgba(207, 212, 222, 0.42);
  line-height: 1;
}

.scp-x {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(207, 212, 222, 0.62);
  cursor: pointer;
  transition: color 0.18s, background 0.18s, border-color 0.18s;
}

.scp-x svg {
  width: 13px;
  height: 13px;
}

.scp-x:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 说明文字 */
.scp-desc {
  margin: 12px 0 13px;
  padding: 9px 11px;
  border-left: 2px solid rgba(255, 176, 32, 0.55);
  border-radius: 0 7px 7px 0;
  background: rgba(255, 176, 32, 0.06);
  font-size: 11.5px;
  line-height: 1.65;
  color: rgba(226, 230, 238, 0.72);
}

/* 状态清单 */
.scp-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scp-list li {
  animation: scp-item-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes scp-item-in {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.scp-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.028);
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
}

.scp-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateX(3px);
}

.scp-item:disabled {
  cursor: progress;
  opacity: 0.55;
}

/* 正在切换的目标项：保持高亮不降透 */
.scp-item.busy,
.scp-item.busy:disabled {
  opacity: 1;
  background: rgba(255, 176, 32, 0.09);
  border-color: rgba(255, 176, 32, 0.4);
}

.scp-item.on {
  background: rgba(255, 176, 32, 0.11);
  border-color: rgba(255, 176, 32, 0.48);
}

.scp-item.on:hover:not(:disabled) {
  background: rgba(255, 176, 32, 0.16);
  border-color: rgba(255, 176, 32, 0.62);
}

.scp-item:focus-visible {
  outline: 2px solid rgba(255, 176, 32, 0.7);
  outline-offset: 2px;
}

/* 状态代号 */
.scp-code {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  flex-shrink: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: ui-monospace, 'SFMono-Regular', 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #dfe3ea;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}

.scp-item.on .scp-code {
  background: #ffb020;
  border-color: #ffb020;
  color: #1a1206;
}

.scp-name {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.4;
  color: #b9bec9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scp-item.on .scp-name {
  color: #ffe0aa;
  font-weight: 600;
}

/* 「当前」标记 */
.scp-flag {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(255, 176, 32, 0.16);
  border: 1px solid rgba(255, 176, 32, 0.4);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: #ffc761;
}

.scp-go {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: rgba(207, 212, 222, 0.28);
  transition: color 0.18s, transform 0.18s;
}

.scp-go svg {
  width: 13px;
  height: 13px;
}

.scp-item:hover:not(:disabled) .scp-go {
  color: rgba(255, 176, 32, 0.85);
  transform: translateX(2px);
}

/* 切换中 spinner */
.scp-spin {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.6px solid rgba(255, 176, 32, 0.25);
  border-top-color: #ffb020;
  animation: scp-spin 0.7s linear infinite;
}

@keyframes scp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 面板脚 */
.scp-foot {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.075);
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 10.5px;
  line-height: 1.5;
}

.scp-foot-k {
  flex-shrink: 0;
  font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
  letter-spacing: 1px;
  color: rgba(207, 212, 222, 0.38);
}

.scp-foot-v {
  color: rgba(226, 230, 238, 0.78);
}

/* ---------- 面板过渡 ---------- */
.scp-panel-enter-active {
  transition: opacity 0.24s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.scp-panel-leave-active {
  transition: opacity 0.16s ease, transform 0.18s ease;
}

.scp-panel-enter-from,
.scp-panel-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}

/* ---------- 窄屏适配 ---------- */
@media (max-width: 480px) {
  .scp-layer {
    right: 14px;
    bottom: 14px;
  }

  .scp-panel {
    width: calc(100vw - 28px);
  }
}
</style>
