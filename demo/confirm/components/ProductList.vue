<template>
  <view class="bg-white p-4 mb-2.5 rounded-lg shadow-md">
    <view class="flex items-center mb-3">
      <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
      <text class="text-base font-semibold text-gray-800">已选商品</text>
    </view>
    <view
      v-for="item in items"
      :key="item.id"
      class="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
    >
      <view class="flex-grow mr-4">
        <text class="block text-sm text-gray-800">{{ item.name }}</text>
        <text v-if="item.spec_name" class="block text-xs text-gray-500 mt-0.5">
          {{ item.spec_name }}
        </text>
      </view>
      <view class="flex-shrink-0 text-right">
        <text class="block text-xs text-gray-500">x{{ item.quantity }}</text>
        <text class="block text-sm text-gray-800 font-medium">
          ¥{{ (item.price / 100).toFixed(2) }}
        </text>
      </view>
    </view>
    <view class="flex justify-end items-center pt-3 mt-2 border-t border-gray-100">
      <text class="text-sm text-gray-700 mr-2">小计:</text>
      <text class="text-base font-semibold text-red-500">¥{{ totalPriceYuan }}</text>
    </view>
  </view>
</template>

<script setup>
import useCart from '@/hooks/useCart'

// WdCellGroup and WdCell should be auto-imported via easycom
const { items, totalPriceYuan } = useCart()

// The computed property _subtotal was using an undefined variable 'productItems'.
// It should likely use 'items' from the useCart() hook.
// Also, _subtotal is not currently used in the template. Commenting out for now.
/*
const _subtotal = computed(() => {
  // Ensure items is an array and has a value before reducing
  if (items.value && Array.isArray(items.value)) {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  return 0; // Default to 0 if items is not valid
});
*/

// Props might be used to pass productItems from parent
// defineProps({
//   productItems: {
//     type: Array,
//     default: () => []
//   }
// });
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
.last\:border-b-0:last-child {
  border-bottom-width: 0;
}
</style>
