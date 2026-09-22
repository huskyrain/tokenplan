<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 导航栏：吸顶毛玻璃（后台管理页自带蓝色顶栏，不叠加主站导航） -->
    <header v-if="!isAdminRoute" class="site-header">
      <div class="header-inner">
        <!-- 左：返回（仅订阅管理路由）+ Logo + Token Plan -->
        <div class="header-left">
          <button v-if="isManageRoute" class="back-btn" title="返回首页" aria-label="返回首页" @click="router.push('/')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <router-link to="/" class="header-logo">
            <span class="logo-mark">联想百应</span>
            <span class="logo-product"><span class="token-red">Token</span>&nbsp;Plan</span>
          </router-link>
        </div>

        <!-- 中：导航 -->
        <nav class="header-nav">
          <router-link to="/" class="nav-link" :class="{ active: isTokenPlanRoute }">Token Plan</router-link>
          <router-link to="/subscription-manage" class="nav-link" :class="{ active: isManageRoute }">
            订阅管理
          </router-link>
          <a href="#" class="nav-link" @click.prevent>文档中心</a>
        </nav>

        <!-- 右：登录 / 个人中心下拉 -->
        <div class="header-actions">
          <template v-if="!userStore.isLoggedIn">
            <button class="btn-login" :disabled="userStore.loading" @click="handleLogin">
              {{ userStore.loading ? '登录中…' : '登录' }}
            </button>
          </template>
          <template v-else>
            <!-- 演示场景切换按钮（保留演示能力） -->
            <button
              class="btn-switch"
              :title="`点击切换为：${nextScenarioLabel}`"
              :disabled="userStore.loading"
              @click="handleSwitch"
            >
              切换为{{ nextScenarioLabel }}
            </button>

            <!-- 头像按钮 + 下拉菜单 -->
            <div class="avatar-wrap" ref="avatarWrap">
              <button class="avatar-btn" @click="dropdownOpen = !dropdownOpen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="avatar-icon">
                  <circle cx="12" cy="12" r="11" />
                  <circle cx="12" cy="9" r="3.5" />
                  <path d="M5.5 20c1.2-3.5 3.8-5 6.5-5s5.3 1.5 6.5 5" stroke-linecap="round" />
                </svg>
              </button>

              <Transition name="dropdown">
                <div v-if="dropdownOpen" class="dropdown-card">
                  <!-- 手机号脱敏 -->
                  <div class="dropdown-item phone-item">
                    {{ maskedPhone }}
                  </div>
                  <div class="dropdown-divider"></div>

                  <!-- 实名认证状态 -->
                  <div class="dropdown-item">
                    <span class="realname-label">实名认证</span>
                    <span class="realname-status" :class="{ verified: isRealNameVerified }">
                      （{{ isRealNameVerified ? '已实名' : '未实名' }}）
                    </span>
                  </div>
                  <div class="dropdown-divider"></div>

                  <!-- 购买记录 -->
                  <div class="dropdown-item clickable" @click="goToPurchaseRecords">
                    购买记录
                  </div>
                  <div class="dropdown-divider"></div>

                  <!-- 后台管理（原型复刻页入口） -->
                  <div class="dropdown-item clickable" @click="goAdmin">
                    后台管理
                  </div>
                  <div class="dropdown-divider"></div>

                  <!-- 退出登录 -->
                  <div class="dropdown-item clickable" @click="handleLogout">
                    退出登录
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="site-main">
      <router-view />
    </main>

    <!-- 购买记录弹层（个人中心下拉入口） -->
    <PurchaseRecordModal v-model:visible="purchaseRecordVisible" />

    <!-- 全局轻提示 -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toastStore.toasts" :key="t.id" class="toast-item" :class="t.type" @click="toastStore.dismiss(t.id)">
        <span class="toast-icon">{{ t.type === 'error' ? '⚠' : t.type === 'success' ? '✓' : 'ℹ' }}</span>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>

    <!-- ③ 原型演示状态控制层：脱离页面内容的 fixed 覆盖层，所有路由可用（与头像下拉切换入口并存） -->
    <StateControlPanel />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToastStore } from '@/stores/toastStore';
import { useOrderStore } from '@/stores/orderStore';
import { useBoosterStore } from '@/stores/boosterStore';
import PurchaseRecordModal from '@/components/PurchaseRecordModal.vue';
import StateControlPanel from '@/components/StateControlPanel.vue';

const userStore = useUserStore();
const toastStore = useToastStore();
const orderStore = useOrderStore();
const boosterStore = useBoosterStore();
const route = useRoute();
const router = useRouter();

const isTokenPlanRoute = computed(() => route.path === '/' || route.path === '/token-plan');
const isManageRoute = computed(() => route.path === '/subscription-manage');
/** 后台管理路由：隐藏主站吸顶导航（页面自带蓝色顶栏） */
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'));

// 下拉菜单
const dropdownOpen = ref(false);
const avatarWrap = ref<HTMLElement | null>(null);

// 切换目标场景的文案（三态循环）
const nextScenarioLabel = computed(() => userStore.nextScenarioLabel);

// 脱敏手机号
const maskedPhone = computed(() => userStore.userInfo?.phone || '');

// 实名认证状态
const isRealNameVerified = computed(() => userStore.userInfo?.realNameVerified ?? false);

// 点击外部关闭下拉菜单
const handleClickOutside = (e: MouseEvent) => {
  if (avatarWrap.value && !avatarWrap.value.contains(e.target as Node)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  userStore.restoreUser();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 模拟登录：默认进入"无订阅用户"场景，便于演示购买流程
const handleLogin = async () => {
  await userStore.login('no-subscription');
  toastStore.push('已模拟登录：无订阅用户（可在右上角切换场景）', 'success');
};

const handleSwitch = async () => {
  const nextLabel = userStore.nextScenarioLabel;
  await userStore.switchScenario();
  // 切换演示用户后联动刷新订单与加速包数据，避免停留订阅管理页时记录表仍为上一个用户的订单
  const uid = userStore.userInfo?.id;
  if (uid) {
    await Promise.all([
      orderStore.fetchUserOrders(uid),
      boosterStore.fetchUserBoosterPacks(uid)
    ]);
  }
  toastStore.push(`已切换为：${nextLabel}`, 'success');
};

const handleLogout = async () => {
  dropdownOpen.value = false;
  await userStore.logout();
  toastStore.push('已退出登录');
};

// 购买记录弹层可见性（登录态下拉入口打开）
const purchaseRecordVisible = ref(false);

// 打开购买记录弹层（不再跳转子页）
const goToPurchaseRecords = () => {
  dropdownOpen.value = false;
  purchaseRecordVisible.value = true;
};

// 跳转后台管理页（原型复刻）
const goAdmin = () => {
  dropdownOpen.value = false;
  router.push('/admin');
};

// 保险：路由变化时关闭下拉菜单
watch(() => route.path, () => {
  dropdownOpen.value = false;
});
</script>

<style scoped>
/* ---------- 吸顶毛玻璃导航 ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(216, 216, 216, 0.6);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Logo */
.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* 订阅管理路由：返回 chevron */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  padding: 0;
}

.back-btn:hover {
  color: var(--brand-red);
  background: rgba(255, 65, 65, 0.08);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--brand-red);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

.logo-product {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-title);
  letter-spacing: 0.5px;
}

.token-red {
  color: var(--brand-red);
}

/* 中部导航 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  position: relative;
  font-size: 15px;
  color: var(--text-title);
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--brand-red);
}

/* Token Plan 激活态：红色 */
.nav-link.active {
  color: var(--brand-red);
  font-weight: 500;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -2px;
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 登录按钮：橙 #FF5E0F */
.btn-login {
  height: 36px;
  padding: 0 22px;
  border: none;
  border-radius: 16px;
  background: var(--brand-orange);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.btn-login:hover {
  opacity: 0.88;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 场景切换按钮 */
.btn-switch {
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid var(--brand-red);
  background: #fff;
  color: var(--brand-red);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.btn-switch:hover {
  background: var(--brand-red);
  color: #fff;
}

/* ---------- 头像按钮 + 下拉菜单 ---------- */
.avatar-wrap {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.avatar-btn:hover {
  background: #e8e8e8;
}

.avatar-icon {
  width: 24px;
  height: 24px;
  color: #333333;
}

/* 下拉卡片 */
.dropdown-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: default;
}

.dropdown-item.clickable {
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item.clickable:hover {
  background: #f5f5f5;
}

.phone-item {
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* 实名认证状态 */
.realname-label {
  color: var(--text-link);
  font-weight: 400;
}

.realname-status {
  font-size: 12px;
}

.realname-status.verified {
  color: #52c41a;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
}

/* 下拉过渡 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ---------- Toast ---------- */
.toast-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 560px;
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(26, 26, 26, 0.92);
  color: #fff;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.toast-item.error {
  background: rgba(255, 65, 65, 0.95);
}

.toast-item.success {
  background: rgba(26, 26, 26, 0.92);
}

.toast-item.success .toast-icon {
  color: #6fe08b;
}

.toast-item .toast-icon {
  flex-shrink: 0;
}

/* toast 过渡 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (max-width: 900px) {
  .header-nav {
    display: none;
  }
}
</style>
