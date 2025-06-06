<template>
  <div class="h-full flex flex-col">
    <!-- 加载骨架屏 -->
    <ProductSkeleton v-if="isLoading" :layout="currentLayout" />

    <!-- 商品区块 -->
    <component
      v-else
      :is="layoutComponent"
      :menu="menu"
      :cartInfo="cartInfo"
      class="flex-1 min-h-0"
    />

    <!-- 购物车面板和按钮：只有有商品时才显示 -->
    <ClientOnly>
      <CartPanel
        v-if="cartStore.totalItemsCount > 0"
        v-model:show="showCartPanel"
        :items="cartStore.rawCartItems"
        @checkout="handleCheckout"
        @clear-cart="cartStore.clearCart"
        @update-item-quantity="handleUpdateItemQuantity"
        @remove-item="handleRemoveItem"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { StoreMenu } from "~/types/api/store-menu";
import CartPanel from "../cart/CartPanel.vue";
import ProductSkeleton from "./ProductSkeleton.vue";
import { ref, computed, watch } from "vue";
import { useCartStore } from "~/stores/cart";
import SidebarLayout from "../layout/SidebarLayout.vue";
import TabLayout from "../layout/TabLayout.vue";
import PlainProductList from "../layout/PlainProductList.vue";

const props = defineProps<{
  menu: StoreMenu;
  layout?: "sidebar" | "tabs" | "plain";
  loading?: boolean;
}>();

const cartStore = useCartStore();
const showCartPanel = ref(false);

// 骨架屏加载状态
const isLoading = computed(() => {
  return (
    props.loading ||
    !props.menu ||
    !props.menu.categories ||
    !props.menu.categories.length
  );
});

const cartInfo = computed(() => ({
  total: cartStore.totalPriceYuan,
  count: cartStore.totalItemsCount,
}));

// 当前布局类型（用于骨架屏）
const currentLayout = computed(() => {
  if (props.layout) return props.layout === "tabs" ? "tab" : props.layout;
  if (!props.menu || !props.menu.categories.length) return "sidebar";
  const len = props.menu.categories.length;
  if (len <= 1) return "plain";
  if (len <= 3) return "tab";
  return "sidebar";
});

const layoutComponent = computed(() => {
  if (props.layout) return getLayout(props.layout);
  const len = props.menu.categories.length;
  if (len <= 1) return PlainProductList;
  if (len <= 3) return TabLayout;
  return SidebarLayout;
});

function getLayout(layout: string) {
  switch (layout) {
    case "sidebar":
      return SidebarLayout;
    case "tabs":
      return TabLayout;
    case "plain":
      return PlainProductList;
    default:
      return PlainProductList;
  }
}

watch(
  () => cartStore.totalItemsCount,
  (count) => {
    if (count === 0) showCartPanel.value = false;
  }
);

function handleCheckout(payload: any) {
  showCartPanel.value = false;
}
function handleUpdateItemQuantity({
  itemId,
  newQuantity,
}: {
  itemId: number;
  newQuantity: number;
}) {
  cartStore.updateItemQuantity(itemId, 0, newQuantity);
}
function handleRemoveItem({ itemId }: { itemId: number }) {
  cartStore.removeItem(itemId, 0);
}
</script>
