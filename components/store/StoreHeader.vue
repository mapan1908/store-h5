<template>
  <div>
    <!-- 骨架屏状态 -->
    <StoreHeaderSkeleton v-if="pending || !storeData" />

    <!-- 正常内容 -->
    <div
      v-else
      class="bg-white shadow-sm max-w-full overflow-x-hidden relative z-1"
    >
      <!-- 商家基本信息头部 -->
      <div class="px-4 py-3 pb-0">
        <!-- 顶部区域：Logo + 基本信息 -->
        <div class="flex items-start mb-1">
          <!-- 商家Logo -->
          <div class="w-16 h-16 rounded-lg mr-3 bg-gray-100 flex-shrink-0">
            <img
              v-if="storeData.logo_url"
              :src="storeData.logo_url"
              class="w-16 h-16 object-cover rounded-lg"
              alt="商家Logo"
            />
            <div v-else class="w-full h-full center text-gray-400">
              <van-icon name="shop-o" size="32px" />
            </div>
          </div>

          <!-- 商家基本信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-bold truncate mr-2">
                {{ storeData.name }}
              </h2>
              <van-tag
                :type="storeData.status === 'open' ? 'success' : 'default'"
                :size="'small' as any"
              >
                {{ storeData.status === "open" ? "营业中" : "休息中" }}
              </van-tag>
            </div>

            <!-- 营业时间 -->
            <div class="flex items-center text-sm text-gray-500 mb-1">
              <van-icon name="clock-o" size="14px" class="mr-1" />
              <span>{{ formatBusinessHours(storeData) }}</span>
            </div>

            <!-- 地址信息 -->
            <div class="flex items-start text-sm text-gray-500">
              <van-icon
                name="location-o"
                size="14px"
                class="mr-1 flex-shrink-0 mt-0.5"
              />
              <span class="line-clamp-2 overflow-hidden">{{
                formatStoreAddress(storeData)
              }}</span>
            </div>
          </div>
        </div>
        <!-- 配送信息 -->
        <div
          v-if="storeData.config && Array.isArray(storeData.config)"
          class="flex items-center text-xs text-gray-500 space-x-4 py-3"
        >
          <div class="flex items-center">
            <van-icon name="send-gift-o" size="12px" class="mr-1" />
            <span>配送费 ¥{{ deliveryFee }}</span>
          </div>
          <div class="flex items-center">
            <van-icon name="shop-collect-o" size="12px" class="mr-1" />
            <span>包装费 ¥{{ packagingFee }}</span>
          </div>
          <div class="flex items-center">
            <van-icon name="clock-o" size="12px" class="mr-1" />
            <span>{{ deliveryTime }}</span>
          </div>
        </div>
      </div>
      <!-- 商家公告 - 使用 Vant NoticeBar 组件，支持展开/收起 -->
      <van-notice-bar
        v-if="storeData.description"
        left-icon="volume-o"
        :text="storeData.description"
        :scrollable="!isNoticeExpanded"
        :wrapable="isNoticeExpanded"
        mode="link"
        @click="toggleNoticeExpand"
        class="mb-1"
      />

      <!-- 错误状态 -->
      <div v-if="error && !pending" class="p-4 text-center">
        <van-empty image="error" :description="error.message || '加载失败'">
          <van-button type="primary" size="small" @click="handleRefresh">
            重新加载
          </van-button>
        </van-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StoreHeaderSkeleton from "./StoreHeaderSkeleton.vue";
import type { StoreInfoWithConfig } from "~/types/api/store";

interface Props {
  storeId?: string;
  showRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRefresh: true,
});

const emit = defineEmits<{
  refresh: [];
  storeLoaded: [store: StoreInfoWithConfig];
}>();

// 公告展开状态
const isNoticeExpanded = ref(false);

// 切换公告展开状态
const toggleNoticeExpand = () => {
  isNoticeExpanded.value = !isNoticeExpanded.value;
};

// 使用 useFetch 获取门店信息，确保 SSR 友好
const {
  data: storeData,
  pending,
  error,
  refresh,
} = await useFetch<StoreInfoWithConfig>(`/api/store/${props.storeId}/info`, {
  key: `store-info-${props.storeId}`,
  server: true, // 确保服务端渲染时也执行
  default: () => ({}) as StoreInfoWithConfig,
});

// 格式化营业时间 - 与 stores/store.ts 中的逻辑保持一致
const formatBusinessHours = (store: StoreInfoWithConfig) => {
  if (!store || !store.business_hours || !Array.isArray(store.business_hours)) {
    return "营业时间待定";
  }
  const hours = store.business_hours[0];
  if (!hours) return "营业时间未设置";
  return `${hours.start} - ${hours.end}`;
};

// 格式化门店地址 - 与 stores/store.ts 中的逻辑保持一致
const formatStoreAddress = (store: StoreInfoWithConfig) => {
  if (!store) return "";
  const parts = [
    store.province,
    store.city,
    store.district,
    store.address,
  ].filter(Boolean);
  return parts.join(" ");
};

// 获取配送费（取delivery类型的配置）
const deliveryFee = computed(() => {
  if (!storeData.value?.config || !Array.isArray(storeData.value.config))
    return 0;
  const deliveryConfig = storeData.value.config.find(
    (item: any) => item.order_type === "delivery"
  );
  return deliveryConfig ? deliveryConfig.delivery_fee / 100 : 0; // 转换为元
});

// 获取包装费（取第一个配置的包装费）
const packagingFee = computed(() => {
  if (!storeData.value?.config || !Array.isArray(storeData.value.config))
    return 0;
  const config = storeData.value.config[0];
  return config ? config.packaging_fee / 100 : 0; // 转换为元
});

// 获取配送时间
const deliveryTime = computed(() => {
  if (!storeData.value?.config || !Array.isArray(storeData.value.config))
    return "预计30分钟";
  const deliveryConfig = storeData.value.config.find(
    (item: any) => item.order_type === "delivery"
  );
  if (deliveryConfig && deliveryConfig.enabled) {
    const hours = deliveryConfig.service_hours?.[0];
    if (hours) {
      return `${hours.start}-${hours.end}`;
    }
  }
  return "预计30分钟";
});

// 处理刷新
const handleRefresh = async () => {
  await refresh();
  emit("refresh");
};

// 监听门店数据变化，传递给父组件
watch(
  storeData,
  (newStore) => {
    if (newStore && newStore.name) {
      emit("storeLoaded", newStore);
    }
  },
  { immediate: true }
);
</script>
