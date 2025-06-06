import { createPersistedState } from "pinia-plugin-persistedstate";

export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端添加 persist 插件
  if (process.client) {
    const pinia = nuxtApp.$pinia as any;
    pinia.use(
      createPersistedState({
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
        debug: true, // 开发环境下启用调试
      })
    );
  }
});
