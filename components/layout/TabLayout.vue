<template>
  <van-tabs v-model:active="active">
    <van-tab
      v-for="(cat, index) in sortedCategories"
      :title="cat.name"
      :key="cat.id"
    >
      <!-- 有商品时显示商品列表 -->
      <div v-if="cat.menu_items && cat.menu_items.length > 0" class="p-2">
        <ProductItem
          v-for="item in cat.menu_items"
          :key="item.id"
          :item="item"
        />
      </div>
      <!-- 无商品时显示空状态 - 减少高度 -->
      <div v-else class="text-center py-8 text-gray-500">
        <div class="text-sm">暂无商品</div>
      </div>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";
import ProductItem from "~/components/product/ProductItem.vue";

const props = defineProps<{
  menu: StoreMenu;
}>();
const active = ref(0);

// 按sequence_number排序分类
const sortedCategories = computed(() =>
  [...props.menu.categories].sort(
    (a, b) => a.sequence_number - b.sequence_number
  )
);
</script>
