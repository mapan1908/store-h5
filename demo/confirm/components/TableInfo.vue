<template>
  <view class="bg-white p-4 mb-2.5 rounded-lg shadow-md">
    <view class="flex items-center mb-3">
      <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
      <text class="text-base font-semibold text-gray-800">请选择餐桌</text>
    </view>

    <view v-if="isLoading" class="text-gray-500">正在加载餐桌...</view>
    <view v-else-if="isError" class="text-red-500">加载餐桌失败: {{ error?.message }}</view>
    <view v-else-if="groupedTables && Object.keys(groupedTables).length > 0">
      <view v-for="(areaTables, areaName) in groupedTables" :key="areaName" class="mb-4">
        <text class="block text-sm font-medium text-gray-700 mb-2">{{ areaName }}</text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="table in areaTables"
            :key="table.table_id"
            class="px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150 ease-in-out text-center min-w-[80px]"
            :class="[
              selectedTableId === table.table_id
                ? 'bg-[#FF6F00] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-50',
              table.status !== 'available' ? 'opacity-60 cursor-not-allowed' : '',
            ]"
            :style="table.status !== 'available' ? { pointerEvents: 'none' } : {}"
            @click="selectTable(table)"
          >
            <text class="block text-sm font-medium">{{ table.table_name }}</text>
            <text
              class="block text-xs text-gray-500 mt-0.5"
              :class="{ 'text-orange-100': selectedTableId === table.table_id }"
            >
              容纳: {{ table.capacity }}人
            </text>
            <text
              class="block text-xs mt-0.5"
              :class="{
                'text-green-100':
                  table.status === 'available' && selectedTableId === table.table_id,
                'text-green-600':
                  table.status === 'available' && selectedTableId !== table.table_id,
                'text-red-400': table.status !== 'available' && selectedTableId === table.table_id,
                'text-red-600': table.status !== 'available' && selectedTableId !== table.table_id,
              }"
            >
              状态:
              {{
                table.status === 'available'
                  ? '空闲'
                  : table.status === 'occupied'
                    ? '占用'
                    : table.status
              }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="text-gray-500">暂无可选择的餐桌</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import useTables from '@/hooks/store/useTables'
import { useAppStore } from '@/stores/app'
import type { Table } from '@/types/api/store' // Import the original Table type

const orderStore = useOrderStore()
const storeCode = useAppStore().getCurrentStoreInfo?.storeCode
const { tables, isLoading, isError, error } = useTables(storeCode)

const selectedTableId = ref<string | null>(null)

const groupedTables = computed(() => {
  if (!tables.value) return {}
  return tables.value.reduce(
    (acc, table) => {
      const area = table.area_name || '未分区'
      if (!acc[area]) {
        acc[area] = []
      }
      acc[area].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )
})

const selectTable = (table: Table) => {
  if (table.status !== 'available') {
    console.warn('Attempted to select an unavailable table:', table)
    // Optionally show a toast/notification to the user
    uni.showToast({
      title: `餐桌 ${table.table_name} 当前不可选`,
      icon: 'none',
    })
    return
  }
  if (!table || !table.table_id) {
    console.warn('Attempted to select an invalid table (missing id):', table)
    return
  }
  selectedTableId.value = table.table_id

  // Adjust data sent to Pinia store based on OrderDineInInfo type
  // For now, assuming it needs 'id' and 'name' based on previous context.
  // The linter error indicated 'capacity' is not in OrderDineInInfo.
  // We need to clarify what OrderDineInInfo expects for other fields like area_name, status.
  orderStore.setTableInfo({
    id: table.table_id, // Map to id
    name: table.table_name, // Map to name
    // capacity: table.capacity, // Causes linter error, OrderDineInInfo might not have this
    // area_name: table.area_name, // Check if OrderDineInInfo needs/has this
    // status: table.status, // Check if OrderDineInInfo needs/has this
  })
  console.log('Selected table & updated store:', orderStore.tableInfo)
}

const initializeSelection = () => {
  if (!tables.value || tables.value.length === 0 || Object.keys(groupedTables.value).length === 0)
    return

  // If there's a previously selected table in the store, try to restore it
  if (orderStore.tableInfo && orderStore.tableInfo.id) {
    // Assuming orderStore.tableInfo.id now stores table_id
    const previouslySelectedTable = tables.value.find((t) => t.table_id === orderStore.tableInfo.id)
    if (previouslySelectedTable && previouslySelectedTable.status === 'available') {
      selectedTableId.value = previouslySelectedTable.table_id
    } else {
      if (previouslySelectedTable)
        console.warn(
          'Previously selected table not found or unavailable, clearing from store and attempting default selection.',
        )
      else console.warn('Previously stored tableInfo.id not found in current tables list.')
      orderStore.setTableInfo(null)
      selectedTableId.value = null
      selectDefaultTable()
    }
  } else {
    selectDefaultTable()
  }
}

const selectDefaultTable = () => {
  if (!tables.value || tables.value.length === 0) return

  // Try to select a default table that is available
  // First, attempt specific ID '2' if available, then the first available table in the list
  let defaultTableToSelect = tables.value.find(
    (t) => t.table_id === '2' && t.status === 'available',
  )

  if (!defaultTableToSelect) {
    defaultTableToSelect = tables.value.find((t) => t.status === 'available')
  }

  if (defaultTableToSelect) {
    selectTable(defaultTableToSelect)
  } else {
    console.warn('No available tables to select as default.')
    selectedTableId.value = null // Ensure nothing is selected if no tables are available
  }
}

watch(
  tables,
  (newTables) => {
    if (newTables && newTables.length > 0) {
      initializeSelection()
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (!isLoading.value && tables.value && tables.value.length > 0 && !selectedTableId.value) {
    initializeSelection()
  }
})
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
</style>
