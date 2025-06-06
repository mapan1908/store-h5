// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: false, // 关闭调试面板
  modules: [
    "@vant/nuxt",
    "@unocss/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],
  css: ["vant/lib/index.css"],

  // 确保UnoCSS在Vant之后加载，避免样式冲突
  unocss: {
    preflight: false, // 禁用重置样式，避免与Vant冲突
  },

  runtimeConfig: {
    // 只在服务端使用，客户端不可见
    apiBase: "https://api.diantd.com/api",
    public: {
      // 客户端配置项，暂时为空
      // 所有请求都通过server转发，客户端不需要知道真实后端地址
    },
  },
  // 配置 Vue 选项，抑制 Suspense 实验性警告
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false,
    },
  },
  // 抑制实验性功能警告
  experimental: {
    // 如果你不需要实验性功能的警告，可以设置为 true
  },
});
