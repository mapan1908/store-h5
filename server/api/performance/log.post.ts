import { savePerformanceLog } from "~/server/utils/database";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const userAgent = getHeader(event, "user-agent") || "";

    // 验证必需的字段
    if (!body.pageUrl || !body.pageType || typeof body.loadTime !== "number") {
      return {
        success: false,
        message: "缺少必需的性能数据字段",
      };
    }

    // 构造性能日志数据
    const performanceData = {
      session_id: body.sessionId || generateSessionId(),
      user_token: body.userToken || null,
      store_code: body.storeCode || null,
      page_url: body.pageUrl,
      page_type: body.pageType,
      load_time: body.loadTime,
      dom_ready_time: body.domReadyTime || null,
      first_paint_time: body.firstPaintTime || null,
      first_content_paint: body.firstContentPaint || null,
      connection_type: body.connectionType || null,
      effective_type: body.effectiveType || null,
      user_agent: userAgent,
      screen_resolution: body.screenResolution || null,
      viewport_size: body.viewportSize || null,
    };

    // 异步保存到MySQL数据库，不阻塞响应
    setImmediate(async () => {
      try {
        const saved = await savePerformanceLog(performanceData);
        if (saved) {
          console.log("📊 性能数据保存成功:", {
            pageType: performanceData.page_type,
            storeCode: performanceData.store_code,
            loadTime: performanceData.load_time,
          });
        }
      } catch (dbError) {
        // 数据库错误不影响主应用
        console.warn("⚠️ 性能数据保存失败，但不影响主应用:", dbError);
      }
    });

    // 立即返回成功响应，不等待数据库操作
    return {
      success: true,
      message: "性能数据已接收",
    };
  } catch (error: any) {
    // 任何错误都不应该影响主应用
    console.warn("⚠️ 性能监控API错误，但不影响主应用:", error);

    return {
      success: false,
      message: "性能数据接收失败，但不影响主应用",
    };
  }
});

// 生成会话ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
