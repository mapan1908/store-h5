<template>
  <van-sidebar
    :model-value="modelValue || 0"
    @change="onChange"
    class="h-full overflow-y-auto scroll-touch"
  >
    <van-sidebar-item
      v-for="(cat, idx) in categories"
      :key="cat.id"
      :title="cat.name"
    >
      <template #title>
        <div class="flex items-center justify-between w-full">
          <span class="text-sm">{{ cat.name }}</span>
          <van-badge
            v-if="getCategoryCount(cat.id) > 0"
            :content="getCategoryCount(cat.id)"
            :max="99"
          />
        </div>
      </template>
    </van-sidebar-item>
  </van-sidebar>
</template>

<script setup lang="ts">
// 1. import
import { ref, watch, computed } from "vue";
import { useCartStore } from "~/stores/cart";
import type { Category } from "~/types/api/store-menu";

// 2. defineProps / defineEmits
const props = defineProps<{
  categories: Category[];
  modelValue?: number;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
  (e: "change", value: number): void;
}>();

// 3. refs / reactives
const cartStore = useCartStore();

// 4. computed
// 获取指定分类的购物车商品数量
const getCategoryCount = (categoryId: number) => {
  if (!categoryId) return 0;
  const count = cartStore.getCategoryCount(categoryId);
  return typeof count === "number" ? count : 0;
};

// 5. watch / watchEffect
// 移除复杂的watch逻辑，简化为纯粹的UI组件

// 6. 函数区
const onChange = (index: number) => {
  console.log("[CategorySidebar] onChange 触发，索引:", index);
  // 直接触发事件，不管理内部状态
  emit("update:modelValue", index);
  emit("change", index);
};

// 7. lifecycle
// （无生命周期钩子）

// 8. defineExpose
// （无对外暴露）
</script>
