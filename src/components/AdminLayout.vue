<!-- src/components/AdminLayout.vue -->
<!-- 后台共用 chrome：蓝色顶栏 + 左深灰侧栏（菜单组可折叠）+ 主内容 slot
     侧栏组：Token Plan（用户订阅管理/用量明细）+ 订单管理（token订单列表/自动续费管理/门店订单列表置灰）
     高亮由 active prop 驱动，保证各后台页侧栏逻辑自洽 -->
<template>
  <div class="ad-page">
    <!-- 蓝色顶栏 -->
    <header class="ad-topbar">
      <div class="ad-logo">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="#fff" />
          <path d="M20 2a18 18 0 0 0-15.6 27c6-1.5 9.6-6.4 9.6-12.4 0-5.2 2.6-10.6 6-14.6z" fill="#4aa6d8" />
          <path d="M20 38a18 18 0 0 0 15.6-27c-6 1.5-9.6 6.4-9.6 12.4 0 5.2-2.6 10.6-6 14.6z" fill="#4aa6d8" />
        </svg>
        <span>联想百应</span>
      </div>
      <nav class="ad-topnav">
        <a v-for="n in TOP_NAV" :key="n" href="#" :class="{ on: n === topActive }" @click.prevent>{{ n }}</a>
      </nav>
      <div class="ad-topright">
        <span class="ad-user">hewy8</span>
        <button class="ad-acct" @click.prevent>
          账号管理
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>

    <div class="ad-body">
      <!-- 左深灰侧栏 -->
      <aside class="ad-side">
        <div v-for="g in groups" :key="g.title" class="ad-side-group">
          <button class="ad-side-head" @click="g.open = !g.open">
            {{ g.title }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline v-if="g.open" points="18 15 12 9 6 15" />
              <polyline v-else points="6 9 12 15 18 9" />
            </svg>
          </button>
          <template v-if="g.open">
            <template v-for="it in g.items" :key="it.label">
              <router-link v-if="it.to" class="ad-side-item" :class="{ on: active === it.key }" :to="it.to">
                {{ it.label }}
              </router-link>
              <button v-else class="ad-side-item ad-side-disabled" disabled>{{ it.label }}</button>
            </template>
          </template>
        </div>
      </aside>

      <!-- 主内容 -->
      <main class="ad-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

export type AdminMenuKey = 'user-sub' | 'auto-renew' | 'token-orders';

interface SideItem {
  label: string;
  key?: AdminMenuKey;
  to?: string;
}

interface SideGroup {
  title: string;
  open: boolean;
  items: SideItem[];
}

withDefaults(
  defineProps<{
    /** 当前高亮菜单 */
    active: AdminMenuKey;
    /** 顶栏高亮项 */
    topActive?: string;
  }>(),
  { topActive: 'AI智能体' }
);

const TOP_NAV = ['首页', '平台', '商城', 'AI智能体'];

const groups = reactive<SideGroup[]>([
  {
    title: 'Token Plan',
    open: true,
    items: [
      { label: '用户订阅管理', key: 'user-sub', to: '/admin' },
      { label: '用量明细' }
    ]
  },
  {
    title: '订单管理',
    open: true,
    items: [
      { label: 'token订单列表', key: 'token-orders', to: '/admin/token-orders' },
      { label: '自动续费管理', key: 'auto-renew', to: '/admin/auto-renew' },
      { label: '门店订单列表' }
    ]
  }
]);
</script>

<style scoped>
.ad-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
}

/* ---------- 蓝色顶栏 ---------- */
.ad-topbar {
  display: flex;
  align-items: center;
  gap: 40px;
  height: 64px;
  padding: 0 24px;
  background: #4aa6d8;
  color: #fff;
  flex-shrink: 0;
}

.ad-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
}

.ad-logo svg {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.ad-topnav {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.ad-topnav a {
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #fff;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.2s;
}

.ad-topnav a:hover {
  background: rgba(255, 255, 255, 0.14);
}

.ad-topnav a.on {
  background: #5e8ba6;
}

.ad-topright {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
}

.ad-acct {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.ad-acct svg {
  width: 14px;
  height: 14px;
  opacity: 0.85;
}

/* ---------- 主体双栏 ---------- */
.ad-body {
  flex: 1;
  display: flex;
  align-items: stretch;
}

/* 左深灰侧栏：菜单组深灰块 + 下方浅灰延伸 */
.ad-side {
  width: 237px;
  flex-shrink: 0;
  background: #6f747b;
  display: flex;
  flex-direction: column;
}

.ad-side-group {
  background: #474c54;
  padding: 4px 0 8px;
}

.ad-side-group + .ad-side-group {
  margin-top: 12px;
}

.ad-side-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.ad-side-head svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.ad-side-item {
  width: 100%;
  text-align: left;
  padding: 13px 20px 13px 40px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  text-decoration: none;
  display: block;
  box-sizing: border-box;
}

.ad-side-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.ad-side-item.on {
  color: #40a9ff;
}

/* 置灰占位菜单 */
.ad-side-disabled {
  color: rgba(255, 255, 255, 0.35);
  cursor: not-allowed;
}

.ad-side-disabled:hover {
  color: rgba(255, 255, 255, 0.35);
  background: transparent;
}

/* ---------- 主内容 ---------- */
.ad-main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px 48px;
}

/* ---------- 窄屏适配 ---------- */
@media (max-width: 760px) {
  .ad-topnav {
    display: none;
  }

  .ad-side {
    display: none;
  }
}
</style>
