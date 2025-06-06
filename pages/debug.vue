<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- 固定头部 -->
    <div class="bg-white shadow-sm p-4 flex-shrink-0 border-b">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <van-icon
            name="arrow-left"
            @click="goHome"
            class="cursor-pointer text-xl"
          />
          <h1 class="text-lg font-semibold">🔧 系统调试面板</h1>
        </div>
        <div class="flex items-center gap-2">
          <van-tag type="success" v-if="appStore.isInitialized"
            >已初始化</van-tag
          >
          <van-tag type="warning" v-else>初始化中</van-tag>
          <van-button type="primary" size="small" @click="refreshApp"
            >刷新</van-button
          >
        </div>
      </div>
    </div>

    <!-- 可滚动内容区域 -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-4 space-y-6 pb-8">
        <!-- 页面标题 -->
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">🔧 系统调试面板</h1>
          <p class="text-gray-600">查看应用状态、认证信息和平台检测结果</p>
        </div>

        <!-- 应用状态 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <span
              class="w-2 h-2 rounded-full mr-2"
              :class="appStore.getIsInitialized ? 'bg-green-500' : 'bg-red-500'"
            ></span>
            应用状态
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">初始化状态:</span>
                <van-tag
                  :type="appStore.getIsInitialized ? 'success' : 'danger'"
                >
                  {{ appStore.getIsInitialized ? "已完成" : "未完成" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">当前步骤:</span>
                <span class="text-sm">{{ appStore.initStep }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">平台:</span>
                <van-tag type="primary">{{
                  appStore.getPlatform || "未检测"
                }}</van-tag>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">首页路径:</span>
                <span class="text-sm font-mono">{{
                  appStore.getHomePage
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">全局加载:</span>
                <van-tag :type="appStore.globalLoading ? 'warning' : 'default'">
                  {{ appStore.globalLoading ? "加载中" : "空闲" }}
                </van-tag>
              </div>
              <div v-if="appStore.initError" class="flex justify-between">
                <span class="text-gray-600">错误信息:</span>
                <span class="text-sm text-red-600">{{
                  appStore.initError
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户认证状态 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <span
              class="w-2 h-2 rounded-full mr-2"
              :class="userStore.isLoggedIn ? 'bg-green-500' : 'bg-red-500'"
            ></span>
            用户认证状态
          </h2>
          <div
            v-if="userStore.isLoggedIn && userStore.getUserInfo"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">登录状态:</span>
                <van-tag type="success">已登录</van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户ID:</span>
                <span class="text-sm font-mono">{{
                  userStore.getUserInfo.userId
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">OpenID:</span>
                <span class="text-sm font-mono">{{
                  userStore.getUserInfo.openId
                }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">用户角色:</span>
                <van-tag type="primary">{{
                  userStore.getUserInfo.role || "普通用户"
                }}</van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户名:</span>
                <span class="text-sm">{{
                  userStore.getUserInfo.name || "未设置"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Token:</span>
                <span class="text-sm font-mono truncate"
                  >{{ userStore.getToken.substring(0, 20) }}...</span
                >
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500">
            <p>用户未登录</p>
          </div>
        </div>

        <!-- 门店上下文 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">🏪 门店上下文</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">门店编号:</span>
                <span class="text-sm font-mono">{{
                  appStore.getStoreContext.storeCode
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">桌号:</span>
                <span class="text-sm">{{
                  appStore.getStoreContext.tableId || "未设置"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">地址ID:</span>
                <span class="text-sm">{{
                  appStore.getStoreContext.addressId || "未设置"
                }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">门店状态:</span>
                <van-tag
                  :type="storeInfoStore.isStoreOpen ? 'success' : 'default'"
                >
                  {{ storeInfoStore.isStoreOpen ? "营业中" : "休息中" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">门店地址:</span>
                <span class="text-sm">{{ storeInfoStore.storeAddress }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">营业时间:</span>
                <span class="text-sm">{{ storeInfoStore.businessHours }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 平台检测信息 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">📱 平台检测信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">客户端:</span>
                <van-tag :type="platformInfo.isClient ? 'success' : 'default'">
                  {{ platformInfo.isClient ? "是" : "否" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">微信浏览器:</span>
                <van-tag
                  :type="platformInfo.isWechatBrowser ? 'success' : 'default'"
                >
                  {{ platformInfo.isWechatBrowser ? "是" : "否" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">开发环境:</span>
                <van-tag
                  :type="platformInfo.isDevelopment ? 'warning' : 'default'"
                >
                  {{ platformInfo.isDevelopment ? "是" : "否" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">移动设备:</span>
                <van-tag :type="platformInfo.isMobile ? 'success' : 'default'">
                  {{ platformInfo.isMobile ? "是" : "否" }}
                </van-tag>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">iOS设备:</span>
                <van-tag :type="platformInfo.isIOS ? 'success' : 'default'">
                  {{ platformInfo.isIOS ? "是" : "否" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Android设备:</span>
                <van-tag :type="platformInfo.isAndroid ? 'success' : 'default'">
                  {{ platformInfo.isAndroid ? "是" : "否" }}
                </van-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">平台名称:</span>
                <van-tag type="primary">{{
                  platformInfo.platformName
                }}</van-tag>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-gray-600 text-sm mb-2">User Agent:</div>
            <div class="text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {{ platformInfo.userAgent }}
            </div>
          </div>
        </div>

        <!-- URL参数信息 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">🔗 URL参数信息</h2>
          <div class="mb-4">
            <div class="text-sm text-gray-600">当前URL:</div>
            <div class="text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {{ currentUrl }}
            </div>
          </div>
          <div
            v-if="urlParams && Object.keys(urlParams).length > 0"
            class="space-y-2"
          >
            <div
              v-for="(value, key) in urlParams"
              :key="key"
              class="flex justify-between"
            >
              <span class="text-gray-600">{{ key }}:</span>
              <span class="text-sm font-mono">{{ value }}</span>
            </div>
          </div>
          <div v-else class="text-center text-gray-500">
            <p>无URL参数</p>
          </div>
        </div>

        <!-- 本地存储信息 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">💾 本地存储信息</h2>
          <div class="space-y-4">
            <!-- localStorage -->
            <div>
              <h3 class="text-md font-medium mb-2">localStorage:</h3>
              <div
                v-if="
                  localStorageData && Object.keys(localStorageData).length > 0
                "
                class="space-y-2"
              >
                <div
                  v-for="(value, key) in localStorageData"
                  :key="key"
                  class="bg-gray-50 p-2 rounded"
                >
                  <div class="text-sm font-medium text-gray-700">
                    {{ key }}:
                  </div>
                  <div class="text-xs font-mono text-gray-600 break-all">
                    {{
                      typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)
                    }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500">
                {{ isClient ? "无localStorage数据" : "服务端渲染中..." }}
              </div>
            </div>

            <!-- sessionStorage -->
            <div>
              <h3 class="text-md font-medium mb-2">sessionStorage:</h3>
              <div
                v-if="
                  sessionStorageData &&
                  Object.keys(sessionStorageData).length > 0
                "
                class="space-y-2"
              >
                <div
                  v-for="(value, key) in sessionStorageData"
                  :key="key"
                  class="bg-gray-50 p-2 rounded"
                >
                  <div class="text-sm font-medium text-gray-700">
                    {{ key }}:
                  </div>
                  <div class="text-xs font-mono text-gray-600 break-all">
                    {{
                      typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)
                    }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500">
                {{ isClient ? "无sessionStorage数据" : "服务端渲染中..." }}
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-4">🛠️ 调试操作</h2>
          <div class="flex flex-wrap gap-3">
            <van-button type="primary" @click="refreshApp">
              刷新应用状态
            </van-button>
            <van-button type="success" @click="testLocalStorage">
              测试localStorage
            </van-button>
            <van-button type="warning" @click="clearUserInfo">
              清除用户信息
            </van-button>
            <van-button type="danger" @click="resetApp"> 重置应用 </van-button>
            <van-button type="default" @click="goHome"> 返回首页 </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPlatformDebugInfo } from "~/utils/platform";

// 设置页面标题
useHead({
  title: "系统调试面板 - 门店管理系统",
});

// 获取状态管理stores
const userStore = useUserStore();
const appStore = useAppStore();
const storeInfoStore = useStoreInfoStore();

// 获取平台信息
const platformInfo = ref(getPlatformDebugInfo());

// 获取URL参数
const route = useRoute();
const urlParams = computed(() => route.query);

// 获取当前URL
const currentUrl = ref("");

// 本地存储数据
const localStorageData = ref<Record<string, any>>({});
const sessionStorageData = ref<Record<string, any>>({});

// 检测是否在客户端
const isClient = computed(() => process.client);

// 获取本地存储数据
const getStorageData = () => {
  if (process.client) {
    // 更新当前URL
    currentUrl.value = window.location.href;

    // 获取localStorage数据
    const localData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          localData[key] = value ? JSON.parse(value) : value;
        } catch {
          localData[key] = localStorage.getItem(key);
        }
      }
    }
    localStorageData.value = localData;

    // 获取sessionStorage数据
    const sessionData: Record<string, any> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          sessionData[key] = value ? JSON.parse(value) : value;
        } catch {
          sessionData[key] = sessionStorage.getItem(key);
        }
      }
    }
    sessionStorageData.value = sessionData;
  }
};

// 刷新平台信息
onMounted(() => {
  // 客户端刷新平台信息
  platformInfo.value = getPlatformDebugInfo();
  // 获取存储数据
  getStorageData();
});

// 操作方法
const refreshApp = async () => {
  try {
    // 刷新门店信息
    await storeInfoStore.refreshStoreInfo();

    // 刷新平台信息
    platformInfo.value = getPlatformDebugInfo();

    // 刷新存储数据
    getStorageData();

    console.log("应用状态已刷新");
  } catch (error) {
    console.error("刷新失败:", error);
  }
};

const clearUserInfo = () => {
  userStore.clearUserInfo();
  console.log("用户信息已清除");
};

const resetApp = () => {
  appStore.reset();
  userStore.clearUserInfo();
  storeInfoStore.clearStoreInfo();
  console.log("应用已重置");

  // 延迟重新加载页面
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

const testLocalStorage = () => {
  try {
    // 测试localStorage是否可用
    const testKey = "test-key";
    const testValue = "test-value";

    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    console.log("localStorage测试结果:", {
      设置值: testValue,
      获取值: retrieved,
      测试成功: retrieved === testValue,
    });

    // 手动保存当前用户信息
    if (userStore.getUserInfo) {
      const userInfoJson = JSON.stringify({
        userInfo: userStore.getUserInfo,
      });
      localStorage.setItem("user-info", userInfoJson);
      console.log("手动保存用户信息:", userInfoJson);

      // 刷新显示
      getStorageData();
    }

    alert("localStorage测试完成，请查看控制台日志");
  } catch (error) {
    console.error("localStorage测试失败:", error);
    alert("localStorage不可用: " + error);
  }
};

const goHome = () => {
  navigateTo("/");
};
</script>
