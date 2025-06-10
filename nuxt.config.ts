// Nuxt 3 SSR 模式配置 - 发挥真正优势
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: false,

  // 🚀 开发服务器配置
  devServer: {
    host: '0.0.0.0',
    port: 9000
  },

  // 🚀 启用SSR模式 - 这才是Nuxt的核心优势
  ssr: true,

  // 🚀 应用级优化
  app: {
    head: {
      viewport: "width=device-width,initial-scale=1",
      charset: "utf-8",
    },
    // 修复静态资源路径配置
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
    cdnURL: process.env.NODE_ENV === "production" ? undefined : undefined,
  },

  alias: {
    "#head": "@unhead/vue",
  },

  // 基础模块
  modules: ["@vant/nuxt", "@unocss/nuxt", "@pinia/nuxt"],

  // 🚀 Pinia 配置
  pinia: {
    storesDirs: ["./stores/**"],
  },

  // 🚀 TypeScript 性能优化
  typescript: {
    typeCheck: false,
  },

  // 🚀 路由规则 - SSR优化
  routeRules: {
    "/": { prerender: true }, // 首页预渲染
    "/:storeCode": { swr: 60 }, // 门店页面服务端渲染，缓存60秒
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
    // 修复静态资源配置
    publicAssets: [
      {
        dir: "public",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    ],
    // 确保正确的静态文件处理
    storage: {
      redis: {
        driver: "memory",
      },
    },
    // 移除实验性配置，避免构建问题
    experimental: {
      wasm: false,
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
    // 修复开发/生产环境路径问题
    server: {
      fs: {
        strict: false,
      },
    },
    // 确保生产环境下的正确配置
    define: {
      __NUXT_DEV__: process.env.NODE_ENV === "development",
    },
  },

  // 🚀 实验性优化
  experimental: {
    // 完全禁用payload提取以避免构建ID不匹配
    payloadExtraction: false,
    // 在生产环境中使用更稳定的构建策略
    writeEarlyHints: false,
  },

  // 简化的 UnoCSS 配置
  unocss: {
    preflight: false,
  },

  // 🚀 运行时配置 - 支持环境变量
  runtimeConfig: {
    // 私有环境变量 (仅服务端可用)
    apiBase: process.env.NUXT_API_BASE,
    databaseUrl: process.env.DATABASE_URL,

    // 公共环境变量 (客户端+服务端都可用)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    },
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
