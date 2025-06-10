<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">我的订单</h1>
    <van-button type="primary">主要按钮</van-button>
  </div>
</template>

<script setup lang="ts">
// 设置页面布局 - 订单页面需要显示底部导航
definePageMeta({
  layout: "with-tabbar",
});

// 这里可以添加订单相关的逻辑
</script>
