<route lang="json5">
{
  path: 'pages/order/confirm/OrderConfirmPage',
  style: { navigationBarTitleText: '', navigationStyle: 'custom' },
}
</route>
<template>
  <div class="order-confirm-page bg-[#f7f7f7] min-h-screen pb-[80px]">
    <!-- Global notifications like toast/messagebox would need a unocss-friendly solution if still needed -->
    <div v-if="isLoadingStore" class="p-4 text-center text-gray-500">
      <!-- Basic loading indicator, can be enhanced with UnoCSS animations or icons -->
      <div class="animate-pulse">正在加载门店信息...</div>
    </div>
    <div v-else-if="isStoreError" class="p-4 m-4 bg-red-100 text-red-700 rounded-md">
      加载门店信息失败: {{ storeLoadingError?.message }}
    </div>
    <template v-else>
      <!-- Changed horizontal padding to px-3 -->
      <div class="px-3 py-1">
        <OrderTypeSelector
          v-if="availableOrderTypes.length > 0"
          v-model="selectedOrderTypeValue"
          :order-type-list="availableOrderTypes"
        />

        <TableInfo v-if="orderStore.selectedOrderType?.value === 'dine_in'" />
        <PickupInfo v-if="orderStore.selectedOrderType?.value === 'pickup'" />
        <DeliveryInfo v-if="orderStore.selectedOrderType?.value === 'delivery'" />

        <ProductList />
        <!-- <PaymentMethod /> -->

        <OrderSummary
          v-if="orderStore.selectedOrderType"
          :order-type="orderStore.selectedOrderType"
        />
        <OrderRemark />
      </div>
      <SubmitButton @request-submit="handleActualSubmit" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/order'

defineOptions({ name: 'OrderConfirmPage' })

import TableInfo from './components/TableInfo.vue'
import OrderTypeSelector from './components/OrderTypeSelector.vue'
import PickupInfo from './components/PickupInfo.vue'
import DeliveryInfo from './components/DeliveryInfo.vue'
import ProductList from './components/ProductList.vue'
// import PaymentMethod from './components/PaymentMethod.vue'
import OrderSummary from './components/OrderSummary.vue'
import OrderRemark from './components/OrderRemark.vue'
import SubmitButton from './components/SubmitButton.vue'
import useStore from '@/hooks/store/useStore' // Import useStore
import { useAppStore } from '@/stores/app' // Import app store

const orderStore = useOrderStore()
const appStore = useAppStore() // Get app store instance

const {
  config: storeConfig,
  isLoading: isLoadingStore,
  isError: isStoreError,
  error: storeLoadingError,
  currentActiveStoreCode, // Access the reactive store code from useStore
} = useStore()

// 1. Available order types (array of objects)
const availableOrderTypes = computed(() => storeConfig.value?.order_type || [])

// 2. Selected order type VALUE (e.g., 'dine_in', string or null)
const selectedOrderTypeValue = ref(null)

// Watch for changes in availableOrderTypes to set an initial default value
// and update the store if the current selection becomes invalid or is initially null.
watch(
  availableOrderTypes,
  (newTypes) => {
    if (!isLoadingStore.value && newTypes && newTypes.length > 0) {
      const currentSelectionIsValid = newTypes.some((t) => t.value === selectedOrderTypeValue.value)
      if (!selectedOrderTypeValue.value || !currentSelectionIsValid) {
        selectedOrderTypeValue.value = newTypes[0].value
      }
    } else if (!isLoadingStore.value) {
      selectedOrderTypeValue.value = null
      orderStore.setSelectedOrderType(null)
    }
  },
  { immediate: true, deep: true },
)

// Watch for changes in the local selectedOrderTypeValue (from OrderTypeSelector)
// and update the Pinia store with the full object.
watch(
  selectedOrderTypeValue,
  (newValue) => {
    if (newValue && availableOrderTypes.value.length > 0) {
      const foundTypeObject = availableOrderTypes.value.find((type) => type.value === newValue)
      if (foundTypeObject) {
        orderStore.setSelectedOrderType(foundTypeObject)
        console.log(
          'index.vue: orderStore.selectedOrderType updated',
          JSON.parse(JSON.stringify(foundTypeObject)),
        )
      } else {
        orderStore.setSelectedOrderType(null)
      }
    } else if (!newValue) {
      orderStore.setSelectedOrderType(null)
    }
  },
  { immediate: true },
)

// Temporary logs for debugging (can be removed later)
watch(
  () => orderStore.selectedOrderType,
  (newVal) => {
    console.log(
      'index.vue: orderStore.selectedOrderType from store watcher',
      JSON.parse(JSON.stringify(newVal)),
    )
  },
  { deep: true, immediate: true },
)

const handleActualSubmit = async () => {
  // Use the reactive storeCode from appStore or the one exposed by useStore
  const actualStoreCode = currentActiveStoreCode.value || appStore.getCurrentStoreCode

  if (!actualStoreCode) {
    console.error('index.vue: Store code is missing, cannot submit order.')
    uni.showToast({
      title: '门店信息丢失，无法提交订单。',
      icon: 'none',
    })
    return
  }

  console.log(`index.vue: handleActualSubmit called. Store Code: ${actualStoreCode}`)
  const result = await orderStore.submitOrder(actualStoreCode)

  if (result.success && result.data) {
    const orderId = result.data.orderId
    const payableAmount = result.data.payableAmount

    if (orderId && typeof payableAmount === 'number') {
      console.log(
        `index.vue: Order submission successful. Navigating with Order ID: ${orderId}, Payable Amount: ${payableAmount}`,
      )
      uni.redirectTo({
        url: `/pages/payment/PaymentIndexPage?orderId=${orderId}&payableAmount=${payableAmount}`,
      })
    } else {
      console.error(
        'index.vue: Extracted orderId or payableAmount is missing or invalid after accessing result.data.data.',
        {
          extractedOrderId: orderId,
          extractedPayableAmount: payableAmount,
          fullResponseDataFromStore: result.data,
        },
      )
      uni.showToast({
        title: '订单关键信息解析失败，无法跳转支付。',
        icon: 'none',
      })
    }
  } else {
    console.error(
      'index.vue: Order submission failed, or result.data or result.data.data is missing.',
      result,
    )
    if (!(result.success && result.data)) {
      uni.showToast({
        title: result.error || '订单提交失败或数据异常。',
        icon: 'none',
      })
    }
  }
}
</script>

<style scoped></style>
