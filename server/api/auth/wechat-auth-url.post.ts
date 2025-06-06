/**
 * 获取微信授权URL
 * 通过server转发，避免客户端直接访问后端
 */

export default defineEventHandler(async (event) => {
  try {
    const { finalRedirectUri, storeContext } = await readBody(event);

    console.log("获取微信授权URL请求:", { finalRedirectUri, storeContext });

    if (!finalRedirectUri) {
      throw createError({
        statusCode: 400,
        statusMessage: "finalRedirectUri is required",
      });
    }

    // 获取运行时配置中的后端API地址
    const config = useRuntimeConfig();
    const backendApiBase = config.apiBase; // 这个是server端的，已经包含了完整的后端地址

    // 构造微信登录URL - 注意不要重复 /api
    const wechatLoginUrl = `${backendApiBase}/auth/wechat/login?finalRedirectUri=${encodeURIComponent(
      finalRedirectUri
    )}&scope=snsapi_base&originApp=H5A_user`;

    console.log("构造的微信登录URL:", wechatLoginUrl);

    return {
      authUrl: wechatLoginUrl,
      storeContext,
    };
  } catch (error: any) {
    console.error("获取微信授权URL失败:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "获取微信授权URL失败",
    });
  }
});
