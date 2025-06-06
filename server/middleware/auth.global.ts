import { defineEventHandler, getCookie, setCookie } from "h3";
import { apiFetch } from "~/server/api";
import type { User } from "~/types/api/api";

export default defineEventHandler(async (event) => {
  // 只对特定API请求进行认证检查，避免死循环
  const url = event.node.req.url;

  // 排除不需要认证的API路径
  if (
    !url?.startsWith("/api/") ||
    url.startsWith("/api/auth/") || // 认证相关的API不需要检查
    url.startsWith("/api/_nuxt/")
  ) {
    // Nuxt内部API
    return;
  }

  const token = getCookie(event, "token");

  if (!token) {
    try {
      console.log("服务端中间件：没有 token，正在获取...");
      const openId = "857346"; // TODO: 可从 query、headers 或临时生成
      const res = await apiFetch<User>(event, `/auth/token/${openId}`);
      setCookie(event, "token", res.token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      event.context.user = res;
      console.log("服务端中间件：Token 获取成功");
    } catch (error) {
      console.error("服务端中间件：Token 获取失败:", error);
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication failed",
      });
    }
  } else {
    console.log("服务端中间件：已有 token:", token);
  }
});
