<template>
  <div
    v-if="isDev"
    class="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 min-w-72"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-800">🔧 认证策略调试</h3>
      <button
        @click="collapsed = !collapsed"
        class="text-gray-500 hover:text-gray-700 text-xs"
      >
        {{ collapsed ? "展开" : "收起" }}
      </button>
    </div>

    <div v-if="!collapsed" class="space-y-3">
      <!-- 当前状态信息 -->
      <div class="text-xs space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-600">当前策略:</span>
          <span class="font-mono text-blue-600">{{ currentStrategy }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">强制策略:</span>
          <span class="font-mono text-orange-600">{{
            forceStrategy || "无"
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">初始化状态:</span>
          <span :class="isInitialized ? 'text-green-600' : 'text-red-600'">
            {{ isInitialized ? "已完成" : "未完成" }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">用户登录:</span>
          <span :class="isLoggedIn ? 'text-green-600' : 'text-red-600'">
            {{ isLoggedIn ? "已登录" : "未登录" }}
          </span>
        </div>
      </div>

      <!-- 策略切换按钮 -->
      <div class="space-y-2">
        <button
          @click="switchToWechat"
          :disabled="switching"
          class="w-full px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          🧪 测试微信H5策略
        </button>

        <button
          @click="switchToDev"
          :disabled="switching"
          class="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          💻 使用开发环境策略
        </button>

        <button
          @click="clearAndReload"
          :disabled="switching"
          class="w-full px-3 py-2 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          🔄 清除状态重新加载
        </button>
      </div>

      <!-- 调试信息 -->
      <details class="text-xs">
        <summary class="cursor-pointer text-gray-600 hover:text-gray-800">
          调试信息
        </summary>
        <div class="mt-2 space-y-2">
          <!-- Persist状态检查 -->
          <div class="p-2 bg-yellow-50 rounded">
            <div class="font-semibold text-yellow-800 mb-1">
              📦 本地存储状态:
            </div>
            <div class="space-y-1 text-xs">
              <div
                v-for="(value, key) in debugInfo.localStorage"
                :key="key"
                class="flex justify-between"
              >
                <span class="text-gray-600">{{ key }}:</span>
                <span :class="value ? 'text-green-600' : 'text-red-600'">
                  {{ value ? "✅" : "❌" }}
                </span>
              </div>
            </div>
          </div>

          <!-- 完整调试信息 -->
          <pre class="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">{{
            debugInfo
          }}</pre>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const appStore = useAppStore();
const userStore = useUserStore();

const isDev = computed(() => process.env.NODE_ENV === "development");
const collapsed = ref(false);
const switching = ref(false);

// 状态信息
const currentStrategy = computed(() => appStore.getPlatform);
const isInitialized = computed(() => appStore.getIsInitialized);
const isLoggedIn = computed(() => userStore.isLoggedIn);

const forceStrategy = ref<string | null>(null);
const debugInfo = ref<any>({});

// 更新调试信息
const updateDebugInfo = () => {
  if (!isDev.value || typeof window === "undefined") return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    forceStrategy.value =
      urlParams.get("forceStrategy") || urlParams.get("force_strategy");

    // 检查本地存储数据
    const localStorage_data: Record<string, any> = {
      "user-info": null,
      "app-state": null,
      "cart-data": null,
      "store-info": null,
    };

    Object.keys(localStorage_data).forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        localStorage_data[key] = data ? JSON.parse(data) : null;
      } catch (e: any) {
        localStorage_data[key] = `Error: ${e.message}`;
      }
    });

    debugInfo.value = {
      url: window.location.href,
      strategy: currentStrategy.value,
      forceStrategy: forceStrategy.value,
      initialized: isInitialized.value,
      loggedIn: isLoggedIn.value,
      userInfo: userStore.getUserInfo,
      storeContext: appStore.getStoreContext,
      localStorage: localStorage_data,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error("更新调试信息失败:", error);
  }
};

// 切换到微信策略
const switchToWechat = async () => {
  if (switching.value) return;

  switching.value = true;
  try {
    console.log("🧪 切换到微信H5策略进行测试...");
    appStore.switchAuthStrategy("wechat");
  } catch (error) {
    console.error("切换策略失败:", error);
    switching.value = false;
  }
};

// 切换到开发策略
const switchToDev = async () => {
  if (switching.value) return;

  switching.value = true;
  try {
    console.log("💻 切换到开发环境策略...");
    appStore.switchAuthStrategy("dev");
  } catch (error) {
    console.error("切换策略失败:", error);
    switching.value = false;
  }
};

// 清除状态重新加载
const clearAndReload = async () => {
  if (switching.value) return;

  switching.value = true;
  try {
    console.log("🔄 清除认证状态，重新加载页面...");

    // 清除用户信息
    userStore.clearUserInfo();

    // 重置应用状态
    appStore.reset();

    // 清除本地存储
    if (typeof window !== "undefined") {
      localStorage.removeItem("user-info");
      localStorage.removeItem("app-state");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (error) {
    console.error("清除状态失败:", error);
    switching.value = false;
  }
};

onMounted(() => {
  updateDebugInfo();

  // 定期更新调试信息
  const interval = setInterval(updateDebugInfo, 2000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});

// 监听路由变化更新调试信息
watch([currentStrategy, isInitialized, isLoggedIn], updateDebugInfo);
</script>
