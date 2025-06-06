<template>
  <div class="bg-white shadow-sm">
    <div class="p-4">
      <!-- 头部区域骨架 -->
      <div class="flex items-start mb-3">
        <!-- Logo 骨架 -->
        <van-skeleton class="w-16 h-16 rounded-lg mr-3" />
        <!-- 信息区域骨架 -->
        <div class="flex-1">
          <van-skeleton
            class="mb-2"
            :row="1"
            title
            :title-width="120"
            animated
          />
          <van-skeleton :row="2" :row-width="['80%', '90%']" animated />
        </div>
      </div>
      <!-- 配送信息骨架 -->
      <van-skeleton :row="1" :row-width="'60%'" animated />
      <!-- 公告区域骨架 -->
      <div class="mt-3">
        <van-skeleton :row="1" :row-width="'100%'" animated />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯展示组件，无需逻辑
</script>
