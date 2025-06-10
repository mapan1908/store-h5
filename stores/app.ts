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

    /**
     * 开发环境调试：切换认证策略
     * @param strategy 策略名称: "wechat" | "dev"
     */
    const switchAuthStrategy = (strategy: "wechat" | "dev") => {
      if (process.env.NODE_ENV !== "development") {
        console.warn("切换认证策略仅在开发环境可用");
        return;
      }

      const currentUrl = new URL(window.location.href);

      if (strategy === "wechat") {
        currentUrl.searchParams.set("forceStrategy", "wechat");
        console.log("🔄 切换到微信H5认证策略，重新加载页面...");
      } else {
        currentUrl.searchParams.delete("forceStrategy");
        currentUrl.searchParams.delete("force_strategy");
        console.log("🔄 切换到开发环境认证策略，重新加载页面...");
      }

      // 重置认证状态
      reset();

      // 重新加载页面以应用新策略
      setTimeout(() => {
        window.location.href = currentUrl.toString();
      }, 100);
    };

    /**
     * 开发环境调试：获取当前认证策略信息
     */
    const getAuthDebugInfo = () => {
      if (process.env.NODE_ENV !== "development") {
        console.warn("认证调试信息仅在开发环境可用");
        return null;
      }

      const urlParams = new URLSearchParams(window.location.search);
      return {
        currentStrategy: platform.value,
        forceStrategy:
          urlParams.get("forceStrategy") || urlParams.get("force_strategy"),
        isInitialized: isInitialized.value,
        userLoggedIn: "请检查userStore.isLoggedIn",
        url: window.location.href,
        availableStrategies: ["wechat", "dev"],
      };
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

      // 开发环境调试方法
      switchAuthStrategy,
      getAuthDebugInfo,
    };
  },
  {
    persist: {
      key: "app-state",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // 持久化门店上下文、首页配置、平台信息
      pick: ["storeContext", "homePage", "platform"],
      debug: process.env.NODE_ENV === "development",
    },
  }
);
