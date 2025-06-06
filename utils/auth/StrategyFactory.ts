/**
 * 策略工厂
 * 根据当前环境自动选择合适的登录策略
 */

import { WechatH5Strategy } from "./strategies/WechatH5Strategy";
import { DevelopmentStrategy } from "./strategies/DevelopmentStrategy";
import type { PlatformStrategy } from "./PlatformStrategy";

export class StrategyFactory {
  private static strategies: PlatformStrategy[] = [
    new DevelopmentStrategy(), // 开发环境策略（开发环境优先）
    new WechatH5Strategy(), // 微信H5策略
  ];

  /**
   * 获取当前平台对应的策略
   * 按顺序检查每个策略，返回第一个匹配的策略
   */
  static getCurrentStrategy(): PlatformStrategy {
    console.log("=== 策略工厂：开始检测平台 ===");

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
