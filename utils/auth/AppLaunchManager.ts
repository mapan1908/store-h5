/**
 * 应用启动管理器
 * 统一管理应用的初始化流程，包括门店上下文建立、用户认证、平台检测等
 */

import { StrategyFactory } from "./StrategyFactory";
import { getPlatformDebugInfo } from "~/utils/platform";
import type { PlatformStrategy } from "./PlatformStrategy";
import type { StoreContext } from "~/stores/app";
import { useRoute } from "vue-router";

export class AppLaunchManager {
  private userStore: any;
  private appStore: any;
  private storeInfoStore: any;
  private strategy: PlatformStrategy;

  constructor(userStore: any, appStore: any, storeInfoStore: any) {
    this.userStore = userStore;
    this.appStore = appStore;
    this.storeInfoStore = storeInfoStore;
    this.strategy = StrategyFactory.getCurrentStrategy();

    console.log("=== AppLaunchManager 初始化完成 ===");
    console.log("当前策略:", this.strategy.getPlatformName());
    console.log("平台信息:", getPlatformDebugInfo());
  }

  /**
   * 启动应用
   */
  async launch(): Promise<void> {
    console.log("=== 应用启动流程开始 ===");

    try {
      // 检查是否已经初始化完成
      if (this.appStore.getIsInitialized && this.userStore.isLoggedIn) {
        console.log("应用已初始化且用户已登录，跳过启动流程");
        return;
      }

      // 设置应用平台信息
      this.appStore.setPlatform(this.strategy.getPlatformName());

      // 第一步：解析URL参数并建立门店上下文
      this.appStore.setInitStep("建立门店上下文...");
      const storeContext = this.parseUrlAndSetStoreContext();
      if (!storeContext) {
        throw new Error("门店上下文建立失败");
      }

      // 第二步：处理用户认证
      this.appStore.setInitStep("处理用户认证...");
      const loginSuccess = await this.handleAuthentication(storeContext);
      if (!loginSuccess) {
        // 如果是需要重定向的情况（如微信授权），直接返回
        return;
      }

      // 第三步：初始化门店信息
      this.appStore.setInitStep("加载门店信息...");
      await this.initializeStoreInfo(storeContext);

      // 第四步：完成初始化
      this.appStore.setInitStep("初始化完成");
      this.appStore.setInitialized(true);

      console.log("=== 应用启动流程完成 ===");
      console.log("用户信息:", this.userStore.getUserInfo);
      console.log("门店信息:", this.storeInfoStore.currentStoreInfo);
    } catch (error) {
      console.error("应用启动失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "应用启动失败";

      this.appStore.setInitError(errorMessage);
      this.strategy.showError(errorMessage);
    }
  }

  /**
   * 解析URL参数并建立门店上下文
   */
  private parseUrlAndSetStoreContext(): StoreContext | null {
    try {
      // 优先从路由参数获取 storeCode
      let storeCode = "";

      // 获取当前路由
      const route = useRoute();

      // 如果路由中有 storeCode 参数，优先使用（这是主要来源）
      if (route.params.storeCode) {
        storeCode = route.params.storeCode as string;
        console.log("✅ 从路由参数获取门店编号:", storeCode);
      } else {
        // 如果路由中没有，则尝试从已保存的状态获取
        storeCode = this.appStore.getCurrentStoreCode || "";
        if (storeCode) {
          console.log("📦 从应用状态获取门店编号:", storeCode);
        } else {
          // 最后才尝试从 URL 查询参数获取（向后兼容）
          const urlParams = new URLSearchParams(window.location.search);
          storeCode = urlParams.get("storeCode") || "";
          if (storeCode) {
            console.log("⚠️ 从 URL 查询参数获取门店编号:", storeCode);
          }
        }
      }

      // 如果仍然没有门店编号，使用默认值
      if (!storeCode) {
        storeCode = "TEST001"; // 默认门店编号
        console.log("🔧 使用默认门店编号:", storeCode);
      }

      // 获取其他URL参数（tableId和addressId）
      const urlParams = new URLSearchParams(window.location.search);
      const tableId = urlParams.get("tableId");
      const addressId = urlParams.get("addressId");

      const storeContext: StoreContext = {
        storeCode,
        tableId,
        addressId,
      };

      // 更新应用状态中的门店上下文
      this.appStore.setStoreContext(storeContext);

      console.log("🏪 门店上下文已建立:", storeContext);
      console.log("📍 当前URL路径:", window.location.pathname);
      console.log("🔗 当前查询参数:", window.location.search);

      return storeContext;
    } catch (error) {
      console.error("❌ 解析门店上下文失败:", error);
      return null;
    }
  }

  /**
   * 处理用户认证
   */
  private async handleAuthentication(
    storeContext: StoreContext
  ): Promise<boolean> {
    try {
      // 如果用户已登录，跳过认证
      if (this.userStore.isLoggedIn) {
        console.log("用户已登录，跳过认证");
        return true;
      }

      console.log(`使用 ${this.strategy.getPlatformName()} 策略进行认证`);

      // 执行策略登录
      const loginResult = await this.strategy.login(storeContext);

      if (loginResult.success && loginResult.userInfo) {
        // 登录成功，保存用户信息
        this.userStore.setUserInfo(loginResult.userInfo);
        console.log("用户认证成功:", loginResult.userInfo);
        return true;
      } else if (loginResult.needRedirect) {
        // 需要重定向（如微信授权），等待回调
        console.log("用户认证需要重定向，等待回调...");
        return false;
      } else {
        // 登录失败
        throw new Error(loginResult.error || "用户认证失败");
      }
    } catch (error) {
      console.error("用户认证过程出错:", error);
      throw error;
    }
  }

  /**
   * 初始化门店信息
   */
  private async initializeStoreInfo(storeContext: StoreContext): Promise<void> {
    try {
      // 设置门店编号到门店store
      this.storeInfoStore.setStoreId(storeContext.storeCode);

      // 获取门店信息
      await this.storeInfoStore.fetchStoreInfo(storeContext.storeCode);

      console.log("门店信息初始化完成");
    } catch (error) {
      console.error("门店信息初始化失败:", error);
      // 门店信息获取失败不应该阻止应用启动，只记录错误
      console.warn("门店信息获取失败，但应用继续启动");
    }
  }

  /**
   * 手动执行登录（用于重试或强制登录）
   */
  async performLogin(forceReauth: boolean = false): Promise<boolean> {
    try {
      const storeContext = this.appStore.getStoreContext;

      if (forceReauth) {
        console.log("强制重新认证...");
        this.userStore.clearUserInfo();
        this.appStore.setInitialized(false);
      }

      return await this.handleAuthentication(storeContext);
    } catch (error) {
      console.error("手动登录失败:", error);
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      this.strategy.showError(errorMessage);
      return false;
    }
  }

  /**
   * 获取当前策略
   */
  getCurrentStrategy(): PlatformStrategy {
    return this.strategy;
  }

  /**
   * 重新初始化（用于错误恢复）
   */
  async reinitialize(): Promise<void> {
    console.log("=== 重新初始化应用 ===");

    // 重置状态
    this.appStore.reset();
    this.userStore.clearUserInfo();

    // 重新启动
    await this.launch();
  }
}
