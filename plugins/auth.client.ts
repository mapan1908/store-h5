/**
 * 客户端认证插件
 * 在应用启动时自动执行认证和初始化流程
 */

import { AppLaunchManager } from "~/utils/auth/AppLaunchManager";

export default defineNuxtPlugin({
  name: "auth",
  async setup() {
    // 只在客户端执行
    if (!process.client) return;

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

      console.log("=== 认证插件完成 ===");
    } catch (error) {
      console.error("认证插件初始化失败:", error);
    }
  },
});
