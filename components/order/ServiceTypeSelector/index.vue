<template>
  <div class="mx-4 mb-4 bg-white rounded-lg shadow-md border border-gray-200">
    <div class="p-4">
      <!-- 服务类型选择器 -->
      <div class="mb-4">
        <div class="flex rounded-full bg-gray-100 p-1">
          <button
            v-for="type in serviceTypes"
            :key="type.value"
            @click="handleTypeSelect(type.value)"
            :class="[
              'flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all duration-200',
              modelValue === type.value 
                ? 'text-white shadow-md transform scale-105' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
            :style="modelValue === type.value ? { backgroundColor: '#007aff' } : {}"
          >
            <div>{{ type.label }}</div>
          </button>
        </div>
      </div>

      <!-- 对应的服务内容 -->
      <div v-if="modelValue === 'dine-in'">
        <div class="flex items-center mb-3">
          <div class="w-1 h-4 rounded mr-2" style="background-color: #007aff"></div>
          <span class="text-base font-medium">请选择餐桌</span>
        </div>
        <TableSelectionContent v-model:selectedTable="selectedTable" />
      </div>
      
      <div v-if="modelValue === 'pickup'">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-1 h-4 rounded mr-2" style="background-color: #007aff"></div>
            <span class="text-base font-medium">自提信息</span>
          </div>
          <van-button 
            size="small" 
            plain
            @click="handleAddContact"
          >
            新增联系人
          </van-button>
        </div>
        <PickupInfoContent ref="pickupInfoRef" />
      </div>
      
      <div v-if="modelValue === 'delivery'">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-1 h-4 rounded mr-2" style="background-color: #007aff"></div>
            <span class="text-base font-medium">收货地址</span>
          </div>
          <van-button 
            size="small" 
            plain
            @click="handleAddAddress"
          >
            新增地址
          </van-button>
        </div>
        <DeliveryAddressContent ref="deliveryAddressRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ServiceTypeSelector">
import TableSelectionContent from './TableSelectionContent.vue'
import PickupInfoContent from './PickupInfoContent.vue'
import DeliveryAddressContent from './DeliveryAddressContent.vue'

type ServiceType = "dine-in" | "pickup" | "delivery"

interface ServiceTypeConfig {
  value: ServiceType
  label: string
}

// Props
interface Props {
  modelValue: ServiceType
  selectedTable?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "delivery",
  selectedTable: ""
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: ServiceType): void
  (e: 'update:selectedTable', value: string): void
  (e: 'change', value: ServiceType): void
  (e: 'add-contact'): void
  (e: 'add-address'): void
}

const emit = defineEmits<Emits>()

// 服务类型配置
const serviceTypes: ServiceTypeConfig[] = [
  { value: "dine-in", label: "堂食" },
  { value: "pickup", label: "自提" },
  { value: "delivery", label: "外送" },
]

// 组件引用
const pickupInfoRef = ref()
const deliveryAddressRef = ref()

// 选中的餐桌
const selectedTable = computed({
  get: () => props.selectedTable,
  set: (value: string) => emit('update:selectedTable', value)
})

// 处理类型选择
const handleTypeSelect = (type: ServiceType) => {
  emit('update:modelValue', type)
  emit('change', type)
}

// 处理添加联系人
const handleAddContact = () => {
  if (pickupInfoRef.value?.openAddForm) {
    pickupInfoRef.value.openAddForm()
  } else {
    emit('add-contact')
  }
}

// 处理添加地址
const handleAddAddress = () => {
  if (deliveryAddressRef.value?.openAddForm) {
    deliveryAddressRef.value.openAddForm()
  } else {
    emit('add-address')
  }
}
</script>

<style scoped>
/* 移除默认按钮样式 */
button {
  background: transparent;
  border: none;
}
</style> 