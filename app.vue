<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- 开发环境认证策略调试器 -->
    <ClientOnly>
      <LazyAuthStrategyDebugger />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "nuxt/app";

useHead({
  meta: [
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ],
});

// 应用初始化现在由 plugins/auth.client.ts 处理
</script>

<style>
:root {
  --van-primary-color: #007aff;
  --van-primary-color-light: #409eff;
  --van-primary-color-dark: #0056b3;
}
</style>
