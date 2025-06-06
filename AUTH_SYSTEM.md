# 🔐 认证系统架构说明

基于策略模式的多平台认证系统，支持微信H5登录和开发环境快速登录。

## 📁 目录结构

```
├── stores/
│   ├── app.ts           # 应用状态管理 (新增)
│   ├── user.ts          # 用户状态管理 (新增)
│   ├── store.ts         # 门店信息管理 (已有)
│   └── cart.ts          # 购物车管理 (已有)
├── utils/
│   ├── auth/
│   │   ├── AppLaunchManager.ts       # 启动管理器
│   │   ├── StrategyFactory.ts        # 策略工厂
│   │   └── strategies/
│   │       ├── PlatformStrategy.ts       # 策略接口
│   │       ├── WechatH5Strategy.ts       # 微信H5策略
│   │       └── DevelopmentStrategy.ts    # 开发环境策略
│   └── platform.ts                  # 平台检测工具
├── plugins/
│   └── auth.client.ts               # 客户端认证插件
└── server/api/auth/
    ├── dev-login.post.ts           # 开发环境登录API
    └── wechat-auth-url.post.ts     # 微信授权URL获取API
```

## 🚀 应用启动流程

### 1. 总体流程

```
1. Nuxt应用启动
2. plugins/auth.client.ts 执行
3. AppLaunchManager.launch()
4. 解析URL参数，建立门店上下文
5. 检测平台环境 (微信H5/开发环境)
6. 执行对应的登录策略
7. 初始化门店信息
8. 应用初始化完成
```

### 2. 平台检测优先级

1. **微信H5策略** - 检测到微信浏览器环境
2. **开发环境策略** - 检测到开发环境
3. **默认策略** - 降级到开发环境策略

## 🎯 登录策略详解

### 微信H5策略 (WechatH5Strategy)

#### 首次访问流程:

```
1. 检测微信浏览器环境
2. 构造回调URL (包含门店参数)
3. 跳转到后端微信登录接口
4. 用户在微信授权页面确认
5. 微信重定向回前端 (带用户信息参数)
```

#### 微信回调处理:

```
1. 检测URL包含token、openId、userId等参数
2. 解析用户信息并保存到UserStore
3. 清理URL中的授权参数
4. 应用初始化完成
```

#### 微信登录流程:

```
1. 客户端调用 /api/auth/wechat-auth-url (POST)
2. 服务端转发到后端，获取微信授权URL
3. 客户端跳转到微信授权页面
4. 微信授权后重定向回前端 (带用户信息)
```

### 开发环境策略 (DevelopmentStrategy)

#### 快速登录流程:

```
1. 检测到开发环境
2. 使用固定openId: "857346"
3. 调用 /api/auth/dev-login
4. 服务端转发到后端获取用户信息
5. 返回用户信息并保存
```

## 📊 状态管理

### AppStore (应用状态)

```typescript
interface AppState {
  // 初始化状态
  isInitialized: boolean;
  initStep: string;
  initError: string | null;

  // 门店上下文
  storeContext: {
    storeCode: string; // 门店编号
    tableId: string | null; // 桌号
    addressId: string | null; // 地址ID
  };

  // 应用配置
  homePage: string; // 首页路径
  platform: string; // 当前平台

  // 全局状态
  globalLoading: boolean;
  globalError: string | null;
}
```

### UserStore (用户状态)

```typescript
interface UserInfo {
  token: string; // 认证token
  userId: number; // 用户ID
  openId: string; // 微信openId
  role?: string; // 用户角色
  name?: string; // 用户名
  avatarUrl?: string | null; // 头像URL
}
```

## 🔧 URL参数处理

### 门店上下文参数

- `storeCode` - 门店编号 (必需)
- `tableId` - 桌号 (可选)
- `addressId` - 地址ID (可选)

### 微信回调参数 (自动处理)

- `token` - 用户token
- `openId` - 微信openId
- `userId` - 用户ID
- `role` - 用户角色
- `name` - 用户名
- `avatarUrl` - 头像URL

### 示例URL

```
# 普通访问 (带门店信息)
https://yourdomain.com/?storeCode=TEST001&tableId=A01

# 微信授权回调 (系统自动处理)
https://yourdomain.com/?storeCode=TEST001&token=xxx&openId=xxx&userId=123
```

## 🛠️ 开发调试

### 调试面板

访问 `/debug` 页面查看：

- 应用初始化状态
- 用户认证信息
- 门店上下文
- 平台检测结果
- URL参数信息

### 开发者工具

开发环境下，启动管理器会挂载到全局：

```javascript
// 浏览器控制台中
window.__launchManager.performLogin(); // 手动登录
window.__launchManager.reinitialize(); // 重新初始化
window.__launchManager.getCurrentStrategy(); // 获取当前策略
```

### 常用调试命令

```javascript
// 查看当前状态
console.log("用户状态:", useUserStore().getUserInfo);
console.log("应用状态:", useAppStore().getIsInitialized);
console.log("门店信息:", useStoreInfoStore().currentStoreInfo);

// 重置状态
useUserStore().clearUserInfo();
useAppStore().reset();
```

## 🔄 与现有代码的集成

### 简化的composables

- `useAuth()` - 简化为依赖新认证系统
- `useStoreInit()` - 移除认证逻辑，专注门店信息

### app.vue 简化

移除了 `onMounted` 中的初始化逻辑，改由 `plugins/auth.client.ts` 处理

### 保持兼容

- 现有的API中间件 (`server/middleware/auth.global.ts`) 继续工作
- 购物车和门店信息功能保持不变
- 现有页面无需修改，自动获得认证功能

## 🚨 注意事项

### 1. 环境配置

确保 `nuxt.config.ts` 中配置正确的后端API地址：

```typescript
runtimeConfig: {
  // 只在服务端使用，客户端不可见
  apiBase: "https://api.diantd.com/api",
  public: {
    // 客户端配置项，暂时为空
    // 所有请求都通过server转发，客户端不需要知道真实后端地址
  }
}
```

**重要**: 客户端不再需要知道真实的后端API地址，所有请求都通过Nuxt server转发，包括微信授权URL的获取。

### 2. 微信公众号配置

需要在微信公众平台配置回调域名白名单

### 3. 开发环境

- 开发环境自动使用固定openId: "857346"
- 生产环境会根据平台自动选择合适的策略

### 4. 错误处理

- 认证失败会显示错误信息
- 可通过调试面板查看详细错误
- 支持手动重试和重新初始化

## 📝 扩展指南

### 添加新的登录策略

1. 实现 `PlatformStrategy` 接口
2. 在 `StrategyFactory` 中注册
3. 添加平台检测逻辑

### 自定义错误处理

在策略中重写 `showError` 方法，集成自定义的Toast组件

### 添加登录中间件

创建路由中间件，检查认证状态并重定向

## 🎉 开发完成

新的认证系统已经完全实现并集成到现有项目中！

- ✅ 策略模式登录系统
- ✅ 微信H5公众号授权
- ✅ 开发环境快速登录
- ✅ 完整的状态管理
- ✅ 调试面板和工具
- ✅ 与现有代码兼容
