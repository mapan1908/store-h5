<template>
  <div
    class="bg-white px-4 py-2 flex items-center justify-between w-full h-[48px]"
    style="min-width: 100%; box-sizing: border-box"
  >
    <!-- 左侧：购物车信息区域，点击切换详情显示 -->
    <div
      class="flex items-center flex-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
      style="max-width: calc(100% - 100px); overflow: hidden"
      @click="handleToggleDetail"
    >
      <div class="mr-3">
        <van-icon name="cart-o" size="22" class="text-gray-600" />
      </div>
      <div class="flex items-baseline space-x-2">
        <div class="flex items-baseline text-orange-500 font-bold">
          <span class="text-sm">¥</span>
          <span class="text-lg">{{ Math.floor(Number(totalPrice) || 0) }}</span>
          <span class="text-sm"
            >.{{ ((Number(totalPrice) || 0) % 1).toFixed(2).slice(2) }}</span
          >
        </div>
        <div class="text-xs text-gray-500">共{{ totalCount }}件</div>
      </div>
    </div>

    <!-- 右侧：结算按钮 -->
    <div
      class="checkout-btn-wrapper"
      style="position: relative; right: 0; flex-shrink: 0"
    >
      <van-button
        type="primary"
        size="small"
        round
        class="checkout-btn"
        :disabled="totalCount === 0"
        @click="handleCheckout"
      >
        <span class="checkout-btn-text">选好了</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. import
import { computed } from "vue";
import { useCartStore } from "~/stores/cart";

// 2. defineProps / defineEmits
const props = defineProps({
  totalCount: Number,
});
const emit = defineEmits(["checkout", "toggle-detail"]);

// 3. refs / reactives
const cartStore = useCartStore();

// 4. computed
const totalPrice = computed(() => cartStore.totalPriceYuan);
const totalCount = computed(() => cartStore.totalItemsCount);

// 6. 函数区
const handleCheckout = (e: Event) => {
  e.stopPropagation();
  emit("checkout");
};

const handleToggleDetail = (e: Event) => {
  e.stopPropagation();
  emit("toggle-detail");
};
</script>

<style scoped>
/* 确保按钮容器不被UnoCSS压缩 */
.checkout-btn-wrapper {
  min-width: 92px !important;
  width: 92px !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: 8px !important;
  position: relative !important;
  z-index: 10 !important;
}

/* 主按钮样式 - 使用最高优先级确保不被UnoCSS覆盖 */
.checkout-btn-wrapper :deep(.checkout-btn.van-button) {
  background: #1989fa !important;
  background-color: #1989fa !important;
  border: 1px solid #1989fa !important;
  border-color: #1989fa !important;
  color: white !important;
  font-weight: 500 !important;
  border-radius: 16px !important;
  min-width: 88px !important;
  width: 88px !important;
  height: 32px !important;
  padding: 0 10px !important;
  margin: 0 !important;
  font-size: 14px !important;
  line-height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  text-align: center !important;
  vertical-align: middle !important;
  position: relative !important;
  overflow: visible !important;
  white-space: nowrap !important;
}

/* 确保按钮内容不被截断 */
.checkout-btn-wrapper :deep(.van-button__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  white-space: nowrap !important;
  overflow: visible !important;
}

/* 按钮文字样式 */
.checkout-btn-wrapper :deep(.checkout-btn-text) {
  display: inline-block !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: white !important;
  line-height: 1 !important;
  position: relative !important;
  z-index: 1 !important;
}

/* 覆盖van-button的默认文字样式 */
.checkout-btn-wrapper :deep(.van-button__text) {
  display: inline-block !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

/* 禁用状态样式 */
.checkout-btn-wrapper :deep(.checkout-btn.van-button:disabled) {
  background: #c8c9cc !important;
  background-color: #c8c9cc !important;
  border-color: #c8c9cc !important;
  color: white !important;
  opacity: 0.6 !important;
}

.checkout-btn-wrapper
  :deep(.checkout-btn.van-button:disabled .checkout-btn-text) {
  color: white !important;
}

.checkout-btn-wrapper
  :deep(.checkout-btn.van-button:disabled .van-button__text) {
  color: white !important;
}

/* 激活状态样式 */
.checkout-btn-wrapper :deep(.checkout-btn.van-button:active) {
  background: #0570e6 !important;
  background-color: #0570e6 !important;
  border-color: #0570e6 !important;
}

/* 防止UnoCSS样式覆盖按钮内容 */
.checkout-btn-wrapper :deep(.checkout-btn.van-button *) {
  color: white !important;
}

/* 额外保护，确保文字显示 */
.checkout-btn-wrapper :deep(.van-button) {
  overflow: visible !important;
}

.checkout-btn-wrapper :deep(.van-button .van-button__content) {
  overflow: visible !important;
}
</style>
