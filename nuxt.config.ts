// Nuxt 3 SSR 模式配置 - 发挥真正优势
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: false,

  // 🚀 启用SSR模式 - 这才是Nuxt的核心优势
  ssr: true,

  // 🚀 应用级优化
  app: {
    head: {
      viewport: "width=device-width,initial-scale=1",
      charset: "utf-8",
    },
  },

  // 基础模块
  modules: ["@vant/nuxt", "@unocss/nuxt", "@pinia/nuxt"],

  // 🚀 TypeScript 性能优化
  typescript: {
    typeCheck: false,
  },

  // 🚀 路由规则 - SSR优化
  routeRules: {
    "/": { prerender: true }, // 首页预渲染
    "/api/**": { cors: true }, // API路由CORS
  },

  // 🚀 构建优化
  build: {
    analyze: false,
  },

  // 🚀 Nitro 配置 - SSR模式
  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      routes: ["/"], // 预渲染首页
      crawlLinks: false, // 不自动爬取链接
    },
  },

  // 🚀 Vite 性能优化
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-vendor": ["vue", "vue-router"],
            "vant-vendor": ["vant"],
            "pinia-vendor": ["pinia"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia"],
    },
  },

  // 🚀 实验性优化
  experimental: {
    payloadExtraction: false, // 禁用payload提取，减少请求
  },

  // 简化的 UnoCSS 配置
  unocss: {
    preflight: false,
  },

  // 基础运行时配置
  runtimeConfig: {
    apiBase: "https://api.diantd.com/api",
    public: {},
  },

  // 简化的 Vue 配置
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false,
    },
  },

  // 简化的组件配置
  components: {
    dirs: ["~/components"],
  },
});
