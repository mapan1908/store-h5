<template>
  <view class="bg-white p-4 mb-2.5 rounded-lg shadow-md">
    <view class="flex items-center mb-3">
      <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
      <text class="text-base font-semibold text-gray-800">支付方式</text>
    </view>
    <view class="flex items-center">
      <!-- Example icon, replace with actual payment method icon if dynamic -->
      <!-- <i class="i-mdi-cash-multiple text-lg text-green-500 mr-2"></i> -->
      <view class="bg-orange-100 text-orange-600 text-sm px-3 py-1.5 rounded-md font-medium">
        {{ selectedPaymentMethod }}
      </view>
      <!-- If multiple payment methods, this could be a clickable area -->
      <!-- <i class="i-mdi-chevron-right text-gray-400 text-lg ml-auto"></i> -->
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
// WdCellGroup, WdCell, WdIcon should be auto-imported via easycom

// Placeholder data - replace with actual data from store or props
const selectedPaymentMethod = ref('现金') // Or could be an object { name: '现金', icon: 'rmb' }
// const canChangePaymentMethod = ref(false) // Set to true if user can click to change payment method

// Function to handle changing payment method (if applicable)
// const handleChangePaymentMethod = () => {
//   console.log('Change payment method clicked');
//   // Navigate to payment method selection page or show a popup
// };

// Props might be used to pass payment data from parent
// defineProps({
//   selectedPaymentMethod: {
//     type: String,
//     default: '在线支付'
//   }
// });
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
</style>
