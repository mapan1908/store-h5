<template>
  <view class="bg-white px-4 py-2 mb-2.5 rounded-lg shadow-md">
    <!-- Title with Add New button -->
    <view class="flex items-center justify-between mb-3">
      <view class="flex items-center flex-1">
        <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
        <text class="text-base font-semibold text-gray-800">自提信息</text>
      </view>
      <button
        class="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded border border-blue-500 hover:border-blue-600 transition-colors"
        @click="openAddContactPopup"
      >
        新增联系人
      </button>
    </view>

    <!-- Static Pickup Location (Moved Up) -->
    <view class="mb-3 px-4">
      <view v-if="isLoadingStore" class="text-sm text-gray-500">自提点信息加载中...</view>
      <view v-else-if="isStoreError" class="text-sm text-red-500">
        自提点加载失败: {{ storeError?.message }}
      </view>
      <view v-else>
        <text class="block text-sm text-gray-800 font-bold mb-1">
          当前自提点: {{ pickupLocationInfo.address }}
        </text>
      </view>
    </view>

    <!-- Contact Display/Selection Section -->
    <view class="px-4">
      <view v-if="isLoadingContacts" class="text-sm text-gray-500">正在加载联系人...</view>
      <view v-else-if="contactsError" class="text-sm text-red-500">
        加载联系人失败: {{ contactsError.message }}
      </view>

      <view v-else-if="contacts && contacts.length >= 0">
        <!-- Original title row for contact display - MODIFIED for default tag alignment -->
        <view class="flex justify-between items-center w-full mb-1">
          <template v-if="currentContactForDisplay">
            <view class="min-w-0 flex-grow">
              <!-- Name and phone view, allows growth -->
              <view class="flex items-center truncate">
                <text class="text-sm mr-2 truncate text-[#f26649] font-semibold">
                  {{ currentContactForDisplay.contact_name }}
                </text>
                <text class="text-sm truncate text-[#f26649] font-semibold">
                  {{ currentContactForDisplay.contact_phone }}
                </text>
              </view>
            </view>
            <text
              v-if="currentContactForDisplay.is_default"
              class="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2"
            >
              默认
            </text>
          </template>
          <view v-else class="flex-grow text-sm text-gray-500 py-2">请选择或添加联系人</view>
        </view>

        <!-- Conditionally rendered contact list -->
        <view
          v-if="isContactListVisible && contacts && contacts.length > 0"
          class="space-y-1 contact-list-inner mt-2"
          :style="
            isContactListVisible && contacts && contacts.length > 0
              ? { borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }
              : {}
          "
        >
          <view v-if="contacts && contacts.length > 0">
            <view
              v-for="contact in contacts"
              :key="contact.contact_id"
              class="py-2 pl-4 rounded-md cursor-pointer flex justify-between items-center"
              :class="{
                'bg-orange-100': selectedContactId === contact.contact_id,
                'hover:bg-gray-100': selectedContactId !== contact.contact_id,
              }"
              :style="
                selectedContactId === contact.contact_id ? { border: '1px solid #f26649' } : {}
              "
              @click="selectContact(contact)"
            >
              <view class="flex-grow min-w-0">
                <view class="flex items-center mb-0.5">
                  <text
                    class="text-sm font-medium mr-2"
                    :class="
                      selectedContactId === contact.contact_id ? 'text-[#f26649]' : 'text-gray-800'
                    "
                  >
                    {{ contact.contact_name }}
                  </text>
                  <text
                    class="text-sm"
                    :class="
                      selectedContactId === contact.contact_id ? 'text-[#f26649]' : 'text-gray-600'
                    "
                  >
                    {{ contact.contact_phone }}
                  </text>
                </view>
              </view>

              <!-- New container for default tag and edit button on the right -->
              <view class="flex items-center flex-shrink-0 ml-2">
                <text
                  v-if="contact.is_default"
                  class="text-xs px-1.5 py-0.5 rounded-full mr-2"
                  :class="
                    selectedContactId === contact.contact_id
                      ? 'bg-white text-[#f26649]'
                      : 'bg-gray-200 text-gray-700'
                  "
                >
                  默认
                </text>
                <view
                  class="p-1 flex-shrink-0 cursor-pointer"
                  :class="
                    selectedContactId === contact.contact_id
                      ? 'text-[#f26649] hover:text-[#d9533a]'
                      : 'text-gray-400 hover:text-blue-500'
                  "
                  @click.stop="openEditContactPopup(contact)"
                >
                  <i class="i-gravity-ui-pencil-to-square text-base"></i>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="!isLoadingContacts" class="p-2 text-sm text-gray-400 text-center">
            暂无联系人
          </view>
        </view>

        <!-- Toggle Icon - New Position: After the list (if visible) or after current contact display -->
        <view
          v-if="contacts && contacts.length > 1"
          class="flex justify-center items-center py-2 w-full cursor-pointer mt-1"
          @click.stop="manualToggleContactList"
        >
          <wd-icon :name="isContactListVisible ? 'arrow-up' : 'arrow-down'" size="22px"></wd-icon>
        </view>
      </view>
      <!-- End of new custom collapse logic -->

      <view v-else>
        <button
          class="text-sm text-orange-500 hover:text-orange-600 w-full text-center py-2 rounded border border-dashed border-orange-500 hover:bg-orange-50 transition-colors"
          @click="openAddContactPopup"
        >
          添加自提联系人
        </button>
      </view>
    </view>

    <!-- User Input for Pickup Details -->

    <!-- Contact Form Popup -->
    <ContactFormPopup
      v-model:show="isContactPopupVisible"
      :contact-to-edit="editingContact ? ({ ...editingContact, store_id: null } as Contact) : null"
      context="pickup"
      @save="handleSaveContact"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import useContacts from '@/hooks/me/useContacts'
import useStore from '@/hooks/store/useStore' // Import useStore
import ContactFormPopup from '@/components/ContactFormPopup.vue' // Import the popup component
import { useQueryClient } from '@tanstack/vue-query' // Import useQueryClient
import { createContact, updateContact } from '@/service/me' // Import API functions
import type { Contact } from '@/types/api/user'

const orderStore = useOrderStore()
const { contacts, isLoading: isLoadingContacts, error: contactsError } = useContacts()
const {
  store: storeInfo,
  config: storeConfig,
  isLoading: isLoadingStore,
  isError: isStoreError,
  error: storeError,
} = useStore() // MODIFIED: Removed 'TEST001'

const queryClient = useQueryClient() // Get query client instance
const CONTACTS_QUERY_KEY = ['contacts', 'currentUser'] // Re-define or import if exposed from useContacts

const selectedContactId = ref<string | null>(null)
const isContactListVisible = ref(false)

// Popup state
const isContactPopupVisible = ref(false)
const editingContact = ref<Contact | null>(null)

const currentContactForDisplay = computed<Contact | null>(() => {
  if (!contacts.value || contacts.value.length === 0) return null
  if (selectedContactId.value) {
    return contacts.value.find((c) => c.contact_id === selectedContactId.value) || null
  }
  const defaultContact = contacts.value.find((c) => c.is_default)
  return defaultContact || contacts.value[0] || null
})

const pickupLocationInfo = computed(() => {
  const storeData = storeInfo.value // ActualStoreType | {}

  let name = '门店加载中...'
  let address = '自提点加载中...'

  if (isLoadingStore.value) {
    // Loading state handled by initial values
  } else if (storeData && 'id' in storeData && typeof storeData.id !== 'undefined') {
    // TypeScript now knows storeData is not {} and has 'id'
    name = storeData.name || '未知门店' // Should be safe now

    if (!storeConfig.value || !storeConfig.value.order_type) {
      address = '自提配置错误'
    } else {
      const pickupConfig = storeConfig.value.order_type.find((ot) => ot.value === 'pickup')
      if (pickupConfig && pickupConfig.enabled) {
        if (pickupConfig.pickup_point) {
          address = pickupConfig.pickup_point
        } else {
          address = `${name} (具体位置请咨询店内)` // name is now safely derived
        }
      } else {
        address = '本店暂不支持自提'
      }
    }
  } else {
    name = '门店信息错误'
    address = '无法获取自提点'
  }
  return { name, address }
})

watch(
  currentContactForDisplay,
  (newVal) => {
    if (newVal) {
      const pickupDetails: { contact_name: string; contact_phone: string } = {
        contact_name: newVal.contact_name,
        contact_phone: newVal.contact_phone,
      }
      console.log(
        '[PickupInfo] Setting pickup details to orderStore:',
        JSON.parse(JSON.stringify(pickupDetails)),
      )
      orderStore.setPickupDetails(pickupDetails)
    } else {
      console.log('[PickupInfo] Setting pickup details to orderStore: null')
      orderStore.setPickupDetails(null)
    }
  },
  { immediate: true, deep: true },
)

// ADD THE NEW WATCHER
watch(
  [() => contacts.value, () => orderStore.selectedOrderType, () => isLoadingContacts.value],
  ([currentContacts, currentSelectedOrderTypeObj, currentIsLoading]) => {
    const currentOrderType = currentSelectedOrderTypeObj?.value
    // console.log(
    //   `PickupInfo Watcher: orderType=${currentOrderType}, isLoading=${currentIsLoading}, contactsCount=${currentContacts?.length}, selectedId=${selectedContactId.value}`
    // );

    if (
      currentOrderType === 'pickup' &&
      !currentIsLoading &&
      currentContacts &&
      currentContacts.length > 0 &&
      !selectedContactId.value
    ) {
      // console.log('PickupInfo Watcher: Attempting to select default/first contact.');
      let contactToSelect = currentContacts.find((c) => c.is_default)
      if (!contactToSelect && currentContacts.length > 0) {
        // Ensure there's at least one contact
        contactToSelect = currentContacts[0]
      }

      if (contactToSelect && contactToSelect.contact_id) {
        // console.log(`PickupInfo Watcher: Selecting contact ${contactToSelect.contact_id}`);
        selectedContactId.value = contactToSelect.contact_id
      } else {
        // console.log('PickupInfo Watcher: No suitable contact to select.');
      }
    }
  },
  { immediate: true, deep: true },
)

const selectContact = (contact: Contact) => {
  selectedContactId.value = contact.contact_id
  // isContactListVisible.value = false; // Optionally close list on selection
}

const manualToggleContactList = () => {
  isContactListVisible.value = !isContactListVisible.value
}

const openAddContactPopup = () => {
  editingContact.value = null
  isContactPopupVisible.value = true
}

const openEditContactPopup = (contact: Contact) => {
  editingContact.value = contact
  isContactPopupVisible.value = true
}

const handleSaveContact = async (contactData: Partial<Contact>) => {
  console.log('PickupInfo: handleSaveContact function CALLED with data:', contactData) // Entry log
  try {
    let savedContact: Contact | null = null
    // Construct payload for API, removing undefined/null for cleaner request if necessary
    // The API functions expect a more complete 'Contact' like object,
    // but createContact should not receive contact_id, user_id, store_id
    // updateContact needs contact_id separately.

    const payload: Omit<Contact, 'contact_id' | 'user_id' | 'store_id'> = {
      contact_name: contactData.contact_name!,
      contact_phone: contactData.contact_phone!,
      delivery_area: contactData.delivery_area || null,
      address_detail: contactData.address_detail || null,
      is_default: contactData.is_default || false,
    }

    if (contactData.contact_id) {
      // Editing existing contact
      // Ensure contact_id is string for updateContact function signature
      const id =
        typeof contactData.contact_id === 'number'
          ? String(contactData.contact_id)
          : contactData.contact_id
      savedContact = await updateContact(id, payload as Contact) // API expects full Contact, cast for now
      uni.showToast({ title: '联系人更新成功', icon: 'success' })
    } else {
      // Creating new contact
      savedContact = await createContact(payload as Contact) // API expects full Contact, cast for now
      uni.showToast({ title: '联系人添加成功', icon: 'success' })
    }
    console.log('PickupInfo: savedContact', savedContact)

    // No longer rely on savedContact having a value from response.data
    // If API call didn't throw, we assume success and proceed to invalidate/refetch.
    console.log('PickupInfo: API call presumed successful (no error thrown).')

    console.log('PickupInfo: Before invalidating contacts query', CONTACTS_QUERY_KEY)
    await queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    console.log('PickupInfo: After invalidating contacts query, before refetching')
    await queryClient.refetchQueries({ queryKey: CONTACTS_QUERY_KEY })
    console.log('PickupInfo: After refetching contacts query')

    isContactPopupVisible.value = false
  } catch (err: any) {
    console.error('保存联系人失败:', err)
    const errorMessage = err?.data?.message || err?.message || '操作失败，请稍后重试'
    uni.showToast({ title: errorMessage, icon: 'none' })
  }
}
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
input {
  outline: none;
}
/* REMOVED .contact-collapse and its deep selectors */

.contact-list-inner {
  /* Remove top margin/padding if the centered icon above provides enough space */
  /* margin-top: 0 !important; */ /* Might not be needed anymore or adjust as seen fit */
  /* padding-top: 0 !important; */
}
/* Add any other custom styles needed */
</style>
