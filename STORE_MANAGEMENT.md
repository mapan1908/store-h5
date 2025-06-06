# 门店信息管理方案

本方案实现了完整的门店信息管理系统，包括门店信息获取、缓存、显示和购物车按门店持久化。

## 📋 功能特性

### 1. 门店信息管理

- ✅ 门店信息API请求和缓存 (15分钟缓存时间)
- ✅ 自动持久化到 `localStorage`
- ✅ 门店状态监控 (营业中/休息中)
- ✅ 门店信息实时更新

### 2. 购物车按门店持久化

- ✅ 不同门店的购物车数据独立存储
- ✅ 门店切换时自动切换购物车数据
- ✅ 手动保存机制确保数据安全

### 3. 门店信息显示组件

- ✅ 美观的门店信息展示
- ✅ 骨架屏加载状态
- ✅ 错误状态处理
- ✅ 支持刷新操作

## 🏗 架构组成

### 1. Pinia Store (`stores/store.ts`)

```typescript
const storeInfoStore = useStoreInfoStore();
const {
  currentStoreInfo, // 当前门店信息
  loading, // 加载状态
  error, // 错误信息
  isStoreOpen, // 门店是否营业
  businessHours, // 营业时间
  storeAddress, // 门店地址
} = storeToRefs(storeInfoStore);
```

**主要方法:**

- `fetchStoreInfo(storeId, forceRefresh)` - 获取门店信息
- `clearStoreInfo()` - 清除门店信息
- `updateStoreStatus(status)` - 更新门店状态

### 2. 门店初始化 (`composables/useStoreInit.ts`)

```typescript
const {
  initStoreInfo, // 初始化门店信息
  switchStore, // 切换门店
  getCurrentStoreId, // 获取当前门店ID
  parseStoreIdFromUrl, // 从URL解析门店ID (未来扩展)
} = useStoreInit();
```

### 3. 门店信息组件 (`components/StoreHeader.vue`)

```vue
<StoreHeader :store-id="currentStoreId" @refresh="handleStoreRefresh" />
```

**组件特性:**

- 响应式门店信息显示
- 自动加载和缓存
- 美观的UI设计 (基于 Vant)
- 支持刷新操作

### 4. 购物车改进 (`stores/cart.ts`)

**新增方法:**

- `switchStoreCart(storeId)` - 切换门店购物车
- `saveCartToStorage()` - 手动保存购物车数据

## 🚀 使用方法

### 1. 基本使用

```vue
<template>
  <div>
    <!-- 门店信息头部 -->
    <StoreHeader :store-id="currentStoreId" @refresh="handleRefresh" />

    <!-- 其他内容 -->
  </div>
</template>

<script setup>
// 使用门店信息
const storeInfoStore = useStoreInfoStore();
const { currentStoreInfo, isStoreOpen } = storeToRefs(storeInfoStore);

// 使用门店初始化
const { getCurrentStoreId } = useStoreInit();
const currentStoreId = ref(getCurrentStoreId());
</script>
```

### 2. 门店切换

```typescript
const { switchStore } = useStoreInit();
const cartStore = useCartStore();

const handleSwitchStore = async (newStoreId: string) => {
  try {
    // 切换门店信息
    const success = await switchStore(newStoreId);

    if (success) {
      // 切换购物车数据
      cartStore.switchStoreCart(newStoreId);
      console.log("门店切换成功");
    }
  } catch (error) {
    console.error("门店切换失败:", error);
  }
};
```

### 3. 购物车操作 (按门店持久化)

```typescript
const cartStore = useCartStore();

// 添加商品 (会自动关联当前门店)
cartStore.addItem(itemData);

// 手动保存到对应门店的本地存储
cartStore.saveCartToStorage();

// 切换门店时的购物车处理
cartStore.switchStoreCart(newStoreId);
```

## 📁 项目结构

```
├── stores/
│   ├── store.ts          # 门店信息 Pinia store
│   └── cart.ts           # 购物车 store (已改进)
├── composables/
│   └── useStoreInit.ts   # 门店初始化 composable
├── components/
│   └── StoreHeader.vue   # 门店信息显示组件
├── types/
│   └── api/
│       └── store.d.ts    # 门店相关类型定义
├── server/
│   └── api/
│       └── store/
│           └── [storeId]/
│               └── info.get.ts  # 门店信息API转发
└── pages/
    └── index.vue         # 使用示例页面
```

## 🔧 配置说明

### 1. 默认门店ID

在 `composables/useStoreInit.ts` 中修改:

```typescript
const DEFAULT_STORE_ID = "X4Z7VE"; // 修改为你的默认门店ID
```

### 2. 缓存时间

在 `stores/store.ts` 中修改:

```typescript
const CACHE_DURATION = 15 * 60 * 1000; // 15分钟，可自定义
```

### 3. API接口地址

门店信息API: `GET /api/store/{storeId}/info` (通过 server 转发到正式接口 `/api/users/store/{storeId}/info`)

**响应格式:**

```json
{
  "data": {
    "id": "X4Z7VE",
    "name": "示例门店",
    "logo_url": "https://example.com/logo.jpg",
    "status": "open",
    "description": "门店公告信息",
    "address": "门店详细地址",
    "business_hours": [
      {
        "day": "周一至周日",
        "open_time": "09:00",
        "close_time": "22:00"
      }
    ],
    "config": {
      "delivery_fee": 3,
      "min_order_amount": 20,
      "delivery_time": "预计30分钟"
    }
  }
}
```

## 🎯 核心优势

1. **数据隔离**: 不同门店的购物车数据完全独立
2. **智能缓存**: 15分钟缓存，减少不必要的API请求
3. **状态管理**: 统一的 Pinia store 管理门店状态
4. **自动持久化**: 门店信息和购物车数据自动保存
5. **易于扩展**: 支持从URL获取门店ID等扩展功能
6. **用户体验**: 骨架屏、错误处理、加载状态等完善的交互

## 🔄 数据流

```
应用启动 → 初始化门店ID → 获取门店信息 → 缓存到本地
    ↓
用户操作购物车 → 数据关联当前门店 → 保存到对应存储key
    ↓
切换门店 → 清除当前数据 → 加载新门店数据 → 更新UI
```

## 📝 注意事项

1. **门店切换**: 切换门店会清空当前购物车，加载目标门店的购物车数据
2. **数据持久化**: 购物车数据按门店ID分别存储在不同的 localStorage key 中
3. **缓存策略**: 门店信息有15分钟缓存，可通过 `forceRefresh` 参数强制刷新
4. **错误处理**: 所有API请求都有完善的错误处理机制
5. **类型安全**: 使用 TypeScript 确保类型安全

---

这个方案提供了完整的门店信息管理能力，可以直接在你的项目中使用。如需定制，可根据具体需求调整配置参数。
