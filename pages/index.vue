<template>
  <div class="h-screen bg-gray-50 flex flex-col max-w-full overflow-hidden">
    <!-- 门店信息头部 - 占据固定空间 -->
    <div class="flex-shrink-0 relative z-10">
      <StoreHeader
        :store-id="currentStoreId"
        @refresh="handleStoreRefresh"
        @store-loaded="handleStoreLoaded"
      />
    </div>

    <!-- 主要内容区域 - 占据剩余空间 -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- 商品展示区域 -->
      <ProductSection
        :menu="dataMenu || { categories: [] }"
        :loading="isMenuLoading"
        layout="sidebar"
        class="flex-1 h-full"
      />

      <!-- 开发调试区域 - 可通过 URL 参数 ?debug 显示 -->
      <div v-if="showDebugPanel" class="p-4">
        <!-- 门店操作 -->
        <div class="bg-white rounded-lg p-4 mb-4">
          <h3 class="text-lg font-semibold mb-3">🔧 门店操作</h3>

          <!-- 管理员门店设置 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <van-button
              size="small"
              type="primary"
              :disabled="currentStoreId === 'X4Z7VE'"
              @click="handleSwitchStore('X4Z7VE')"
            >
              设置门店 X4Z7VE
            </van-button>
            <van-button
              size="small"
              type="primary"
              :disabled="currentStoreId === 'ABC123'"
              @click="handleSwitchStore('ABC123')"
            >
              设置门店 ABC123
            </van-button>
          </div>

          <!-- 门店状态信息 -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">当前门店ID:</span>
              <span class="font-mono">{{ currentStoreId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">门店状态:</span>
              <van-tag
                :type="isStoreOpen ? 'success' : 'default'"
                :size="'small' as any"
              >
                {{ isStoreOpen ? "营业中" : "休息中" }}
              </van-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">数据来源:</span>
              <van-tag type="primary" :size="'small' as any">
                实时获取
              </van-tag>
            </div>
          </div>
        </div>

        <!-- 购物车测试区域 -->
        <div class="bg-white rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">🛒 购物车测试</h3>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span>购物车商品数量:</span>
              <van-tag type="primary">{{ cartItemsCount }}</van-tag>
            </div>

            <div class="flex justify-between items-center">
              <span>购物车总价:</span>
              <span class="font-semibold text-lg">¥{{ cartTotalPrice }}</span>
            </div>

            <div class="flex gap-2">
              <van-button size="small" type="primary" @click="addTestItem">
                添加测试商品
              </van-button>
              <van-button size="small" type="danger" @click="clearTestCart">
                清空购物车
              </van-button>
              <van-button size="small" type="default" @click="goToDebug">
                系统调试
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";

// 动态设置页面标题
const pageTitle = ref("门店信息管理系统");
useHead({
  title: pageTitle,
});

// Stores
const appStore = useAppStore();
const userStore = useUserStore();
const storeInfoStore = useStoreInfoStore();
const cartStore = useCartStore();

// 使用自动导入的门店管理 composable
const { getCurrentStoreId, refreshStore, initStore } = useStoreInit();

// 门店相关状态
const currentStoreId = ref(getCurrentStoreId());

// 从stores获取数据
const {
  currentStoreInfo,
  isStoreOpen,
  loading: storeLoading,
} = storeToRefs(storeInfoStore);

const { totalItemsCount: cartItemsCount, totalPriceYuan: cartTotalPrice } =
  storeToRefs(cartStore);

// 获取门店信息和菜单数据
const storeCode = getCurrentStoreId();

// 简化的数据获取 - 不使用 await 阻塞渲染
const { data: dataMenu, pending: isMenuLoading } = useFetch<StoreMenu>(
  `/api/menu/${storeCode}`,
  {
    key: `store-menu-${storeCode}`,
  }
);

// 调试面板控制
const showDebugPanel = ref(false);

// 检测是否显示调试面板（仅当URL带debug参数时显示）
onMounted(() => {
  const route = useRoute();
  const hasDebugParam = route.query.debug !== undefined;
  showDebugPanel.value = hasDebugParam;
});

// 门店刷新处理
const handleStoreRefresh = async () => {
  try {
    await refreshStore();
  } catch (error) {
    console.error("门店信息刷新失败:", error);
  }
};

// 处理门店信息加载
const handleStoreLoaded = (store: any) => {
  if (store?.name) {
    pageTitle.value = store.name;
  }
};

// 管理员设置门店编号（开发调试用）
const handleSwitchStore = async (storeId: string) => {
  try {
    const { setStoreId } = useStoreInit();
    await setStoreId(storeId);
    currentStoreId.value = storeId;
    // 切换购物车数据
    cartStore.switchStoreCart(storeId);
  } catch (error) {
    console.error("门店编号设置失败:", error);
  }
};

// 添加测试商品
const addTestItem = () => {
  const testItem = {
    item_id: Math.floor(Math.random() * 1000),
    name: "测试商品",
    category_id: 1,
    item_type: "food",
    unit: "份",
    spec_id: 1,
    spec_name: "标准规格",
    price: 1200, // 12元，单位：分
    original_price: 1500,
    quantity: 1,
  };

  cartStore.addItem(testItem);
  cartStore.saveCartToStorage(); // 手动保存到本地存储
};

// 清空购物车
const clearTestCart = () => {
  cartStore.clearCart();
  cartStore.saveCartToStorage(); // 手动保存到本地存储
};

// 跳转到调试面板
const goToDebug = () => {
  navigateTo("/debug");
};

// 页面标题已通过 StoreHeader 的 store-loaded 事件更新

// 页面加载时初始化
onMounted(() => {
  // 门店信息由 StoreHeader 组件负责加载，这里不重复调用
});
</script>

<style scoped></style>

<style>
/* 移动端优化样式 */
html,
body {
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* 防止整体页面滚动，但允许局部滚动 */
#__nuxt {
  height: 100vh;
  overflow: hidden;
}
</style>
