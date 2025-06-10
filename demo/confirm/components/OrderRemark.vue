<template>
  <view class="bg-white p-4 mb-2.5 rounded-lg shadow-md">
    <!-- New title style -->
    <view class="flex items-center mb-3">
      <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
      <text class="text-base font-semibold text-gray-800">备注</text>
    </view>
    <textarea
      v-model="orderRemark"
      placeholder="请输入备注信息"
      class="w-full h-20 p-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
      maxlength="100"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useOrderStore } from '@/stores/order' // 确保路径正确

const orderStore = useOrderStore()

const orderRemark = computed({
  get: () => orderStore.remark,
  set: (value) => {
    orderStore.setRemark(value)
  },
})
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
textarea {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
}
</style>
