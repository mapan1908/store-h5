# 微信开发者工具兼容性修复指南

## 问题描述

在微信开发者工具中，门店头部图片占满整个页面，但在浏览器中显示正常。

## 根本原因

1. **页面布局问题**：使用了 `fixed inset-0` 等在微信中有兼容性问题的CSS属性
2. **图片样式问题**：`object-cover` 属性在某些微信版本中可能失效
3. **视口计算问题**：`h-screen` 在微信中可能计算不准确

## 修复内容

### 1. 页面布局修复 (`pages/index.vue`)

**修改前：**

```vue
<div
  class="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0"
></div>
```

**修改后：**

```vue
<div class="page-container"></div>
```

**新增CSS：**

```css
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
```

### 2. StoreHeader 图片修复 (`components/store/StoreHeader.vue`)

**修改前：**

```vue
<img class="w-full h-full object-cover" />
```

**修改后：**

```vue
<img class="w-full h-full object-cover wechat-img-fix" />
```

**新增CSS：**

```css
.wechat-img-fix {
  max-width: 100% !important;
  max-height: 100% !important;
  width: 64px !important;
  height: 64px !important;
  object-fit: cover;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.store-header {
  position: relative;
  z-index: 1;
  max-width: 100vw;
  overflow-x: hidden;
}
```

## 微信兼容性最佳实践

### 1. 避免使用的CSS属性

- `fixed` 定位（在微信中可能有问题）
- `inset-0`（兼容性差）
- `object-fit`（需要降级方案）

### 2. 推荐使用的布局方式

- 使用 `flex` 布局
- 使用 `min-height: 100vh` 替代 `h-screen`
- 明确设置 `width` 和 `max-width`

### 3. 图片处理

- 明确设置图片尺寸
- 提供 `object-fit` 的降级方案
- 使用 `background-size: cover` 作为备选

## 测试验证

### 在微信开发者工具中测试

1. 打开微信开发者工具
2. 导入项目
3. 查看页面布局是否正常
4. 确认门店头部图片尺寸正确

### 在浏览器中测试

1. 确保修改后在浏览器中仍然正常显示
2. 测试响应式布局
3. 检查图片加载和显示

## 常见问题

### Q: 修改后在浏览器中显示异常怎么办？

A: 检查CSS是否有冲突，确保新的样式不会影响原有布局。

### Q: 图片还是显示不正常怎么办？

A: 可以尝试使用背景图片方式：

```css
.store-logo {
  background-image: url("...");
  background-size: cover;
  background-position: center;
  width: 64px;
  height: 64px;
}
```

### Q: 页面高度计算不准确怎么办？

A: 使用 `min-height: calc(100vh - [header height])` 来确保内容区域高度。

## 文件清单

修改的文件：

- `pages/index.vue` - 页面布局修复
- `components/store/StoreHeader.vue` - 图片样式修复
- `WECHAT_FIX_GUIDE.md` - 本指南文件
