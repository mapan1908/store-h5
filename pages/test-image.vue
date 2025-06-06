<template>
  <div class="p-4">
    <h1 class="text-lg font-bold mb-4">图片预览测试</h1>

    <!-- 测试有图片的商品 -->
    <div class="mb-6">
      <h2 class="text-md font-semibold mb-2">有图片的商品：</h2>
      <ProductItem :item="itemWithImage" />
    </div>

    <!-- 测试无图片的商品 -->
    <div class="mb-6">
      <h2 class="text-md font-semibold mb-2">无图片的商品：</h2>
      <ProductItem :item="itemWithoutImage" />
    </div>

    <!-- 测试图片加载失败的商品 -->
    <div class="mb-6">
      <h2 class="text-md font-semibold mb-2">图片加载失败的商品：</h2>
      <ProductItem :item="itemWithBrokenImage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItemWithSpecs } from "~/types/api/store-menu";

// 设置页面标题
useHead({
  title: "图片预览测试",
});

// 有图片的商品
const itemWithImage: MenuItemWithSpecs = {
  id: 1,
  name: "苹果",
  description: "新鲜红苹果",
  category_id: 1,
  item_type: "SINGLE",
  unit: "个",
  min_price: 300, // 3元
  image_url: "https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg",
  item_specs: [],
};

// 无图片的商品
const itemWithoutImage: MenuItemWithSpecs = {
  id: 2,
  name: "香蕉",
  description: "优质香蕉",
  category_id: 1,
  item_type: "SINGLE",
  unit: "根",
  min_price: 200, // 2元
  image_url: "", // 空图片URL
  item_specs: [],
};

// 图片加载失败的商品
const itemWithBrokenImage: MenuItemWithSpecs = {
  id: 3,
  name: "橙子",
  description: "甜美橙子",
  category_id: 1,
  item_type: "SINGLE",
  unit: "个",
  min_price: 250, // 2.5元
  image_url: "https://invalid-url.com/broken-image.jpg", // 无效图片URL
  item_specs: [],
};
</script>
