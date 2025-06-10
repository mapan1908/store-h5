<template>
  <view class="bg-white p-4 mb-2.5 rounded-lg shadow-md">
    <view class="flex items-center mb-3">
      <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
      <text class="text-base font-semibold text-gray-800">订单信息</text>
    </view>

    <view class="flex justify-between items-center py-1.5">
      <text class="text-sm text-gray-700">商品金额</text>
      <!-- Assuming totalPriceYuan is a ref or computed from useCart, access .value -->
      <!-- Added Number() and toFixed(2) for consistent display -->
      <text class="text-sm text-gray-800">¥{{ (Number(totalPriceYuan) || 0).toFixed(2) }}</text>
    </view>

    <view
      v-if="props.orderType && props.orderType.packaging_fee > 0"
      class="flex justify-between items-center py-1.5"
    >
      <text class="text-sm text-gray-700">打包费</text>
      <text class="text-sm text-gray-800">
        ¥{{ (Number(props.orderType.packaging_fee / 100) || 0).toFixed(2) }}
      </text>
    </view>

    <view
      v-if="props.orderType && props.orderType.service_fee > 0"
      class="flex justify-between items-center py-1.5"
    >
      <text class="text-sm text-gray-700">服务费</text>
      <text class="text-sm text-gray-800">
        ¥{{ (Number(props.orderType.service_fee / 100) || 0).toFixed(2) }}
      </text>
    </view>

    <view
      v-if="
        props.orderType && props.orderType.value === 'delivery' && props.orderType.delivery_fee > 0
      "
      class="flex justify-between items-center py-1.5"
    >
      <text class="text-sm text-gray-700">配送费</text>
      <text class="text-sm text-gray-800">
        ¥{{ (Number(props.orderType.delivery_fee / 100) || 0).toFixed(2) }}
      </text>
    </view>

    <view class="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
      <text class="text-sm text-gray-700 font-medium">合计</text>
      <text class="text-lg font-semibold text-red-500">¥{{ calculatedTotal.toFixed(2) }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import useCart from '@/hooks/useCart' // Ensure this path is correct and useCart is set up

const { totalPriceYuan, totalPriceInCents } = useCart()

const props = defineProps({
  orderType: {
    // This is the selectedOrderTypeObject from the parent (index.vue)
    type: Object,
    required: true, // Parent's v-if="selectedOrderTypeObject" ensures this will be a valid object when component is rendered
    // Default is mainly for standalone testing or Storybook. Given parent's v-if, it's less critical for runtime.
    default: () => ({
      value: null, // e.g., 'dine_in', 'pickup', 'delivery'
      packaging_fee: 0,
      service_fee: 0,
      delivery_fee: 0,
      // include other properties that might be accessed if needed by this component,
      // though currently only the ones above and 'value' are used.
    }),
  },
})

// No 'watch' related to 'activeTab' or 'findTabIndexByValue' should be here.
// That logic belongs to the OrderTypeSelector, not the OrderSummary.

const calculatedTotal = computed(() => {
  // Start with product total. Add optional chaining for .value in case useCart could potentially
  // return a non-ref totalPriceYuan or if totalPriceYuan itself could be undefined initially.
  let total = Number(totalPriceInCents?.value) || 0

  // Add fees from the selected order type.
  // props.orderType is guaranteed to be an object here because of `required: true`
  // and the v-if condition in the parent component (index.vue).
  if (props.orderType) {
    console.log('props.orderType', props.orderType)
    // Add packaging fee if it's a positive number
    if (props.orderType.packaging_fee && props.orderType.packaging_fee > 0) {
      total += Number(props.orderType.packaging_fee) || 0
    }

    // Add service fee if it's a positive number
    if (props.orderType.service_fee && props.orderType.service_fee > 0) {
      total += Number(props.orderType.service_fee) || 0
    }

    // Add delivery fee only if order type is 'delivery' and fee is positive
    if (
      props.orderType.value === 'delivery' &&
      props.orderType.delivery_fee &&
      props.orderType.delivery_fee > 0
    ) {
      total += Number(props.orderType.delivery_fee) || 0
    }
  }

  return total / 100
})
</script>

<style scoped>
/* Minimal scoped styles if using a utility-first CSS framework like UnoCSS. */
/* Add specific styles here if needed. */
</style>
