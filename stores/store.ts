import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  StoreInfo,
  StoreInfoWithConfig,
  StoreInfoResponse,
} from "~/types/api/store";

export const useStoreInfoStore = defineStore(
  "storeInfo",
  () => {
    // 状态 - 只缓存门店编号，门店信息实时获取
    const currentStoreId = ref<string>("TEST001"); // 默认门店编号
    const currentStoreInfo = ref<StoreInfo | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 计算属性
    const isStoreOpen = computed(() => {
      return currentStoreInfo.value?.status === "open";
    });

    const storeAddress = computed(() => {
      return currentStoreInfo.value?.address || "暂无地址信息";
    });

    const businessHours = computed(() => {
      const hours = currentStoreInfo.value?.business_hours?.[0];
      if (!hours) return "营业时间未设置";
      return `${hours.start} - ${hours.end}`;
    });

    // 获取门店信息（实时获取，不缓存）
    const fetchStoreInfo = async (storeId?: string) => {
      const targetStoreId = storeId || currentStoreId.value;

      loading.value = true;
      error.value = null;

      try {
        const response = await $fetch<StoreInfoWithConfig>(
          `/api/store/${targetStoreId}/info`
        );

        currentStoreInfo.value = response;
        return response;
      } catch (err: any) {
        error.value = err.message || "获取门店信息失败";
        console.error("获取门店信息错误:", err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    // 刷新门店信息
    const refreshStoreInfo = () => {
      return fetchStoreInfo(currentStoreId.value);
    };

    // 获取当前门店编号
    const getCurrentStoreId = () => {
      return currentStoreId.value;
    };

    // 设置门店编号（仅限管理员使用）
    const setStoreId = (storeId: string) => {
      currentStoreId.value = storeId;
      currentStoreInfo.value = null; // 清除旧信息
    };

    // 清除门店信息
    const clearStoreInfo = () => {
      currentStoreInfo.value = null;
      error.value = null;
    };

    return {
      // 状态
      currentStoreId,
      currentStoreInfo,
      loading,
      error,

      // 计算属性
      isStoreOpen,
      storeAddress,
      businessHours,

      // 方法
      fetchStoreInfo,
      refreshStoreInfo,
      getCurrentStoreId,
      setStoreId,
      clearStoreInfo,
    };
  },
  {
    persist: {
      key: "store-info",
      // 只持久化门店编号
      pick: ["currentStoreId"],
    },
  }
);
