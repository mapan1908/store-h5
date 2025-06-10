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
    
    <!-- 联系人列表 -->
    <div v-else-if="displayContacts && displayContacts.length > 0" class="space-y-3">
      <!-- 显示的联系人列表 -->
      <div
        v-for="contact in visibleContacts"
        :key="contact.contact_id"
        @click="selectContact(contact)"
        :class="[
          'p-4 rounded-lg border cursor-pointer transition-colors',
          currentSelectedContactId === contact.contact_id
            ? 'border-blue-500 text-white'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        ]"
        :style="currentSelectedContactId === contact.contact_id ? { backgroundColor: '#007aff' } : {}"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ contact.contact_name }}</span>
              <van-tag v-if="contact.is_default" type="primary">默认</van-tag>
            </div>
            <div class="text-sm mt-1" :class="currentSelectedContactId === contact.contact_id ? 'text-white' : 'text-gray-600'">
              {{ contact.contact_phone }}
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
              @click.stop="editContact(contact)"
            >
              编辑
            </van-button>
            <van-button
              size="mini"
              plain
              type="danger"
              @click.stop="deleteContact(contact.contact_id)"
              :loading="deleteLoading === contact.contact_id"
            >
              删除
            </van-button>
          </div>
        </div>
      </div>

      <!-- 折叠/展开按钮 -->
      <div v-if="displayContacts.length > 1" class="text-center">
        <van-button 
          size="small" 
          plain 
          type="primary"
          @click="toggleExpanded"
        >
          {{ isExpanded ? '收起' : `查看全部 (${displayContacts.length}个)` }}
          <van-icon :name="isExpanded ? 'arrow-up' : 'arrow-down'" class="ml-1" />
        </van-button>
      </div>
    </div>
    
    <!-- 无联系人状态 -->
    <div v-else class="text-center py-8 text-gray-500">
      <div class="mb-4">暂无联系人信息</div>
      <van-button type="primary" size="small" @click="showAddForm = true">
        添加联系人
      </van-button>
    </div>

    <!-- 新增联系人弹窗 -->
    <van-popup
      v-model:show="showAddForm"
      position="bottom"
      round
      closeable
      close-on-popstate
    >
      <div class="p-4">
        <h3 class="text-lg font-medium mb-4">{{ isEditing ? '编辑联系人' : '新增联系人' }}</h3>
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
          <van-field name="is_default">
            <template #label>
              <span>设为默认联系人</span>
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

    <!-- 自提点位置提示 - 卡片尾部 -->
    <div 
      class="mt-4 p-3 text-sm text-gray-600 text-start border-t border-gray-100"
      style="background-color: #f0f0f0; margin: 0 -16px -16px -16px;"
    >
      *自提点位置：门店前台，营业时间内可自提
    </div>
  </div>
</template>

<script setup lang="ts" name="PickupInfoContent">
import type { Contact, CreateContactBody } from '~/types/api/contact'

// Props
interface Props {
  selectedContactId?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedContactId: undefined
})

// Emits
interface Emits {
  (e: 'update:selectedContactId', value: number): void
  (e: 'contact-selected', contact: Contact): void
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
const editingContactId = ref<number | null>(null)
const isExpanded = ref(false)

// 表单数据
const formData = ref<CreateContactBody>({
  contact_name: '',
  contact_phone: '',
  is_default: false
})

// 获取联系人列表
const { data: contacts, pending, error, refresh } = await useFetch<Contact[]>(
  () => `/api/users/${currentUserId.value}/contacts`,
  {
    default: () => [],
    server: false,
    watch: [currentUserId]
  }
)

// 过滤当前门店的联系人
const displayContacts = computed(() => {
  if (!contacts.value || !currentStoreCode.value) return []
  
  return contacts.value.filter(contact => {
    // 显示当前门店的联系人或者全局联系人（store_code为null）
    return contact.store_code === currentStoreCode.value || contact.store_code === null
  })
})

// 智能选中联系人逻辑
const autoSelectedContactId = computed(() => {
  if (!displayContacts.value.length) return undefined
  
  // 优先选择默认联系人
  const defaultContact = displayContacts.value.find(contact => contact.is_default)
  if (defaultContact) {
    return defaultContact.contact_id
  }
  
  // 如果没有默认联系人，选择第一个
  return displayContacts.value[0].contact_id
})

// 当前选中的联系人ID
const currentSelectedContactId = computed(() => {
  return props.selectedContactId || autoSelectedContactId.value
})

// 监听自动选中变化，通知父组件
watch(autoSelectedContactId, (newId) => {
  if (newId && !props.selectedContactId) {
    // 只有当父组件没有明确指定选中联系人时，才自动选中
    const selectedContact = displayContacts.value.find(contact => contact.contact_id === newId)
    if (selectedContact) {
      emit('update:selectedContactId', newId)
      emit('contact-selected', selectedContact)
    }
  }
}, { immediate: true })

// 可见的联系人列表（折叠控制）
const visibleContacts = computed(() => {
  if (!displayContacts.value.length) return []
  
  if (isExpanded.value) {
    return displayContacts.value
  } else {
    // 默认只显示第一个（默认联系人优先）
    const defaultContact = displayContacts.value.find(c => c.is_default)
    if (defaultContact) {
      return [defaultContact]
    } else {
      return displayContacts.value.slice(0, 1)
    }
  }
})

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 选择联系人
const selectContact = (contact: Contact) => {
  emit('update:selectedContactId', contact.contact_id)
  emit('contact-selected', contact)
}

// 设为默认联系人
const setAsDefault = async (contactId: number) => {
  if (!currentUserId.value) return
  
  defaultLoading.value = contactId
  try {
    await $fetch(`/api/users/${currentUserId.value}/contacts/${contactId}/default`, {
      method: 'PUT'
    })
    
    // 刷新列表
    await refresh()
    showToast('已设为默认联系人')
  } catch (err: any) {
    showToast(err.message || '设置失败')
  } finally {
    defaultLoading.value = null
  }
}

// 编辑联系人
const editContact = (contact: Contact) => {
  isEditing.value = true
  editingContactId.value = contact.contact_id
  formData.value = {
    contact_name: contact.contact_name,
    contact_phone: contact.contact_phone,
    is_default: contact.is_default
  }
  showAddForm.value = true
}

// 删除联系人
const deleteContact = async (contactId: number) => {
  if (!currentUserId.value) return
  
  deleteLoading.value = contactId
  try {
    await $fetch(`/api/users/${currentUserId.value}/contacts/${contactId}`, {
      method: 'DELETE'
    })
    
    await refresh()
    showToast('联系人已删除')
  } catch (err: any) {
    showToast(err.message || '删除失败')
  } finally {
    deleteLoading.value = null
  }
}

// 提交表单（新增或编辑）
const handleSubmit = async () => {
  if (!currentUserId.value || !currentStoreCode.value) return
  
  submitLoading.value = true
  try {
    if (isEditing.value && editingContactId.value) {
      // 编辑联系人
      await $fetch(`/api/users/${currentUserId.value}/contacts/${editingContactId.value}`, {
        method: 'PUT',
        body: {
          contact_name: formData.value.contact_name,
          contact_phone: formData.value.contact_phone,
          is_default: formData.value.is_default
        }
      })
      showToast('联系人更新成功')
    } else {
      // 新增联系人（自动设置当前门店代码）
      await $fetch(`/api/users/${currentUserId.value}/contacts`, {
        method: 'POST',
        body: {
          ...formData.value,
          store_code: currentStoreCode.value || null // 设置当前门店代码
        }
      })
      showToast('联系人添加成功')
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
  editingContactId.value = null
  formData.value = {
    contact_name: '',
    contact_phone: '',
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