<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- 标题 -->
    <div class="flex-shrink-0 bg-white p-4 border-b">
      <h1 class="text-lg font-bold">空状态测试</h1>
      <p class="text-sm text-gray-600 mt-1">
        测试不同布局下分类无商品时的空状态显示
      </p>
    </div>

    <!-- 布局切换按钮 -->
    <div class="flex-shrink-0 bg-white p-2 border-b">
      <van-tabs v-model:active="activeLayout" class="text-sm">
        <van-tab title="侧边栏布局" name="sidebar" />
        <van-tab title="标签页布局" name="tabs" />
        <van-tab title="平铺布局" name="plain" />
      </van-tabs>
    </div>

    <!-- 商品展示区域 -->
    <div class="flex-1 min-h-0">
      <ProductSection
        :menu="testMenu"
        :loading="false"
        :layout="activeLayout"
        class="h-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";

// 设置页面标题
useHead({
  title: "空状态测试",
});

const activeLayout = ref<"sidebar" | "tabs" | "plain">("sidebar");

// 测试菜单数据：包含有商品的分类和无商品的分类
const testMenu: StoreMenu = {
  categories: [
    {
      id: 1,
      name: "有商品的分类",
      sort: 1,
      menu_items: [
        {
          id: 1,
          name: "苹果",
          description: "新鲜红苹果",
          category_id: 1,
          item_type: "SINGLE",
          unit: "个",
          min_price: 300,
          price: 300,
          status: "available",
          image_url:
            "https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg",
          item_specs: [],
        },
        {
          id: 2,
          name: "香蕉",
          description: "优质香蕉",
          category_id: 1,
          item_type: "SINGLE",
          unit: "根",
          min_price: 200,
          price: 200,
          status: "available",
          image_url:
            "https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg",
          item_specs: [],
        },
      ],
    },
    {
      id: 2,
      name: "空分类1",
      sort: 2,
      menu_items: [], // 空数组
    },
    {
      id: 3,
      name: "空分类2",
      sort: 3,
      menu_items: [], // 空数组
    },
    {
      id: 4,
      name: "另一个有商品的分类",
      sort: 4,
      menu_items: [
        {
          id: 3,
          name: "橙子",
          description: "甜美橙子",
          category_id: 4,
          item_type: "SINGLE",
          unit: "个",
          min_price: 250,
          price: 250,
          status: "available",
          image_url:
            "https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg",
          item_specs: [],
        },
      ],
    },
    {
      id: 5,
      name: "又一个空分类",
      sort: 5,
      menu_items: [], // 空数组
    },
  ],
};
</script>
