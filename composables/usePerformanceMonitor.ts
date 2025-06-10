interface PerformanceData {
  sessionId?: string;
  userToken?: string;
  storeCode?: string;
  pageUrl: string;
  pageType: "home" | "store" | "order" | "other";
  loadTime: number;
  domReadyTime?: number | null;
  firstPaintTime?: number | null;
  firstContentPaint?: number | null;
  connectionType?: string | null;
  effectiveType?: string | null;
  screenResolution?: string | null;
  viewportSize?: string | null;
}

export const usePerformanceMonitor = () => {
  const route = useRoute();
  const { $pinia } = useNuxtApp();

  // 获取会话ID
  const getSessionId = (): string => {
    let sessionId = "";
    if (process.client) {
      sessionId = sessionStorage.getItem("perf_session_id") || "";
      if (!sessionId) {
        sessionId =
          Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem("perf_session_id", sessionId);
      }
    }
    return sessionId;
  };

  // 获取网络信息
  const getNetworkInfo = () => {
    if (process.client && "connection" in navigator) {
      const connection = (navigator as any).connection;
      return {
        connectionType: connection?.type || null,
        effectiveType: connection?.effectiveType || null,
      };
    }
    return { connectionType: null, effectiveType: null };
  };

  // 获取设备信息
  const getDeviceInfo = () => {
    if (process.client) {
      return {
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      };
    }
    return { screenResolution: null, viewportSize: null };
  };

  // 获取性能指标
  const getPerformanceMetrics = () => {
    if (process.client && "performance" in window) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      const firstPaint = paint.find((p) => p.name === "first-paint")?.startTime;
      const firstContentPaint = paint.find(
        (p) => p.name === "first-contentful-paint"
      )?.startTime;

      return {
        loadTime: navigation
          ? navigation.loadEventEnd - navigation.fetchStart
          : performance.now(),
        domReadyTime: navigation
          ? navigation.domContentLoadedEventEnd - navigation.fetchStart
          : null,
        firstPaintTime: firstPaint || null,
        firstContentPaint: firstContentPaint || null,
      };
    }
    return { loadTime: 0 };
  };

  // 确定页面类型
  const getPageType = (): PerformanceData["pageType"] => {
    const path = route.path;
    if (path === "/") return "home";
    if (path.includes("/order")) return "order";
    if (path.match(/^\/[A-Z0-9]+$/)) return "store";
    return "other";
  };

  // 记录性能数据 - 完全不阻塞主应用
  const logPerformance = async (
    additionalData: Partial<PerformanceData> = {}
  ) => {
    if (!process.client) return;

    // 使用 setTimeout 确保不阻塞主线程
    setTimeout(async () => {
      try {
        // 等待页面完全加载
        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve(void 0);
          } else {
            window.addEventListener("load", () => resolve(void 0), {
              once: true,
            });
          }
        });

        // 额外等待确保所有资源加载完成
        await new Promise((resolve) => setTimeout(resolve, 100));

        const metrics = getPerformanceMetrics();
        const networkInfo = getNetworkInfo();
        const deviceInfo = getDeviceInfo();

        // 获取用户token和门店信息 - 安全获取，避免store未初始化错误
        let userToken: string | undefined;
        let storeCode: string | undefined;

        try {
          const userStore = useUserStore();
          userToken = userStore.getToken || undefined;
        } catch (e) {
          // Store未初始化时忽略
        }

        try {
          const storeInfoStore = useStoreInfoStore();
          storeCode = storeInfoStore.currentStoreId || undefined;
        } catch (e) {
          // Store未初始化时忽略
        }

        const performanceData: PerformanceData = {
          sessionId: getSessionId(),
          userToken,
          storeCode,
          pageUrl: window.location.href,
          pageType: getPageType(),
          ...metrics,
          ...networkInfo,
          ...deviceInfo,
          ...additionalData,
        };

        // 发送性能数据 - 使用 fire-and-forget 模式
        $fetch("/api/performance/log", {
          method: "POST",
          body: performanceData,
        })
          .then(() => {
            console.log("📊 性能数据记录成功");
          })
          .catch((error) => {
            // 静默失败，不影响主应用
            console.warn("⚠️ 性能数据记录失败（不影响主应用）:", error);
          });
      } catch (error) {
        // 完全静默失败，确保不影响主应用
        console.warn("⚠️ 性能监控错误（不影响主应用）:", error);
      }
    }, 0); // 异步执行，不阻塞当前流程
  };

  // 自动监控页面加载性能
  const startMonitoring = () => {
    if (!process.client) return;

    // 页面加载完成后记录性能
    if (document.readyState === "complete") {
      // 延迟记录，确保所有异步操作完成
      setTimeout(() => logPerformance(), 500);
    } else {
      window.addEventListener(
        "load",
        () => {
          setTimeout(() => logPerformance(), 500);
        },
        { once: true }
      );
    }

    // 监听路由变化
    watch(
      () => route.path,
      () => {
        // 路由变化时延迟记录性能
        setTimeout(() => logPerformance(), 1000);
      }
    );
  };

  return {
    logPerformance,
    startMonitoring,
    getPerformanceMetrics,
    getSessionId,
  };
};
