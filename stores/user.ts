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

      // 调试：检查persist是否自动保存
      if (process.client) {
        // 立即检查
        const immediate = localStorage.getItem("user-info");
        console.log("📦 立即检查localStorage:", immediate);

        // 延迟检查（等待persist插件保存）
        setTimeout(() => {
          const delayed = localStorage.getItem("user-info");
          console.log("📦 延迟检查localStorage:", delayed);

          if (delayed) {
            console.log("✅ persist插件自动保存成功");
          } else {
            console.warn("⚠️ persist插件未自动保存，可能需要手动初始化");
          }
        }, 500);
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
      // 持久化用户信息
      pick: ["userInfo"],
      debug: true,
    },
  }
);
