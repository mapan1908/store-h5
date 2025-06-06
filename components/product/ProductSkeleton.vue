<template>
  <!-- 侧边栏布局骨架屏 -->
  <div v-if="layout === 'sidebar'" class="flex h-full overflow-hidden">
    <!-- 左侧分类骨架 -->
    <div class="w-24 border-r border-gray-200 flex-shrink-0 bg-white p-2">
      <div v-for="i in 6" :key="i" class="mb-3">
        <van-skeleton class="w-full h-12 rounded" animated />
      </div>
    </div>

    <!-- 右侧商品列表骨架 -->
    <div class="flex-1 bg-gray-50 p-4">
      <div v-for="categoryIndex in 3" :key="categoryIndex" class="mb-6">
        <!-- 分类标题骨架 -->
        <van-skeleton class="mb-3" :row="1" title :title-width="100" animated />

        <!-- 商品列表骨架 -->
        <div v-for="itemIndex in 4" :key="itemIndex" class="mb-4">
          <ProductItemSkeleton />
        </div>
      </div>
    </div>
  </div>

  <!-- 标签页布局骨架屏 -->
  <div v-else-if="layout === 'tab'" class="h-full">
    <!-- 标签栏骨架 -->
    <div class="flex border-b border-gray-200 bg-white px-4">
      <div v-for="i in 5" :key="i" class="mr-6 py-3">
        <van-skeleton class="w-16 h-6 rounded" animated />
      </div>
    </div>

    <!-- 商品列表骨架 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-for="i in 6" :key="i" class="mb-4">
        <ProductItemSkeleton />
      </div>
    </div>
  </div>

  <!-- 平铺布局骨架屏 -->
  <div v-else class="h-full overflow-y-auto p-4">
    <div v-for="categoryIndex in 3" :key="categoryIndex" class="mb-6">
      <!-- 分类标题骨架 -->
      <van-skeleton class="mb-3" :row="1" title :title-width="100" animated />

      <!-- 商品列表骨架 -->
      <div v-for="itemIndex in 4" :key="itemIndex" class="mb-4">
        <ProductItemSkeleton />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  layout: "sidebar" | "tab" | "plain";
}

defineProps<Props>();
</script>
