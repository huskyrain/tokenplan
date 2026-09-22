// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import TokenPlanPage from '@/views/TokenPlanPage.vue';
import SubscriptionManagePage from '@/views/SubscriptionManagePage.vue';
import AdminPage from '@/views/AdminPage.vue';
import TokenOrderListPage from '@/views/admin/TokenOrderListPage.vue';
import TokenOrderDetailPage from '@/views/admin/TokenOrderDetailPage.vue';
import AutoRenewManagePage from '@/views/admin/AutoRenewManagePage.vue';

const routes = [
  {
    path: '/',
    name: 'TokenPlan',
    component: TokenPlanPage
  },
  {
    path: '/token-plan',
    name: 'TokenPlanPage',
    component: TokenPlanPage
  },
  {
    path: '/subscription-manage',
    name: 'SubscriptionManage',
    component: SubscriptionManagePage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  },
  {
    path: '/admin/token-orders',
    name: 'AdminTokenOrders',
    component: TokenOrderListPage
  },
  {
    path: '/admin/token-orders/:id',
    name: 'AdminTokenOrderDetail',
    component: TokenOrderDetailPage
  },
  {
    path: '/admin/auto-renew',
    name: 'AdminAutoRenew',
    component: AutoRenewManagePage
  }
  // 可以在这里添加更多路由
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;