import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface StoreContext {
  storeCode: string;
  tableId: string | null;
  addressId: string | null;
}

export const useAppStore = defineStore(
  "app",
  () => {
    // === 应用初始化状态 ===
    const isInitialized = ref(false);
    const initStep = ref("准备中...");
    const initError = ref<string | null>(null);

    // === 门店上下文信息 ===
    const storeContext = ref<StoreContext>({
      storeCode: "TEST001", // 默认门店编号
      tableId: null,
      addressId: null,
    });

    // === 应用配置 ===
    const homePage = ref("/"); // 默认首页
    const platform = ref(""); // 当前平台 (微信H5/开发环境/浏览器)

    // === 全局加载状态 ===
    const globalLoading = ref(false);
    const globalLoadingText = ref("加载中...");

    // === 全局错误状态 ===
    const globalError = ref<string | null>(null);

    // === 计算属性 ===
    const getIsInitialized = computed(() => isInitialized.value);
    const getStoreContext = computed(() => storeContext.value);
    const getCurrentStoreCode = computed(() => storeContext.value.storeCode);
    const getHomePage = computed(() => homePage.value);
    const getPlatform = computed(() => platform.value);

    // === 方法 ===
    const setInitialized = (state: boolean) => {
      isInitialized.value = state;
      if (state) {
        initError.value = null;
        initStep.value = "初始化完成";
      }
    };

    const setInitStep = (step: string) => {
      initStep.value = step;
    };

    const setInitError = (error: string | null) => {
      initError.value = error;
      if (error) {
        isInitialized.value = false;
      }
    };

    const setStoreContext = (context: Partial<StoreContext>) => {
      storeContext.value = { ...storeContext.value, ...context };
      console.log("门店上下文已更新:", storeContext.value);
    };

    const setStoreCode = (code: string) => {
      storeContext.value.storeCode = code;
      console.log("门店编号已设置:", code);
    };

    const setHomePage = (page: string) => {
      homePage.value = page;
      console.log("首页路径已设置:", page);
    };

    const setPlatform = (platformName: string) => {
      platform.value = platformName;
      console.log("平台已设置:", platformName);
    };

    const setGlobalLoading = (loading: boolean, text?: string) => {
      globalLoading.value = loading;
      if (text) {
        globalLoadingText.value = text;
      }
    };

    const setGlobalError = (error: string | null) => {
      globalError.value = error;
    };

    const clearGlobalError = () => {
      globalError.value = null;
    };

    const reset = () => {
      isInitialized.value = false;
      initStep.value = "准备中...";
      initError.value = null;
      globalLoading.value = false;
      globalError.value = null;
      console.log("应用状态已重置");
    };

    return {
      // 状态
      isInitialized,
      initStep,
      initError,
      storeContext,
      homePage,
      platform,
      globalLoading,
      globalLoadingText,
      globalError,

      // 计算属性
      getIsInitialized,
      getStoreContext,
      getCurrentStoreCode,
      getHomePage,
      getPlatform,

      // 方法
      setInitialized,
      setInitStep,
      setInitError,
      setStoreContext,
      setStoreCode,
      setHomePage,
      setPlatform,
      setGlobalLoading,
      setGlobalError,
      clearGlobalError,
      reset,
    };
  },
  {
    persist: {
      key: "app-state",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // 持久化门店上下文、首页配置和初始化状态
      pick: ["storeContext", "homePage", "isInitialized"],
      debug: true,
    },
  }
);
