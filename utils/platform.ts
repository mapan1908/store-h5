/**
 * 平台检测工具
 * 用于判断当前运行环境
 */

// 检测是否在客户端
export const isClient = computed(() => process.client);

// 检测是否在服务端
export const isServer = computed(() => process.server);

// 检测是否是微信浏览器
export const isWechatBrowser = computed(() => {
  if (process.server) return false;
  return /MicroMessenger/i.test(navigator.userAgent);
});

// 检测是否是开发环境
export const isDevelopment = computed(() => {
  return process.env.NODE_ENV === "development";
});

// 检测是否是生产环境
export const isProduction = computed(() => {
  return process.env.NODE_ENV === "production";
});

// 检测是否是移动设备
export const isMobile = computed(() => {
  if (process.server) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
});

// 检测是否是iOS设备
export const isIOS = computed(() => {
  if (process.server) return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
});

// 检测是否是Android设备
export const isAndroid = computed(() => {
  if (process.server) return false;
  return /Android/.test(navigator.userAgent);
});

// 获取用户代理字符串
export const getUserAgent = () => {
  if (process.server) return "";
  return navigator.userAgent;
};

// 获取当前平台名称
export const getPlatformName = (): string => {
  if (process.server) return "Server";

  if (isWechatBrowser.value) {
    return "微信H5";
  }

  if (isDevelopment.value) {
    return "开发环境";
  }

  if (isMobile.value) {
    return "移动浏览器";
  }

  return "桌面浏览器";
};

// 平台检测调试信息
export const getPlatformDebugInfo = () => {
  return {
    isClient: isClient.value,
    isServer: isServer.value,
    isWechatBrowser: isWechatBrowser.value,
    isDevelopment: isDevelopment.value,
    isProduction: isProduction.value,
    isMobile: isMobile.value,
    isIOS: isIOS.value,
    isAndroid: isAndroid.value,
    userAgent: getUserAgent(),
    platformName: getPlatformName(),
  };
};
