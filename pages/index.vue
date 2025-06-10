<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div class="text-2xl font-bold mb-4">请选择门店</div>
    <div class="flex gap-4">
      <van-button type="primary" @click="goToStore('X4Z7VE')"
        >进入门店 X4Z7VE</van-button
      >
      <van-button type="primary" @click="goToStore('TEST001')"
        >进入门店 TEST001</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useHead } from "#head";

// 设置页面标题
useHead({
  title: "门店选择 - 门店信息管理系统",
});

const router = useRouter();

// 跳转到指定门店页面
function goToStore(storeCode: string) {
  router.push(`/${storeCode}`);
}
</script>
