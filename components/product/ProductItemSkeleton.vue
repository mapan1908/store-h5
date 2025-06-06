<template>
  <div class="flex items-start bg-white rounded-lg p-4 shadow-sm">
    <!-- 商品图片骨架 -->
    <van-skeleton class="w-16 h-16 rounded-lg mr-3 flex-shrink-0" animated />

    <!-- 商品信息骨架 -->
    <div class="flex-1 min-w-0">
      <!-- 商品名称 -->
      <van-skeleton class="mb-2" :row="1" title :title-width="120" animated />

      <!-- 商品描述 -->
      <van-skeleton class="mb-2" :row="1" :row-width="'80%'" animated />

      <!-- 价格和按钮区域 -->
      <div class="flex items-center justify-between">
        <!-- 价格骨架 -->
        <van-skeleton class="w-16 h-6 rounded" animated />

        <!-- 按钮骨架 -->
        <van-skeleton class="w-8 h-8 rounded-full" animated />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需 props，这是一个纯展示的骨架屏组件
</script>
