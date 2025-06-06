<template>
  <div class="p-4">
    <h3 class="text-lg font-bold mb-2">{{ item.name }}</h3>
    <div class="text-gray-500">{{ item.description }}</div>
    <div class="mt-4 text-red-500 font-bold">¥{{ item.price.toFixed(2) }}</div>
    <!-- 可添加规格选择、加减按钮等 -->
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from "~/types/api/store-menu";

const props = defineProps<{
  item: MenuItem;
}>();
</script>
