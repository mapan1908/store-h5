<template>
  <!-- 简化的移动端布局 -->
  <div class="flex h-full">
    <!-- 左侧分类栏 -->
    <div
      class="w-20 sm:w-24 border-r border-gray-200 flex-shrink-0 bg-white overflow-y-auto"
    >
      <CategorySidebar
        :categories="categories"
        :model-value="currentCategoryIndex"
        @change="debugHandleCategorySelect"
      />
    </div>

    <!-- 右侧商品滚动区 -->
    <div
      ref="scrollContainer"
      class="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden"
      style="height: 100%; -webkit-overflow-scrolling: touch"
      @scroll.passive="logAndScroll"
    >
      <div class="pb-20 min-h-full">
        <div
          v-for="(cat, index) in categories"
          :key="cat.id"
          :id="`category-${index}`"
          class="pb-4"
        >
          <h3
            class="sticky top-0 bg-white z-10 p-2 shadow-sm text-sm font-medium border-b border-gray-100"
          >
            {{ cat.name }}
          </h3>
          <div class="flex flex-col gap-2 px-2 pt-2">
            <!-- 有商品时显示商品列表 -->
            <template v-if="cat.menu_items && cat.menu_items.length > 0">
              <ProductItem
                v-for="item in cat.menu_items"
                :key="item.id"
                :item="item"
              />
            </template>
            <!-- 无商品时显示空状态 - 高度与商品卡片一致 -->
            <div v-else class="bg-white rounded-lg shadow-sm mb-2">
              <div class="flex items-center justify-center h-20 text-gray-400">
                <div class="text-center">
                  <van-icon name="goods-collect-o" size="20" class="mb-1" />
                  <div class="text-sm">暂无商品</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";
import CategorySidebar from "../product/CategorySidebar.vue";
import ProductItem from "../product/ProductItem.vue";
import { ref, watch, nextTick, onMounted } from "vue";
import useScrollCategory from "~/composables/useScrollCategory";

const props = defineProps<{
  menu: StoreMenu;
}>();

// 按sequence_number排序分类，确保显示顺序和索引顺序一致
const categories = ref(
  [...props.menu.categories].sort(
    (a, b) => a.sequence_number - b.sequence_number
  )
);
const scrollContainer = ref<HTMLElement>();

function logAndScroll(e: Event) {
  const scrollTop = (e.target as HTMLElement).scrollTop;

  // 打印每个分类区块的 offsetTop（相对于滚动容器）
  categories.value.forEach((cat, index) => {
    const el = document.getElementById(`category-${index}`);
    if (el && scrollContainer.value) {
      const relativeTop = el.offsetTop - scrollContainer.value.offsetTop;
    }
  });
  onProductScroll(e);
}

// 单例 composable
const {
  currentCategoryIndex,
  onProductScroll,
  handleCategorySelect,
  forceUpdateCurrentCategory,
} = useScrollCategory({
  categories,
  scrollContainer,
});

// 在组件挂载和数据变化时重新计算位置
watch(
  categories,
  () => {
    nextTick(() => {
      forceUpdateCurrentCategory();
    });
  },
  { immediate: true }
);

onMounted(() => {
  nextTick(() => {
    forceUpdateCurrentCategory();
  });
});

// 调试：包装handleCategorySelect
const debugHandleCategorySelect = (index: number) => {
  console.log("[SidebarLayout] 接收到分类选择事件:", index);
  // 执行滚动（内部会设置currentCategoryIndex）
  handleCategorySelect(index);
};
</script>
