<template>
  <div class="space-y-4">
    <div v-if="pending" class="text-center py-4">
      <van-loading />
    </div>
    
    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>
    
    <div v-else>
      <div v-for="area in tableAreas" :key="area || '未分区'">
        <h3 class="font-medium mb-3">{{ area || '未分区' }}</h3>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="table in getTablesByArea(area)"
            :key="table.table_id"
            @click="selectTable(table.table_id.toString())"
            :disabled="table.status !== 'available'"
            :class="[
              'p-3 rounded-lg border text-left transition-colors text-xs',
              selectedTable === table.table_id.toString()
                ? 'border-blue-500 text-white'
                : table.status === 'available'
                ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                : 'border-gray-300 bg-gray-200 cursor-not-allowed opacity-60'
            ]"
            :style="selectedTable === table.table_id.toString() ? { backgroundColor: '#007aff' } : {}"
          >
            <div class="font-medium">{{ table.table_name }}</div>
            <div class="text-xs opacity-75">容纳: {{ table.capacity }}人</div>
            <div :class="[
              'text-xs',
              table.status === 'available' 
                ? selectedTable === table.table_id.toString() ? 'text-white' : 'text-green-600'
                : table.status === 'occupied' 
                ? 'text-red-600' 
                : 'text-yellow-600'
            ]">
              状态: {{ getStatusText(table.status) }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="TableSelectionContent">
import type { PublicTable, TableStatus } from '~/types/api/table'

// Props
interface Props {
  selectedTable?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedTable: ""
})

// Emits
interface Emits {
  (e: 'update:selectedTable', value: string): void
}

const emit = defineEmits<Emits>()

// 获取当前门店代码
const appStore = useAppStore()
const storeCode = appStore.getCurrentStoreCode

// 获取餐桌数据
const { data: tables, pending, error } = await useFetch<PublicTable[]>(`/api/stores/${storeCode}/tables`, {
  default: () => []
})

// 计算属性
const tableAreas = computed(() => {
  if (!tables.value) return []
  return [...new Set(tables.value.map(table => table.area_name))]
})

const selectedTable = computed(() => props.selectedTable)

// 方法
const getTablesByArea = (area: string | null) => {
  if (!tables.value) return []
  return tables.value.filter(table => table.area_name === area)
}

const selectTable = (tableId: string) => {
  emit('update:selectedTable', tableId)
}

const getStatusText = (status: TableStatus): string => {
  switch (status) {
    case 'available':
      return '空闲'
    case 'occupied':
      return '占用'
    case 'reserved':
      return '预订'
    default:
      return '未知'
  }
}
</script>

<style scoped>
button {
  background: transparent;
  border: none;
}

button:disabled {
  cursor: not-allowed;
}
</style> 