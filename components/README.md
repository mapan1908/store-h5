# 组件目录结构

本项目采用功能分组的组件组织方式，提高代码的可维护性和可读性。

## 📁 目录结构

```
components/
├── store/          # 门店相关组件
├── product/        # 商品相关组件
├── cart/           # 购物车相关组件
├── layout/         # 布局相关组件
└── index.ts        # 组件统一导出
```

## 🏪 store/ - 门店相关组件

- `StoreHeader.vue` - 门店信息头部组件
  - 显示门店基本信息（名称、营业时间、地址）
  - 商家公告（支持展开/收起）
  - 配送信息展示

## 🛍️ product/ - 商品相关组件

- `ProductSection.vue` - 商品展示主组件
- `ProductItem.vue` - 单个商品项组件
- `ProductList.vue` - 商品列表组件
- `CategorySidebar.vue` - 分类侧边栏组件
- `ItemDetailPopup.vue` - 商品详情弹窗组件

## 🛒 cart/ - 购物车相关组件

- `CartPanel.vue` - 购物车面板组件
- `CartSummary.vue` - 购物车汇总组件

## 📱 layout/ - 布局相关组件

- `SidebarLayout.vue` - 侧边栏布局（适合多分类）
- `TabLayout.vue` - 标签页布局（适合少分类）
- `PlainProductList.vue` - 简单列表布局（适合单分类）

## 🔧 使用方式

### 自动导入（推荐）

Nuxt 3 会自动导入 `components/` 目录下的组件：

```vue
<template>
  <StoreHeader :store-id="storeId" />
  <ProductSection :menu="menu" />
</template>
```

### 手动导入

如果需要手动导入：

```vue
<script setup>
import { StoreHeader, ProductSection } from "~/components";
</script>
```

## 📋 命名规范

- 组件文件名使用 **PascalCase**
- 组件内部 name 属性与文件名保持一致
- 目录名使用 **小写** + **功能描述**

## 🚀 最佳实践

1. **单一职责**：每个组件只负责一个功能
2. **合理分组**：按功能而非技术分组
3. **清晰命名**：组件名能清楚表达其用途
4. **适度抽象**：避免过度抽象，保持组件的可理解性
