<template>
  <div>
    <div v-for="cat in sortedCategories" :key="cat.id" class="mb-4">
      <h3 class="text-lg font-semibold mb-3 px-4">{{ cat.name }}</h3>
      <!-- 有商品时显示商品列表 -->
      <div v-if="cat.menu_items && cat.menu_items.length > 0" class="px-2">
        <ProductItem
          v-for="item in cat.menu_items"
          :key="item.id"
          :item="item"
        />
      </div>
      <!-- 无商品时显示空状态 - 减少高度 -->
      <div v-else class="text-center py-6 text-gray-500">
        <div class="text-sm">暂无商品</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";
import ProductItem from "~/components/product/ProductItem.vue";

const props = defineProps<{
  menu: StoreMenu;
}>();

// 按sequence_number排序分类
const sortedCategories = computed(() =>
  [...props.menu.categories].sort(
    (a, b) => a.sequence_number - b.sequence_number
  )
);
</script>
