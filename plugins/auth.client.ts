/**
 * 客户端认证插件
 * 在应用启动时自动执行认证和初始化流程
 */

import { AppLaunchManager } from "~/utils/auth/AppLaunchManager";

export default defineNuxtPlugin(async (nuxtApp) => {
  // 只在客户端执行
  if (process.server) return;

  console.log("=== 认证插件启动 ===");

  try {
    // 获取状态管理stores
    const userStore = useUserStore();
    const appStore = useAppStore();
    const storeInfoStore = useStoreInfoStore();

    // 创建启动管理器
    const launchManager = new AppLaunchManager(
      userStore,
      appStore,
      storeInfoStore
    );

    // 执行应用启动流程
    await launchManager.launch();

    // 将启动管理器挂载到全局，方便调试和手动操作
    if (process.env.NODE_ENV === "development") {
      // @ts-ignore
      window.__launchManager = launchManager;
      console.log("启动管理器已挂载到 window.__launchManager (仅开发环境)");
    }

    console.log("=== 认证插件完成 ===");
  } catch (error) {
    console.error("认证插件执行失败:", error);

    // 显示错误信息
    if (typeof window !== "undefined") {
      console.error("应用启动失败，请刷新页面重试");
    }
  }
});
