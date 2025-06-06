/**
 * 门店初始化相关的composable
 * 确保在获取门店信息前认证已准备就绪
 */
export const useStoreInit = () => {
  const storeInfoStore = useStoreInfoStore();
  const { ensureAuth } = useAuth();

  /**
   * 获取当前门店编号
   */
  const getCurrentStoreId = () => {
    return storeInfoStore.getCurrentStoreId();
  };

  /**
   * 初始化门店信息（在认证准备就绪后）
   */
  const initStore = async (storeId?: string) => {
    try {
      // 先确保认证准备就绪
      const authReady = await ensureAuth();
      if (!authReady) {
        throw new Error("认证失败，无法获取门店信息");
      }

      // 获取门店信息
      const targetStoreId = storeId || getCurrentStoreId();
      await storeInfoStore.fetchStoreInfo(targetStoreId);

      return true;
    } catch (error) {
      console.error("门店初始化失败:", error);
      throw error;
    }
  };

  /**
   * 刷新门店信息
   */
  const refreshStore = async () => {
    try {
      // 确保认证状态
      await ensureAuth();
      // 刷新门店信息
      await storeInfoStore.refreshStoreInfo();
    } catch (error) {
      console.error("门店信息刷新失败:", error);
      throw error;
    }
  };

  /**
   * 设置门店编号（管理员用）
   */
  const setStoreId = async (storeId: string) => {
    try {
      storeInfoStore.setStoreId(storeId);
      await initStore(storeId);
    } catch (error) {
      console.error("设置门店编号失败:", error);
      throw error;
    }
  };

  return {
    getCurrentStoreId,
    initStore,
    refreshStore,
    setStoreId,
  };
};
