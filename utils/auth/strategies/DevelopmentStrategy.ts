/**
 * 开发环境登录策略
 * 使用固定的openId进行快速登录，方便开发测试
 */

import { isDevelopment } from "~/utils/platform";
import type { PlatformStrategy, LoginResult } from "../PlatformStrategy";
import type { StoreContext } from "~/stores/app";
import type { UserInfo } from "~/stores/user";

export class DevelopmentStrategy implements PlatformStrategy {
  private readonly DEV_OPEN_ID = "857346"; // 固定的开发用openId

  getPlatformName(): string {
    return "开发环境";
  }

  isPlatform(): boolean {
    // 开发环境优先（无论是否在微信中）
    return isDevelopment.value;
  }

  async login(storeContext: StoreContext): Promise<LoginResult> {
    try {
      console.log("=== 开发环境登录策略开始 ===");
      console.log("门店上下文:", storeContext);
      console.log("使用开发用openId:", this.DEV_OPEN_ID);

      // 调用开发环境登录API
      const userInfo = (await $fetch("/api/auth/dev-login", {
        method: "POST",
        body: {
          openId: this.DEV_OPEN_ID,
          storeContext,
        },
      })) as UserInfo;

      console.log("开发环境登录成功:", userInfo);

      return {
        success: true,
        userInfo,
      };
    } catch (error) {
      console.error("开发环境登录失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "开发环境登录失败",
      };
    }
  }

  showError(message: string): void {
    console.error("开发环境错误:", message);

    // 开发环境使用console和alert
    if (typeof window !== "undefined") {
      alert(`开发环境错误: ${message}`);
    }
  }

  navigate(url: string): void {
    console.log("开发环境跳转:", url);
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }
}
