<template>
  <!-- 详情弹层：显示在 CartSummary 上方 -->
  <div v-if="showDetail">
    <div
      class="fixed left-0 right-0 top-0 bg-black/50 z-40"
      style="bottom: 98px"
      @click="showDetail = false"
      @touchmove.prevent
      @wheel.prevent
    ></div>
    <div
      class="fixed left-0 right-0 bg-white rounded-t-xl shadow-lg z-50 flex flex-col max-h-[50vh]"
      style="bottom: 98px"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
      @wheel.stop
    >
      <div class="flex justify-between items-center px-6 py-4">
        <span class="font-semibold text-gray-800"
          >已选商品 ({{ totalCount }}件)</span
        >
        <div
          class="flex items-center text-gray-500 cursor-pointer hover:text-gray-700 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          @click.stop="clearCart"
        >
          <van-icon name="delete-o" size="16" class="mr-2" />
          <span class="text-sm font-medium">清空</span>
        </div>
      </div>
      <van-divider :hairline="false" class="!my-0 border-gray-100" />
      <div class="flex-1 overflow-y-auto scroll-touch">
        <div v-for="(item, index) in items" :key="item.item_id">
          <div class="flex justify-between items-center px-6 py-4">
            <div class="flex-1 mr-6">
              <div class="font-medium text-gray-800 text-base mb-1">
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-500" v-if="item.spec_name">
                {{ item.spec_name }}
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="inline-flex items-baseline text-orange-500">
                <span class="text-sm font-medium">¥</span>
                <span class="text-base font-medium">{{
                  Math.floor(item.price)
                }}</span>
                <span class="text-sm font-medium"
                  >.{{ (item.price % 1).toFixed(2).slice(2) }}</span
                >
              </div>
              <van-stepper
                v-model="item.quantity"
                :min="0"
                :integer="true"
                theme="round"
                button-size="24"
                input-width="32"
                @change="updateItemQuantity(item, $event)"
              />
            </div>
          </div>
        </div>
        <!-- 底部安全间距，防止最后一个商品被遮挡 -->
        <div class="h-2 flex-shrink-0"></div>
      </div>
    </div>
  </div>

  <!-- 底部栏，始终显示 -->
  <div
    class="bg-white fixed left-0 right-0 z-50 border-t border-b border-gray-200 w-full"
    style="bottom: 50px; width: 100vw; max-width: 100%; box-sizing: border-box"
  >
    <!-- CartSummary 组件，包含切换详情和结算功能 -->
    <CartSummary
      :total-count="totalCount"
      @checkout="checkout"
      @toggle-detail="toggleDetail"
    />
  </div>
</template>

<script setup lang="ts">
// 1. import
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useCartStore } from "~/stores/cart";
import CartSummary from "./CartSummary.vue";
import type { CartItem } from "~/types/view/cart";

// 2. defineProps / defineEmits
const props = defineProps({
  items: Array as PropType<CartItem[]>,
  show: Boolean,
});
const emit = defineEmits([
  "update:show",
  "checkout",
  "clear-cart",
  "update-item-quantity",
  "remove-item",
]);

// 3. refs / reactives
const showDetail = ref(false);
const cartStore = useCartStore();

// 4. computed
const totalCount = computed(() => cartStore.totalItemsCount);

// 5. watch / watchEffect
watch(
  () => props.show,
  (val) => {
    showDetail.value = val;
  }
);
watch(showDetail, (val) => {
  emit("update:show", val);
  // 控制 body 滚动，彻底解决滚动穿透
  if (val) {
    // 弹层显示时禁用 body 滚动
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = "100%";
  } else {
    // 弹层关闭时恢复 body 滚动
    const scrollY = document.body.style.top;
    restoreBodyScroll();
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  }
});

// 6. 函数区
function clearCart(e: Event) {
  e.stopPropagation();
  cartStore.clearCart();
}
function updateItemQuantity(item: CartItem, newQuantity: number) {
  if (newQuantity === 0) {
    // 当数量为0时，从购物车中移除商品
    cartStore.removeItem(item.item_id, item.spec_id);
  } else {
    cartStore.updateItemQuantity(item.item_id, item.spec_id, newQuantity);
  }
}
function checkout(e: Event) {
  e.stopPropagation();
  emit("checkout");
  showDetail.value = false;
}
function toggleDetail() {
  showDetail.value = !showDetail.value;
}

// 清理 body 样式的函数
function restoreBodyScroll() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
}

// 7. lifecycle
onBeforeUnmount(() => {
  // 组件卸载时恢复 body 滚动
  restoreBodyScroll();
});
// 8. defineExpose
// （无对外暴露）
</script>

<style scoped>
/* Stepper 样式优化 - 使用 CSS 变量，无法用 Tailwind 替代 */
:deep(.van-stepper) {
  --van-stepper-input-font-size: 16px;
  --van-stepper-input-height: 32px;
  --van-stepper-input-width: 40px;
}
</style>
