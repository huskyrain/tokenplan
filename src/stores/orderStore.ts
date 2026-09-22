// src/stores/orderStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Order } from '@/types/order';
import { getUserOrders } from '@/api/order';

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取用户订单列表
  const fetchUserOrders = async (userId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userOrders = await getUserOrders(userId);
      orders.value = userOrders;
    } catch (err) {
      error.value = (err as Error).message;
      console.error('Error fetching user orders:', err);
    } finally {
      loading.value = false;
    }
  };

  // 添加订单到列表
  const addOrder = (order: Order) => {
    orders.value.push(order);
  };

  // 更新订单状态
  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const index = orders.value.findIndex(order => order.id === orderId);
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...updates };
    }
  };

  // 获取特定状态的订单
  const getOrdersByStatus = (status: Order['status']) => {
    return orders.value.filter(order => order.status === status);
  };

  // 获取排队中的订单
  const queuedOrders = computed(() => {
    return orders.value.filter(order => order.status === 'queue');
  });

  // 获取最近的订单
  const recentOrders = computed(() => {
    return [...orders.value].sort((a, b) => 
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  });

  return {
    orders: computed(() => orders.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    queuedOrders,
    recentOrders,
    fetchUserOrders,
    addOrder,
    updateOrder,
    getOrdersByStatus,
  };
});