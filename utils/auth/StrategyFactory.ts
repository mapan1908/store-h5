/**
 * 策略工厂
 * 根据当前环境自动选择合适的登录策略
 */

import { WechatH5Strategy } from "./strategies/WechatH5Strategy";
import { DevelopmentStrategy } from "./strategies/DevelopmentStrategy";
import type { PlatformStrategy } from "./PlatformStrategy";

export class StrategyFactory {
  private static strategies: PlatformStrategy[] = [
    new WechatH5Strategy(), // 微信H5策略（提升优先级）
    new DevelopmentStrategy(), // 开发环境策略
  ];

  /**
   * 获取当前平台对应的策略
   * 按顺序检查每个策略，返回第一个匹配的策略
   */
  static getCurrentStrategy(): PlatformStrategy {
    console.log("=== 策略工厂：开始检测平台 ===");

    // 检查是否有强制策略参数
    const forceStrategy = this.getForceStrategy();
    if (forceStrategy) {
      console.log(`使用强制指定策略: ${forceStrategy.getPlatformName()}`);
      return forceStrategy;
    }

    for (const strategy of this.strategies) {
      if (strategy.isPlatform()) {
        console.log(`检测到当前平台策略: ${strategy.getPlatformName()}`);
        return strategy;
      }
    }

    // 如果没有匹配的策略，默认使用开发环境策略
    console.warn("未检测到匹配的平台策略，使用开发环境策略作为默认策略");
    return new DevelopmentStrategy();
  }

  /**
   * 检查是否有强制指定的策略
   * 支持通过URL参数或环境变量强制使用特定策略
   */
  private static getForceStrategy(): PlatformStrategy | null {
    // 只在客户端检查URL参数
    if (typeof window === "undefined") return null;

    const urlParams = new URLSearchParams(window.location.search);
    const forceStrategy =
      urlParams.get("forceStrategy") || urlParams.get("force_strategy");

    // 检查环境变量（开发环境专用）
    const envForceStrategy = process.env.FORCE_AUTH_STRATEGY;

    const strategyName = forceStrategy || envForceStrategy;

    if (strategyName) {
      console.log(`检测到强制策略参数: ${strategyName}`);

      switch (strategyName.toLowerCase()) {
        case "wechat":
        case "wechat_h5":
        case "微信":
          return new WechatH5Strategy();
        case "dev":
        case "development":
        case "开发":
          return new DevelopmentStrategy();
        default:
          console.warn(`未知的强制策略: ${strategyName}`);
          return null;
      }
    }

    return null;
  }

  /**
   * 获取所有可用的策略（用于调试）
   */
  static getAllStrategies(): PlatformStrategy[] {
    return this.strategies;
  }

  /**
   * 手动注册新的策略
   */
  static registerStrategy(strategy: PlatformStrategy): void {
    this.strategies.unshift(strategy); // 新策略插入到前面，优先级更高
    console.log(`新策略已注册: ${strategy.getPlatformName()}`);
  }

  /**
   * 获取策略检测的调试信息
   */
  static getDebugInfo(): Record<string, any> {
    const debugInfo: Record<string, any> = {
      totalStrategies: this.strategies.length,
      strategies: [],
      currentStrategy: null,
    };

    // 检查每个策略的匹配状态
    for (const strategy of this.strategies) {
      const isMatch = strategy.isPlatform();
      debugInfo.strategies.push({
        name: strategy.getPlatformName(),
        isMatch,
      });

      if (isMatch && !debugInfo.currentStrategy) {
        debugInfo.currentStrategy = strategy.getPlatformName();
      }
    }

    return debugInfo;
  }
}
