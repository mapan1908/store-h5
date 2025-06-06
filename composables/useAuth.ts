/**
 * Auth相关的composable
 * 简化版本，主要依赖新的认证系统
 */
export const useAuth = () => {
  const userStore = useUserStore();
  const appStore = useAppStore();

  /**
   * 确保认证已经准备就绪
   */
  const ensureAuth = async (): Promise<boolean> => {
    try {
      // 检查用户是否已登录
      if (userStore.isLoggedIn) {
        return true;
      }

      // 如果应用还没有初始化，等待初始化完成
      if (!appStore.getIsInitialized) {
        console.log("等待应用初始化完成...");

        // 等待应用初始化完成（最多等待10秒）
        let attempts = 0;
        const maxAttempts = 50; // 10秒 (50 * 200ms)

        while (!appStore.getIsInitialized && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }

        if (!appStore.getIsInitialized) {
          console.warn("应用初始化超时，但继续执行");
          return false;
        }
      }

      return userStore.isLoggedIn;
    } catch (error: any) {
      console.error("Auth check failed:", error);
      return false;
    }
  };

  /**
   * 获取当前认证状态
   */
  const getAuthStatus = () => {
    return {
      isReady: userStore.isLoggedIn,
      isInitialized: appStore.getIsInitialized,
      error: appStore.initError,
    };
  };

  return {
    isAuthReady: computed(() => userStore.isLoggedIn),
    authError: computed(() => appStore.initError),
    ensureAuth,
    getAuthStatus,
  };
};
