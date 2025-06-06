/**
 * 平台策略接口
 * 定义不同平台的登录策略
 */

import type { StoreContext } from "~/stores/app";
import type { UserInfo } from "~/stores/user";

export interface LoginResult {
  success: boolean;
  userInfo?: UserInfo;
  needRedirect?: boolean;
  redirectUrl?: string;
  error?: string;
}

export interface PlatformStrategy {
  /**
   * 获取平台名称
   */
  getPlatformName(): string;

  /**
   * 检查是否是当前平台
   */
  isPlatform(): boolean;

  /**
   * 执行登录策略
   * @param storeContext 门店上下文信息
   */
  login(storeContext: StoreContext): Promise<LoginResult>;

  /**
   * 显示错误信息
   * @param message 错误消息
   */
  showError(message: string): void;

  /**
   * 页面跳转（可选）
   * @param url 跳转URL
   */
  navigate?(url: string): void;

  /**
   * 清理URL参数（可选，主要用于H5）
   * @param currentPath 当前路径
   * @param currentQuery 当前查询参数
   * @param paramsToKeep 需要保留的参数
   */
  cleanupUrl?(
    currentPath?: string,
    currentQuery?: Record<string, any>,
    paramsToKeep?: string[]
  ): void;
}
