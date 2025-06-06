/**
 * 简单的认证检查端点
 * 用于确保token已经准备就绪
 */
export default defineEventHandler(async (event) => {
  // auth中间件会自动处理token获取
  // 这里只需要返回一个简单的响应表示认证成功
  return {
    success: true,
    message: "Auth check passed",
    timestamp: new Date().toISOString(),
  };
});
