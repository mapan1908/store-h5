import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface UserInfo {
  token: string;
  userId: number;
  openId: string;
  role?: string;
  name?: string;
  avatarUrl?: string | null;
}

export const useUserStore = defineStore(
  "user",
  () => {
    // 状态
    const userInfo = ref<UserInfo | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 计算属性
    const isLoggedIn = computed(() => {
      return !!userInfo.value?.token;
    });

    const getUserInfo = computed(() => {
      return userInfo.value;
    });

    const getToken = computed(() => {
      return userInfo.value?.token || "";
    });

    const getOpenId = computed(() => {
      return userInfo.value?.openId || "";
    });

    const getUserRole = computed(() => {
      return userInfo.value?.role || "user";
    });

    // 方法
    const setUserInfo = (info: UserInfo) => {
      console.log("🔄 正在更新用户信息:", info);
      userInfo.value = info;
      error.value = null;
      console.log("✅ 用户信息已更新到pinia store");

      // 验证persist是否工作
      if (process.client) {
        // 延迟检查，给persist插件时间保存数据
        setTimeout(() => {
          const saved = localStorage.getItem("user-info");
          if (saved) {
            console.log(
              "✅ 用户信息已自动保存到localStorage:",
              JSON.parse(saved)
            );
          } else {
            console.warn("⚠️ 用户信息未保存到localStorage，persist可能未工作");
          }
        }, 200);
      }
    };

    const updateUserInfo = (updates: Partial<UserInfo>) => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...updates };
        console.log("用户信息已部分更新:", updates);
      }
    };

    const clearUserInfo = () => {
      userInfo.value = null;
      error.value = null;
      console.log("用户信息已清除");
    };

    const setLoading = (state: boolean) => {
      loading.value = state;
    };

    const setError = (message: string | null) => {
      error.value = message;
    };

    return {
      // 状态
      userInfo,
      loading,
      error,

      // 计算属性
      isLoggedIn,
      getUserInfo,
      getToken,
      getOpenId,
      getUserRole,

      // 方法
      setUserInfo,
      updateUserInfo,
      clearUserInfo,
      setLoading,
      setError,
    };
  },
  {
    persist: {
      key: "user-info",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // 持久化用户信息和错误状态
      pick: ["userInfo", "error"],
      debug: process.env.NODE_ENV === "development",
    },
  }
);
