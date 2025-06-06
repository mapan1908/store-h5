/**
 * 开发环境登录API
 * 使用固定的openId转发到后端获取用户信息
 */

import { apiFetch } from "~/server/api";
import type { UserInfo } from "~/stores/user";

export default defineEventHandler(async (event) => {
  try {
    const { openId, storeContext } = await readBody(event);

    console.log("开发环境登录请求:", { openId, storeContext });

    if (!openId) {
      throw createError({
        statusCode: 400,
        statusMessage: "openId is required",
      });
    }

    // 转发到后端API获取用户信息
    const userData = await apiFetch<UserInfo>(event, `/auth/token/${openId}`, {
      method: "GET",
    });

    console.log("开发环境登录成功:", userData);

    return {
      ...userData,
      openId, // 确保返回openId
    };
  } catch (error: any) {
    console.error("开发环境登录失败:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "开发环境登录失败",
    });
  }
});
