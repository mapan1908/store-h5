/**
 * 微信H5登录策略
 * 处理微信公众号授权登录流程
 */

import { isWechatBrowser } from "~/utils/platform";
import type { PlatformStrategy, LoginResult } from "../PlatformStrategy";
import type { StoreContext } from "~/stores/app";
import type { UserInfo } from "~/stores/user";

export class WechatH5Strategy implements PlatformStrategy {
  getPlatformName(): string {
    return "微信H5";
  }

  isPlatform(): boolean {
    return isWechatBrowser.value;
  }

  async login(storeContext: StoreContext): Promise<LoginResult> {
    try {
      console.log("=== 微信H5登录策略开始 ===");
      console.log("门店上下文:", storeContext);

      const urlParams = new URLSearchParams(window.location.search);

      // 检查是否是微信授权回调
      if (this.isWechatCallback(urlParams)) {
        console.log("检测到微信授权回调，正在处理...");
        return await this.handleWechatCallback(urlParams);
      } else {
        console.log("开始微信授权流程...");
        return await this.initiateWechatAuth(storeContext);
      }
    } catch (error) {
      console.error("微信H5登录失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "微信登录失败",
      };
    }
  }

  /**
   * 检查是否是微信授权回调
   */
  private isWechatCallback(urlParams: URLSearchParams): boolean {
    // 检查是否有微信回调的关键参数
    return (
      urlParams.has("token") &&
      urlParams.has("openId") &&
      urlParams.has("userId")
    );
  }

  /**
   * 处理微信授权回调
   */
  private async handleWechatCallback(
    urlParams: URLSearchParams
  ): Promise<LoginResult> {
    try {
      const userInfo: UserInfo = {
        token: urlParams.get("token")!,
        openId: urlParams.get("openId")!,
        userId: parseInt(urlParams.get("userId")!),
        role: urlParams.get("role") || "user",
        name: urlParams.get("name") || "",
        avatarUrl: urlParams.get("avatarUrl") || null,
      };

      console.log("微信授权回调处理成功:", userInfo);

      // 清理URL参数 - 针对微信环境添加延迟
      setTimeout(() => {
        this.cleanupUrl();
      }, 100);

      return {
        success: true,
        userInfo,
      };
    } catch (error) {
      console.error("处理微信授权回调失败:", error);
      return {
        success: false,
        error: "处理微信授权回调失败",
      };
    }
  }

  /**
   * 发起微信授权
   */
  private async initiateWechatAuth(
    storeContext: StoreContext
  ): Promise<LoginResult> {
    try {
      // 构造回调URL (包含门店信息)
      const currentUrl = window.location.href.split("?")[0];
      const storeParams = new URLSearchParams();

      storeParams.set("storeCode", storeContext.storeCode);
      if (storeContext.tableId) {
        storeParams.set("tableId", storeContext.tableId);
      }
      if (storeContext.addressId) {
        storeParams.set("addressId", storeContext.addressId);
      }

      const finalRedirectUri = `${currentUrl}?${storeParams.toString()}`;
      console.log("构造的回调URL:", finalRedirectUri);

      // 通过server API获取微信授权URL，避免客户端直接访问后端
      const response = (await $fetch("/api/auth/wechat-auth-url", {
        method: "POST",
        body: {
          finalRedirectUri,
          storeContext,
        },
      })) as { authUrl: string; storeContext: any };

      const backendLoginUrl = response.authUrl;
      console.log("通过server获取的微信授权URL:", backendLoginUrl);

      // 跳转到后端微信登录
      window.location.href = backendLoginUrl;

      return {
        success: true,
        needRedirect: true,
        redirectUrl: backendLoginUrl,
      };
    } catch (error) {
      console.error("发起微信授权失败:", error);
      return {
        success: false,
        error: "发起微信授权失败",
      };
    }
  }

  /**
   * 清理URL参数
   */
  cleanupUrl(
    currentPath?: string,
    currentQuery?: Record<string, any>,
    paramsToKeep: string[] = []
  ): void {
    try {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);

      console.log("清理前的URL:", url.href);
      console.log("当前URL参数:", Array.from(searchParams.entries()));

      // 只保留我们明确需要的参数，清理所有其他参数
      const keepParams = ["storeCode", "tableId", "addressId", ...paramsToKeep];

      console.log("需要保留的参数:", keepParams);

      // 获取所有当前参数
      const allParams = Array.from(searchParams.keys());
      console.log("当前所有参数:", allParams);

      // 清理不在保留列表中的所有参数
      allParams.forEach((param) => {
        if (!keepParams.includes(param)) {
          console.log(`清理参数: ${param} = ${searchParams.get(param)}`);
          searchParams.delete(param);
        }
      });

      // 构造新的URL
      const newUrl = searchParams.toString()
        ? `${url.pathname}?${searchParams.toString()}`
        : url.pathname;

      console.log("清理后的URL参数:", Array.from(searchParams.entries()));
      console.log("新的URL:", newUrl);

      // 更新URL，不刷新页面
      if (window.history && window.history.replaceState) {
        try {
          // 使用绝对路径，确保兼容性
          const fullNewUrl = window.location.origin + newUrl;
          console.log("准备更新到完整URL:", fullNewUrl);

          window.history.replaceState(null, "", newUrl);
          console.log("✅ 微信H5 URL已清理完成:", newUrl);

          // 验证URL是否真的更新了
          setTimeout(() => {
            console.log("验证：当前浏览器URL:", window.location.href);
            console.log("验证：URL搜索参数:", window.location.search);

            // 如果URL还是没有更新，尝试强制刷新
            if (window.location.search.includes("token")) {
              console.warn("⚠️ URL参数仍未清理，可能是微信环境限制");
              console.log("当前环境 User Agent:", navigator.userAgent);
            }
          }, 500);
        } catch (error) {
          console.error("❌ replaceState 失败:", error);
          // 降级：尝试直接修改location
          try {
            window.location.href = newUrl;
          } catch (fallbackError) {
            console.error("❌ 降级方案也失败:", fallbackError);
          }
        }
      } else {
        console.warn("⚠️ History API 不可用，无法清理URL");
      }
    } catch (error) {
      console.error("❌ 清理URL参数失败:", error);
    }
  }

  /**
   * 显示错误信息
   */
  showError(message: string): void {
    console.error("微信H5错误:", message);

    // 降级使用原生alert（后续可以集成Vant Toast）
    if (typeof window !== "undefined") {
      alert(message);
    }
  }

  /**
   * 页面跳转
   */
  navigate(url: string): void {
    console.log("微信H5环境跳转:", url);
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }
}
