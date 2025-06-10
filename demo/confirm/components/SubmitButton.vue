<template>
  <view class="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-top z-1 flex items-center">
    <view class="text-left flex-1">
      <text class="text-sm text-gray-600">合计:</text>
      <text class="text-xl font-bold text-red-500">¥{{ storeCalculatedTotal.toFixed(2) }}</text>
    </view>
    <button
      class="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-full text-sm transition-colors duration-150 ease-in-out ml-auto"
      :disabled="storeIsSubmitting"
      @click="handleLocalSubmit"
    >
      {{ storeIsSubmitting ? '提交中...' : '提交订单' }}
    </button>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

const storeCalculatedTotal = computed(() => orderStore.calculatedTotal)
const storeIsSubmitting = computed(() => orderStore.isSubmitting)

const emit = defineEmits(['requestSubmit'])

const handleLocalSubmit = () => {
  if (storeIsSubmitting.value) return
  // Emit an event to the parent to handle the actual submission with storeCode
  emit('requestSubmit')
}
</script>

<style scoped>
.shadow-top {
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
