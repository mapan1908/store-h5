# SSR 水合错误修复指南

## 问题描述

项目遇到了 Vue 3 + Nuxt.js 的 SSR 水合不匹配错误：

```
Hydration node mismatch:
- rendered on server: <div class="store-header bg-white shadow-sm">
- expected on client: Symbol(v-fgt)
```

## 问题根因

1. **条件渲染差异**：`StoreHeader` 组件在服务端和客户端的渲染状态不同
2. **数据状态不同步**：SSR 时的 `loading` 和 `storeInfo` 状态与客户端初始状态不匹配
3. **Fragment 差异**：Vue 在不同条件下生成了不同的 DOM 结构
4. **浏览器 API 依赖**：购物车组件使用了 `localStorage` 和 `document` API

## 项目中的 SSR 组件分析

### ✅ 正常 SSR 渲染的组件

- **商品展示组件**：`ProductItem`, `ProductList`, `ProductSection`
- **分类组件**：`CategorySidebar`
- **布局组件**：`SidebarLayout`, `TabLayout`, `PlainProductList`
- **页面组件**：`pages/index.vue`
- **骨架屏组件**：各种 Skeleton 组件

### 🔒 需要 ClientOnly 的组件

- **StoreHeader**：状态管理复杂性，已修复 ✅
- **CartPanel**：依赖 localStorage 和 DOM 操作，已修复 ✅
- **CartSummary**：通过 CartPanel 间接保护 ✅

## 解决方案

### 方案一：使用 useFetch 替代 store（推荐，已采用）

**适用场景**：SEO 重要的组件（如 StoreHeader）

```vue
<template>
  <div>
    <StoreHeaderSkeleton v-if="pending || !storeData" />
    <div v-else class="store-header bg-white shadow-sm">
      {{ storeData.name }}
    </div>
  </div>
</template>

<script setup>
// 使用 useFetch 确保 SSR 友好
const {
  data: storeData,
  pending,
  error,
  refresh,
} = await useFetch(`/api/store/${props.storeId}`, {
  key: `store-info-${props.storeId}`,
  server: true, // 确保服务端也执行
  default: () => ({}),
});
</script>
```

### 方案二：使用 ClientOnly 组件（备选）

**适用场景**：依赖浏览器 API 的组件（如购物车）

```vue
<template>
  <ClientOnly>
    <CartPanel v-if="cartStore.totalItemsCount > 0" />
  </ClientOnly>
</template>
```

### 方案三：统一初始状态（备选）

确保服务端和客户端的初始状态一致：

```typescript
// 在 store 中确保初始状态一致
const storeInfoStore = useStoreInfoStore();

// 确保服务端渲染时有默认状态
const initialLoading = process.server ? true : storeInfoStore.loading;
```

### 方案三：延迟挂载（备选）

使用 `mounted` 钩子延迟状态切换：

```vue
<script setup>
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>

<template>
  <div>
    <StoreHeaderSkeleton v-if="!isMounted || loading || !storeInfo" />
    <div v-else class="store-header bg-white shadow-sm">
      <!-- 内容 -->
    </div>
  </div>
</template>
```

## 最佳实践

### 1. 避免条件渲染导致的结构差异

**❌ 错误做法：**

```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else>Content</div>
</template>
```

**✅ 正确做法：**

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>Content</div>
  </div>
</template>
```

### 2. 使用一致的数据获取策略

```typescript
// 在组合式 API 中统一数据获取
const { data, pending } = await useFetch("/api/store-info", {
  key: "store-info",
  server: true, // 确保服务端也执行
});
```

### 3. 合理使用 ClientOnly

**适用场景：**

- 依赖浏览器 API 的组件
- 有复杂交互状态的组件
- 数据获取时机不确定的组件

**注意事项：**

- 会导致首次加载时的布局偏移
- 影响 SEO（fallback 内容会被搜索引擎索引）

### 4. Suspense 组件优化

由于 `<Suspense>` 是实验性功能，建议：

1. 升级到 Vue 3.3+ 以获得更好的 Suspense 支持
2. 使用 Nuxt 3 内置的数据获取方案替代手动 Suspense
3. 考虑使用 `useLazyFetch` 避免阻塞渲染

## 验证修复效果

1. **清除缓存**：`rm -rf .nuxt .output`
2. **重新启动**：`pnpm dev`
3. **检查控制台**：确认没有水合错误
4. **测试页面切换**：确保不同路由间的切换正常

## 监控和调试

### 开发环境检查

```javascript
// 在 nuxt.config.ts 中启用详细的水合检查
export default defineNuxtConfig({
  ssr: true,
  debug: process.env.NODE_ENV === "development",
  vue: {
    config: {
      // 开发环境启用详细警告
      warnOnInvalidHydrateNode: true,
    },
  },
});
```

### 生产环境监控

```javascript
// 添加错误监控
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason.message?.includes("Hydration")) {
    console.error("SSR Hydration Error:", event.reason);
    // 发送到错误监控服务
  }
});
```

## 相关资源

- [Vue 3 SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nuxt 3 渲染模式](https://nuxt.com/docs/guide/concepts/rendering)
- [ClientOnly 组件文档](https://nuxt.com/docs/api/components/client-only)
