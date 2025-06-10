<template>
  <div class="space-y-4">
    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-4">
      <van-loading />
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>
    
    <!-- 地址列表 -->
    <div v-else-if="displayAddresses && displayAddresses.length > 0" class="space-y-3">
      <!-- 显示的地址列表 -->
      <div
        v-for="contact in visibleAddresses"
        :key="contact.contact_id"
        @click="selectAddress(contact)"
        :class="[
          'p-4 rounded-lg border cursor-pointer transition-colors',
          currentSelectedAddressId === contact.contact_id
            ? 'border-blue-500 text-white'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        ]"
        :style="currentSelectedAddressId === contact.contact_id ? { backgroundColor: '#007aff' } : {}"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ contact.contact_name }}</span>
              <van-tag v-if="contact.is_default" type="primary">默认</van-tag>
            </div>
            <div class="text-sm mt-1" :class="currentSelectedAddressId === contact.contact_id ? 'text-white' : 'text-gray-600'">
              {{ contact.contact_phone }}
            </div>
            <div class="text-sm mt-1" :class="currentSelectedAddressId === contact.contact_id ? 'text-white' : 'text-gray-600'">
              {{ contact.delivery_area }} {{ contact.address_detail }}
            </div>
          </div>
          <div class="flex gap-2">
            <van-button
              v-if="!contact.is_default"
              size="mini"
              plain
              @click.stop="setAsDefault(contact.contact_id)"
              :loading="defaultLoading === contact.contact_id"
            >
              设为默认
            </van-button>
            <van-button
              size="mini"
              plain
              @click.stop="editAddress(contact)"
            >
              编辑
            </van-button>
            <van-button
              size="mini"
              plain
              type="danger"
              @click.stop="deleteAddress(contact.contact_id)"
              :loading="deleteLoading === contact.contact_id"
            >
              删除
            </van-button>
          </div>
        </div>
      </div>

      <!-- 折叠/展开按钮 -->
      <div v-if="displayAddresses.length > 1" class="text-center">
        <van-button 
          size="small" 
          plain 
          type="primary"
          @click="toggleExpanded"
        >
          {{ isExpanded ? '收起' : `查看全部 (${displayAddresses.length}个)` }}
          <van-icon :name="isExpanded ? 'arrow-up' : 'arrow-down'" class="ml-1" />
        </van-button>
      </div>
    </div>
    
    <!-- 无地址状态 -->
    <div v-else class="text-center py-8 text-gray-500">
      <div class="mb-4">暂无配送地址</div>
      <van-button type="primary" size="small" @click="showAddForm = true">
        添加地址
      </van-button>
    </div>
     <!-- 配送支持提示 - 卡片尾部 -->
     <div 
      class="mt-4 p-3 text-sm text-gray-600 text-start border-t border-gray-100"
      style="background-color: #f0f0f0; margin: 0 -16px -16px -16px;"
    >
      *本店仅支持配送至：{{ deliveryAreas.join('、') }}
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <van-popup
      v-model:show="showAddForm"
      position="bottom"
      round
      closeable
      close-on-popstate
    >
      <div class="p-4">
        <h3 class="text-lg font-medium mb-4">{{ isEditing ? '编辑地址' : '新增地址' }}</h3>
        <van-form @submit="handleSubmit">
          <van-field
            v-model="formData.contact_name"
            name="contact_name"
            label="联系人姓名"
            placeholder="请输入联系人姓名"
            :rules="[{ required: true, message: '请输入联系人姓名' }]"
          />
          <van-field
            v-model="formData.contact_phone"
            name="contact_phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]"
          />
          
          <!-- 配送区域选择 -->
          <van-field 
            name="delivery_area" 
            label="配送区域"
            :rules="[{ required: true, message: '请选择配送区域' }]"
          >
            <template #input>
              <div class="space-y-2 w-full">
                <div
                  v-for="area in deliveryAreas"
                  :key="area"
                  @click="selectDeliveryArea(area)"
                  :class="[
                    'p-3 rounded-lg border cursor-pointer text-center transition-colors',
                    formData.delivery_area === area
                      ? 'text-white border-blue-500'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  ]"
                  :style="formData.delivery_area === area ? { backgroundColor: '#007aff' } : {}"
                >
                  {{ area }}
                </div>
              </div>
            </template>
          </van-field>
          
          <van-field
            v-model="formData.address_detail!"
            name="address_detail"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请输入详细地址' }]"
          />
          
          <van-field name="is_default">
            <template #label>
              <span>设为默认地址</span>
            </template>
            <template #input>
              <van-checkbox v-model="formData.is_default" />
            </template>
          </van-field>
          
          <div class="mt-6 flex gap-3">
            <van-button 
              block 
              type="primary" 
              native-type="submit"
              :loading="submitLoading"
            >
              {{ isEditing ? '更新' : '保存' }}
            </van-button>
            <van-button 
              block 
              @click="cancelEdit"
            >
              取消
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

   
  </div>
</template>

<script setup lang="ts" name="DeliveryAddressContent">
import type { Contact, CreateContactBody, UpdateContactBody } from '~/types/api/contact'

// Props
interface Props {
  selectedAddressId?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedAddressId: undefined
})

// Emits
interface Emits {
  (e: 'update:selectedAddressId', value: number): void
  (e: 'address-selected', contact: Contact): void
}

const emit = defineEmits<Emits>()

// Stores
const userStore = useUserStore()
const appStore = useAppStore()
const currentUserId = computed(() => userStore.getUserInfo?.userId)
const currentStoreCode = computed(() => appStore.getCurrentStoreCode)

// 响应式数据
const showAddForm = ref(false)
const submitLoading = ref(false)
const defaultLoading = ref<number | null>(null)
const deleteLoading = ref<number | null>(null)
const isEditing = ref(false)
const editingAddressId = ref<number | null>(null)
const isExpanded = ref(false)

// 表单数据
const formData = ref<CreateContactBody & { contact_id?: number }>({
  contact_name: '',
  contact_phone: '',
  delivery_area: '',
  address_detail: '',
  is_default: false
})

// 配送区域选项
const deliveryAreas = ['万景城', '保利叶语']

// 获取联系人列表
const { data: contacts, pending, error, refresh } = await useFetch<Contact[]>(
  () => `/api/users/${currentUserId.value}/contacts`,
  {
    default: () => [],
    server: false,
    watch: [currentUserId]
  }
)

// 过滤当前门店有地址信息的联系人
const displayAddresses = computed(() => {
  if (!contacts.value || !currentStoreCode.value) return []
  
  return contacts.value.filter(contact => {
    // 必须有地址信息且属于当前门店
    const hasAddress = contact.delivery_area && contact.address_detail
    const belongsToStore = contact.store_code === currentStoreCode.value || contact.store_code === null
    return hasAddress && belongsToStore
  })
})

// 智能选中地址逻辑
const autoSelectedAddressId = computed(() => {
  if (!displayAddresses.value.length) return undefined
  
  // 优先选择默认地址
  const defaultAddress = displayAddresses.value.find(addr => addr.is_default)
  if (defaultAddress) {
    return defaultAddress.contact_id
  }
  
  // 如果没有默认地址，选择第一个
  return displayAddresses.value[0].contact_id
})

// 当前选中的地址ID
const currentSelectedAddressId = computed(() => {
  return props.selectedAddressId || autoSelectedAddressId.value
})

// 监听自动选中变化，通知父组件
watch(autoSelectedAddressId, (newId) => {
  if (newId && !props.selectedAddressId) {
    // 只有当父组件没有明确指定选中地址时，才自动选中
    const selectedAddress = displayAddresses.value.find(addr => addr.contact_id === newId)
    if (selectedAddress) {
      emit('update:selectedAddressId', newId)
      emit('address-selected', selectedAddress)
    }
  }
}, { immediate: true })

// 可见的地址列表（折叠控制）
const visibleAddresses = computed(() => {
  if (!displayAddresses.value.length) return []
  
  if (isExpanded.value) {
    return displayAddresses.value
  } else {
    // 默认只显示第一个（默认地址优先）
    const defaultAddress = displayAddresses.value.find(c => c.is_default)
    if (defaultAddress) {
      return [defaultAddress]
    } else {
      return displayAddresses.value.slice(0, 1)
    }
  }
})

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 选择地址
const selectAddress = (contact: Contact) => {
  emit('update:selectedAddressId', contact.contact_id)
  emit('address-selected', contact)
}

// 选择配送区域
const selectDeliveryArea = (area: string) => {
  formData.value.delivery_area = area
}

// 设为默认地址
const setAsDefault = async (contactId: number) => {
  if (!currentUserId.value) return
  
  defaultLoading.value = contactId
  try {
    await $fetch(`/api/users/${currentUserId.value}/contacts/${contactId}/default`, {
      method: 'PUT'
    })
    
    await refresh()
    showToast('已设为默认地址')
  } catch (err: any) {
    showToast(err.message || '设置失败')
  } finally {
    defaultLoading.value = null
  }
}

// 编辑地址
const editAddress = (contact: Contact) => {
  isEditing.value = true
  editingAddressId.value = contact.contact_id
  formData.value = {
    contact_id: contact.contact_id,
    contact_name: contact.contact_name,
    contact_phone: contact.contact_phone,
    delivery_area: contact.delivery_area || '',
    address_detail: contact.address_detail || '',
    is_default: contact.is_default
  }
  showAddForm.value = true
}

// 删除地址
const deleteAddress = async (contactId: number) => {
  if (!currentUserId.value) return
  
  deleteLoading.value = contactId
  try {
    await $fetch(`/api/users/${currentUserId.value}/contacts/${contactId}`, {
      method: 'DELETE'
    })
    
    await refresh()
    showToast('地址已删除')
  } catch (err: any) {
    showToast(err.message || '删除失败')
  } finally {
    deleteLoading.value = null
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!currentUserId.value || !currentStoreCode.value) return
  
  submitLoading.value = true
  try {
    if (isEditing.value && editingAddressId.value) {
      // 更新地址
      const updateData: UpdateContactBody = {
        contact_name: formData.value.contact_name,
        contact_phone: formData.value.contact_phone,
        delivery_area: formData.value.delivery_area || null,
        address_detail: formData.value.address_detail || null,
        is_default: formData.value.is_default
      }
      
      await $fetch(`/api/users/${currentUserId.value}/contacts/${editingAddressId.value}`, {
        method: 'PUT',
        body: updateData
      })
      
      showToast('地址更新成功')
    } else {
      // 新增地址（自动设置当前门店代码）
      const createData: CreateContactBody = {
        contact_name: formData.value.contact_name,
        contact_phone: formData.value.contact_phone,
        delivery_area: formData.value.delivery_area || undefined,
        address_detail: formData.value.address_detail || undefined,
        is_default: formData.value.is_default,
        store_code: currentStoreCode.value || undefined // 设置当前门店代码
      }
      
      await $fetch(`/api/users/${currentUserId.value}/contacts`, {
        method: 'POST',
        body: createData
      })
      
      showToast('地址添加成功')
    }
    
    // 重置表单并关闭弹窗
    cancelEdit()
    await refresh()
  } catch (err: any) {
    showToast(err.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  showAddForm.value = false
  isEditing.value = false
  editingAddressId.value = null
  formData.value = {
    contact_name: '',
    contact_phone: '',
    delivery_area: '',
    address_detail: '',
    is_default: false
  }
}

// 打开新增表单
const openAddForm = () => {
  cancelEdit() // 重置状态
  showAddForm.value = true
}

// 暴露方法给父组件
defineExpose({
  openAddForm
})
</script>

<style scoped>
.van-popup {
  border-radius: 16px 16px 0 0;
}
</style> 