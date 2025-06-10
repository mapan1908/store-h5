import { createPersistedState } from "pinia-plugin-persistedstate";

export default defineNuxtPlugin({
  name: "pinia-persist",
  async setup(nuxtApp) {
    // 只在客户端执行
    if (!process.client) return;

    console.log("🔧 [01] 准备初始化 Pinia Persist 插件...");

    // 等待 nextTick 确保 Pinia 实例准备就绪
    await nextTick();

    const pinia = nuxtApp.$pinia as any;
    if (pinia && typeof pinia.use === "function") {
      try {
        // 确保 window 对象存在
        if (typeof window !== "undefined" && window.localStorage) {
          pinia.use(
            createPersistedState({
              storage: window.localStorage,
              debug: process.env.NODE_ENV === "development",
              serializer: {
                serialize: JSON.stringify,
                deserialize: JSON.parse,
              },
              auto: true,
            })
          );
        } else {
          throw new Error("localStorage 不可用");
        }

        console.log("✅ [01] Pinia Persist 插件初始化成功 (同步方式)");

        if (
          process.env.NODE_ENV === "development" &&
          typeof window !== "undefined"
        ) {
          console.log("📦 [01] 检查现有localStorage数据:");
          const keys = ["user-info", "app-state", "cart-data", "store-info"];
          keys.forEach((key) => {
            try {
              const data = localStorage.getItem(key);
              console.log(`- ${key}:`, data ? JSON.parse(data) : null);
            } catch (e) {
              console.log(`- ${key}: 读取失败`, e);
            }
          });
        }
      } catch (error) {
        console.error("❌ [01] Pinia Persist 插件初始化失败:", error);
      }
    } else {
      console.error("❌ [01] Pinia 实例未找到或无效");
    }
  },
});
