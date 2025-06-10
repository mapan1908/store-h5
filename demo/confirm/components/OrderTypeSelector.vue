<template>
  <view v-if="orderTypeList.length > 0" class="bg-white p-3 mb-2.5 rounded-lg shadow-md">
    <view class="flex justify-center bg-[#f5f5f5] rounded-[50rpx] p-0 border border-[#eee]">
      <view
        v-for="(orderType, index) in orderTypeList"
        :key="orderType.value"
        class="flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-[50rpx] min-h-[70rpx] text-center relative border border-transparent transition-all duration-300 ease-in-out"
        :class="{
          'bg-[#f26649] shadow-[0_2rpx_6rpx_rgba(242,102,73,0.2)] !border-[#f26649]':
            activeTab === index && !orderType.disabled, // Use !border to ensure precedence
          'bg-transparent': activeTab !== index || orderType.disabled,
          'opacity-50 cursor-not-allowed': orderType.disabled,
        }"
        @click="!orderType.disabled && handleSelect(index)"
      >
        <text
          class="block text-[28rpx] font-bold leading-tight transition-colors duration-300 ease-in-out"
          :class="activeTab === index && !orderType.disabled ? 'text-white' : 'text-[#555]'"
        >
          {{ orderType.label }}
        </text>
        <text
          v-if="orderType.time && orderType.time.length > 0"
          class="block text-[20rpx] mt-0.5 whitespace-nowrap leading-tight transition-colors duration-300 ease-in-out"
          :class="
            activeTab === index && !orderType.disabled
              ? 'text-[rgba(255,255,255,0.8)]'
              : 'text-[#888]'
          "
        >
          {{ orderType.time[0] }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  orderTypeList: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(0)

// Temporary logs for debugging
watch(
  () => props.orderTypeList,
  (newVal) => {
    console.log(
      'OrderTypeSelector.vue: props.orderTypeList updated',
      JSON.parse(JSON.stringify(newVal)),
    )
  },
  { deep: true, immediate: true },
)

watch(
  () => props.modelValue,
  (newVal) => {
    console.log('OrderTypeSelector.vue: props.modelValue updated', newVal)
  },
  { immediate: true },
)

watch(
  activeTab,
  (newVal) => {
    console.log('OrderTypeSelector.vue: activeTab updated', newVal)
  },
  { immediate: true },
)
// End temporary logs

// Convert modelValue (string like 'dine_in') to tab index
const findTabIndexByValue = (value) => {
  if (!value) return 0 // Default to first tab if no value
  const index = props.orderTypeList.findIndex((t) => t.value === value)
  return index > -1 ? index : 0 // Default to first tab if value not found
}

// Convert tab index to modelValue (string like 'dine_in')
const findValueByTabIndex = (index) => {
  // Ensure index is within bounds
  if (index >= 0 && index < props.orderTypeList.length) {
    return props.orderTypeList[index]?.value || null
  }
  return null // Or return first item's value as a fallback: props.orderTypeList[0]?.value || null
}

// Initialize activeTab based on modelValue or ensure it's valid when orderTypeList changes
watch(
  () => [props.modelValue, props.orderTypeList],
  ([newValue, newOrderTypeList]) => {
    if (newOrderTypeList && newOrderTypeList.length > 0) {
      activeTab.value = findTabIndexByValue(newValue)
    } else {
      activeTab.value = 0 // Reset if list is empty
    }
  },
  { immediate: true, deep: true }, // deep: true for orderTypeList if its contents might change without replacement
)

// When tab changes, emit the new string value
const handleSelect = (index) => {
  // Check if the selected order type is disabled
  if (props.orderTypeList[index]?.disabled) {
    return // Do nothing if disabled
  }
  activeTab.value = index
  const newSelectedValue = findValueByTabIndex(index)
  if (newSelectedValue !== null) {
    // Only emit if a valid value is found
    emit('update:modelValue', newSelectedValue)
  }
}
</script>

<style scoped>
/* Minimal scoped styles */
</style>
