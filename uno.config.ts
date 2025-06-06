import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  // Nuxt H5 项目使用标准预设
  presets: [
    // 使用标准预设，包含所有常用的工具类
    presetUno(),

    // 支持属性化写法，eg: <div bg="red-500" text="white center">
    presetAttributify(),

    // 支持图标，需要搭配图标库，eg: @iconify-json/carbon, 使用 `<div class="i-carbon-sun" />`
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],

  /**
   * 自定义快捷语句
   * @see https://github.com/unocss/unocss#shortcuts
   */
  shortcuts: [
    // 基础布局
    ["center", "flex justify-center items-center"],
    ["flex-center", "flex justify-center items-center"],

    // 只保留必要的快捷方式
    ["wechat-safe-area", "pt-safe pb-safe"],

    // 按钮样式
    [
      "btn-primary",
      "bg-blue-500 text-white px-4 py-2 rounded-lg active:bg-blue-600",
    ],
    [
      "btn-secondary",
      "bg-gray-100 text-gray-700 px-4 py-2 rounded-lg active:bg-gray-200",
    ],
  ],

  transformers: [
    // 启用 @apply 功能
    transformerDirectives(),

    // 启用 () 分组功能
    // 支持css class组合，eg: `<div class="hover:(bg-gray-400 font-medium) font-(light mono)">测试 unocss</div>`
    transformerVariantGroup(),
  ],

  // 微信 H5 专用规则
  rules: [
    // 安全区域适配
    [
      "p-safe",
      {
        padding:
          "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
      },
    ],
    ["pt-safe", { "padding-top": "env(safe-area-inset-top)" }],
    ["pb-safe", { "padding-bottom": "env(safe-area-inset-bottom)" }],
    ["pl-safe", { "padding-left": "env(safe-area-inset-left)" }],
    ["pr-safe", { "padding-right": "env(safe-area-inset-right)" }],

    // 微信兼容的视口高度
    [
      "h-screen-safe",
      {
        height:
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
    ],
    [
      "min-h-screen-safe",
      {
        "min-height":
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
    ],

    // 微信兼容的变换
    [
      "transform-gpu",
      {
        "-webkit-transform": "translateZ(0)",
        transform: "translateZ(0)",
      },
    ],

    // 微信兼容的滚动
    [
      "scroll-touch",
      {
        "-webkit-overflow-scrolling": "touch",
        "overscroll-behavior": "contain",
      },
    ],

    // 文本截断
    [
      "line-clamp-2",
      {
        display: "-webkit-box",
        "-webkit-line-clamp": "2",
        "-webkit-box-orient": "vertical",
        overflow: "hidden",
      },
    ],
  ],

  // 主题配置
  theme: {
    colors: {
      primary: "#007aff",
      success: "#07c160",
      warning: "#ff976a",
      danger: "#ee0a24",
    },
    // 微信安全的字体栈
    fontFamily: {
      sans: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Helvetica Neue",
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei UI",
        "Microsoft YaHei",
        "Arial",
        "sans-serif",
      ],
    },
  },
});

/**
 * 在 Nuxt H5 项目中：
 * mt-4 => margin-top: 1rem == 16px
 * px-4 => padding-left: 1rem; padding-right: 1rem; == 16px
 *
 * 这种配置与 Vant 组件完美兼容，同时提供灵活的工具类支持
 */
