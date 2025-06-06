<template>
  <div
    ref="container"
    class="overflow-y-auto h-full pb-20"
    style="-webkit-overflow-scrolling: touch"
    @scroll.passive="onScroll"
  >
    <div
      v-for="cat in categories"
      :key="cat.id"
      :ref="(el) => setRef(cat.id, el)"
      class="pb-4"
    >
      <h3 class="sticky top-0 bg-white z-10 p-2">{{ cat.name }}</h3>
      <ProductItem v-for="item in cat.menu_items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryWithMenuItems } from "~/types/api/store-menu";
import ProductItem from "./ProductItem.vue";

const props = defineProps<{
  categories: CategoryWithMenuItems[];
  activeCategoryId: number | null;
}>();

const emit = defineEmits<{
  (e: "scroll-change", id: number): void;
}>();

const container = ref<HTMLElement | null>(null);
const categoryRefs = ref<Record<number, HTMLElement>>({});

const setRef = (id: number, el: any) => {
  if (el && el instanceof HTMLElement) {
    categoryRefs.value[id] = el;
  }
};

const onScroll = () => {
  const top = container.value?.scrollTop ?? 0;
  const entries = Object.entries(categoryRefs.value);
  for (let i = entries.length - 1; i >= 0; i--) {
    const [idStr, el] = entries[i];
    if (el.offsetTop <= top + 10) {
      emit("scroll-change", Number(idStr));
      break;
    }
  }
};
</script>
