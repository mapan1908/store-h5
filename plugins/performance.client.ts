export default defineNuxtPlugin(() => {
  // 只在客户端运行
  if (process.client) {
    const { startMonitoring } = usePerformanceMonitor();

    // 等待应用初始化完成后开始监控
    nextTick(() => {
      startMonitoring();
    });

    console.log("�� 性能监控已启用");
  }
});
