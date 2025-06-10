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
        :menu="dataMenu || { store_id: 0, categories: [] }"
        :loading="isMenuLoading"
        layout="sidebar"
        class="flex-1 h-full"
      />

      <!-- 开发调试区域 - 可通过 URL 参数 ?debug 显示 -->
      <div v-if="showDebugPanel" class="p-4">
        <!-- 门店操作 -->
        <div class="bg-white rounded-lg p-4 mb-4">
          <h3 class="text-lg font-semibold mb-3">🔧 门店操作</h3>
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
          </div>
        </div>
      </div>

      <!-- 错误提示区域 -->
      <div
        v-if="storeError"
        class="p-6 text-center text-red-500 bg-white rounded-lg shadow mt-6 mx-6"
      >
        <p>{{ storeError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";
import { useStoreInfoStore } from "~/stores/store";
import { useAppStore } from "~/stores/app";
import { useUserStore } from "~/stores/user";
import { useAuth } from "~/composables/useAuth";
import StoreHeader from "~/components/store/StoreHeader.vue";
import ProductSection from "~/components/product/ProductSection.vue";
import type { StoreMenu } from "~/types/api/store-menu";

// 设置页面布局 - 商店页面需要显示底部导航
definePageMeta({
  layout: "with-tabbar",
});

const route = useRoute();
const router = useRouter();
const storeInfoStore = useStoreInfoStore();
const appStore = useAppStore();
const userStore = useUserStore();
const { ensureAuth } = useAuth();
const { logPerformance } = usePerformanceMonitor();

const currentStoreId = computed(() => (route.params.storeCode as string) || "");
const storeError = ref("");
const isStoreOpen = computed(() => storeInfoStore.isStoreOpen);
const showDebugPanel = computed(() => route.query.debug !== undefined);

// 使用 useFetch 获取菜单数据，支持 SSR 和缓存
const {
  data: dataMenu,
  pending: isMenuLoading,
  error: menuError,
  refresh: refreshMenu,
} = await useFetch<StoreMenu>(() => `/api/menu/${currentStoreId.value}`, {
  key: () => `menu-${currentStoreId.value}`,
  server: true,
  default: () => ({ store_id: 0, categories: [] }) as StoreMenu,
  watch: [currentStoreId], // 当门店ID变化时自动重新获取
});

watch(
  () => currentStoreId.value,
  async (newId) => {
    await initStore(newId);
  }
);

async function initStore(storeCode: string) {
  storeError.value = "";
  if (!storeCode) {
    storeError.value = "门店编号不存在";
    return;
  }
  try {
    await storeInfoStore.setStoreId(storeCode);
    await storeInfoStore.fetchStoreInfo(storeCode);
    if (!storeInfoStore.currentStoreInfo) {
      storeError.value = "门店不存在";
      return;
    }
    if (!storeInfoStore.isStoreOpen) {
      storeError.value = "该门店已关闭";
      return;
    }
    // 认证逻辑
    const authed = await ensureAuth();
    if (!authed) {
      storeError.value = "认证失败，请刷新页面或联系客服";
      return;
    }
    // 拉取菜单数据等
    isMenuLoading.value = true;
    try {
      console.log("开始加载菜单数据，门店编码:", storeCode);
      const menuData = await $fetch<StoreMenu>(`/api/menu/${storeCode}`);
      dataMenu.value = menuData;
      console.log("菜单数据加载成功:", menuData);

      // 记录页面加载性能
      await logPerformance({
        storeCode,
        pageType: "store",
      });
    } catch (menuError) {
      console.error("菜单数据加载失败:", menuError);
      // 菜单加载失败不影响主流程，设置为空菜单
      dataMenu.value = { store_id: parseInt(storeCode) || 0, categories: [] };
    } finally {
      isMenuLoading.value = false;
    }
  } catch (err: any) {
    storeError.value = err?.message || "门店初始化失败";
  }
}

onMounted(() => {
  initStore(currentStoreId.value);
});

function handleStoreRefresh() {
  initStore(currentStoreId.value);
}

function handleStoreLoaded(store: any) {
  // 可根据需要处理门店信息加载
}

function handleSwitchStore(storeId: string) {
  router.push({ name: "storeCode", params: { storeCode: storeId } });
}
</script>

<style scoped>
/* 可根据需要补充样式 */
</style>
