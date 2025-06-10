<template>
  <view class="bg-white pb-0 mb-2.5 rounded-lg shadow-md">
    <!-- Title with Add New button -->
    <view class="flex items-center justify-between mb-1 p-4">
      <view class="flex items-center flex-1">
        <view class="w-1 h-4 bg-[#f26649] mr-2 rounded-full"></view>
        <text class="text-base font-semibold text-gray-800">收货地址</text>
      </view>
      <button
        class="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded border border-blue-500 hover:border-blue-600 transition-colors"
        @click="openAddAddressPopup"
      >
        新增地址
      </button>
    </view>

    <!-- Address Display/Selection Section -->
    <view class="mb-3 px-4">
      <view v-if="isLoadingContacts" class="text-sm text-gray-500">正在加载地址...</view>
      <view v-else-if="contactsError" class="text-sm text-red-500">
        加载地址失败: {{ contactsError.message }}
      </view>

      <view v-else-if="contacts && contacts.length >= 0">
        <!-- Currently selected/default address display -->
        <view class="flex justify-between items-center w-full mb-1">
          <template v-if="currentAddressForDisplay">
            <view class="min-w-0 flex-grow">
              <view class="flex items-center mb-0.5 truncate">
                <text class="text-sm mr-2 truncate text-[#f26649] font-semibold">
                  {{ currentAddressForDisplay.contact_name }}
                </text>
                <text class="text-sm truncate text-[#f26649] font-semibold">
                  {{ currentAddressForDisplay.contact_phone }}
                </text>
              </view>
              <text class="block text-xs text-gray-500 truncate">
                {{ getFullAddressString(currentAddressForDisplay) }}
              </text>
            </view>
            <text
              v-if="currentAddressForDisplay.is_default"
              class="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2"
            >
              默认
            </text>
          </template>
          <view v-else class="flex-grow text-sm text-gray-500 py-2">请选择或添加地址</view>
        </view>

        <!-- Conditionally rendered address list (collapsible) -->
        <view
          v-if="isAddressListVisible && contacts && contacts.length > 0"
          class="space-y-1 contact-list-inner mt-2"
          :style="{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }"
        >
          <view v-if="contacts && contacts.length > 0">
            <view
              v-for="address in contacts"
              :key="address.contact_id"
              class="py-2 pl-4 rounded-md cursor-pointer flex justify-between items-center"
              :class="{
                'bg-orange-100': selectedAddressId === address.contact_id,
                'hover:bg-gray-100': selectedAddressId !== address.contact_id,
              }"
              :style="
                selectedAddressId === address.contact_id ? { border: '1px solid #f26649' } : {}
              "
              @click="selectAddress(address)"
            >
              <view class="flex-grow min-w-0">
                <view class="flex items-center mb-0.5">
                  <text
                    class="text-sm font-medium mr-2"
                    :class="{
                      'text-[#f26649]': selectedAddressId === address.contact_id,
                      'text-gray-800': selectedAddressId !== address.contact_id,
                    }"
                  >
                    {{ address.contact_name }}
                  </text>
                  <text
                    class="text-sm"
                    :class="{
                      'text-[#f26649]': selectedAddressId === address.contact_id,
                      'text-gray-600': selectedAddressId !== address.contact_id,
                    }"
                  >
                    {{ address.contact_phone }}
                  </text>
                </view>
                <text
                  class="block text-xs text-gray-500"
                  :class="{ 'text-[#f26649]': selectedAddressId === address.contact_id }"
                >
                  {{ getFullAddressString(address) }}
                </text>
              </view>
              <view class="flex items-center flex-shrink-0 ml-2">
                <text
                  v-if="address.is_default"
                  class="text-xs px-1.5 py-0.5 rounded-full mr-2"
                  :class="{
                    'bg-white text-[#f26649]': selectedAddressId === address.contact_id,
                    'bg-gray-200 text-gray-700': selectedAddressId !== address.contact_id,
                  }"
                >
                  默认
                </text>
                <view
                  class="p-1 flex-shrink-0 cursor-pointer"
                  :class="
                    selectedAddressId === address.contact_id
                      ? 'text-[#f26649] hover:text-[#d9533a]'
                      : 'text-gray-400 hover:text-blue-500'
                  "
                  @click.stop="openEditAddressPopup(address)"
                >
                  <i class="i-gravity-ui-pencil-to-square text-base"></i>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="!isLoadingContacts" class="p-2 text-sm text-gray-400 text-center">
            暂无地址
          </view>
        </view>

        <!-- Toggle Icon for address list -->
        <view
          v-if="contacts && contacts.length > 1"
          class="flex justify-center items-center pt-1 w-full cursor-pointer mt-1"
          @click.stop="manualToggleAddressList"
        >
          <wd-icon :name="isAddressListVisible ? 'arrow-up' : 'arrow-down'" size="22px"></wd-icon>
        </view>
      </view>

      <view v-else-if="!isLoadingContacts && (!contacts || contacts.length === 0)">
        <button
          class="text-sm text-orange-500 hover:text-orange-600 w-full text-center py-2 rounded border border-dashed border-orange-500 hover:bg-orange-50 transition-colors"
          @click="openAddAddressPopup"
        >
          添加收货地址
        </button>
      </view>
    </view>
    <!-- Static section for supported delivery areas, with grey background -->
    <view
      v-if="supportedDeliveryAreasText"
      class="bg-gray-200 px-4 py-2 text-xs text-gray-700 border-t border-gray-300"
    >
      *本店仅支持配送至:
      <text class="font-semibold">{{ supportedDeliveryAreasText }}</text>
    </view>

    <!-- Contact Form Popup for Delivery -->
    <ContactFormPopup
      v-model:show="isContactPopupVisible"
      :contact-to-edit="editingContact ? ({ ...editingContact, store_id: null } as Contact) : null"
      context="delivery"
      :delivery-area-choices="deliveryAreaOptions"
      :delivery-support-info-text="
        supportedDeliveryAreasText ? `*本店仅支持配送至: ${supportedDeliveryAreasText}` : ''
      "
      @save="handleSaveAddress"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import useContacts from '@/hooks/me/useContacts'
import useStore from '@/hooks/store/useStore' // Import useStore
import ContactFormPopup from '@/components/ContactFormPopup.vue'
import { useQueryClient } from '@tanstack/vue-query'
import { createContact, updateContact } from '@/service/me'
import type { Contact } from '@/types/api/user'
import type { OrderDeliveryInfo } from '@/types/api/order'

const orderStore = useOrderStore()
const { contacts, isLoading: isLoadingContacts, error: contactsError } = useContacts()
const { config: storeConfig, isLoading: isLoadingStore } = useStore()

const queryClient = useQueryClient()
const CONTACTS_QUERY_KEY = ['contacts', 'currentUser']

const isContactPopupVisible = ref(false)
const editingContact = ref<Contact | null>(null)

const deliveryAreaOptions = computed(() => {
  if (isLoadingStore.value || !storeConfig.value?.order_type) {
    return []
  }
  const deliveryConfig = storeConfig.value.order_type.find((ot) => ot.value === 'delivery')
  if (deliveryConfig && deliveryConfig.delivery_area) {
    if (Array.isArray(deliveryConfig.delivery_area)) {
      return deliveryConfig.delivery_area.filter((area) => area.trim() !== '')
    }
  }
  return []
})

const supportedDeliveryAreasText = computed(() => {
  if (isLoadingStore.value) return '加载中...'

  const deliveryConfig = storeConfig.value?.order_type?.find((ot) => ot.value === 'delivery')
  if (deliveryConfig && deliveryConfig.delivery_area && deliveryConfig.delivery_area.length > 0) {
    let areas: string
    if (Array.isArray(deliveryConfig.delivery_area)) {
      areas = deliveryConfig.delivery_area.join('、')
    } else {
      areas = deliveryConfig.delivery_area
    }
    console.log('supportedDeliveryAreasText', areas)
    return areas
  }
  return ''
})

const selectedAddressId = ref<string | null>(null)

const getFullAddressString = (contact: Contact | null): string => {
  if (!contact) return ''
  const parts = []
  if (contact.delivery_area) parts.push(contact.delivery_area)
  if (contact.address_detail) parts.push(contact.address_detail)
  return parts.join(' ') || '地址详情未完全提供'
}

const currentAddressForDisplay = computed<Contact | null>(() => {
  if (!contacts.value || contacts.value.length === 0) return null
  if (selectedAddressId.value) {
    return contacts.value.find((c) => c.contact_id === selectedAddressId.value) || null
  }
  const defaultAddress = contacts.value.find((c) => c.is_default)
  return defaultAddress || contacts.value[0]
})

const isAddressListVisible = ref(false)

const selectAddress = (address: Contact) => {
  selectedAddressId.value = address.contact_id
}

watch(
  currentAddressForDisplay,
  (currentContact) => {
    if (currentContact) {
      const deliveryInfoPayload: OrderDeliveryInfo = {
        address_id: currentContact.contact_id,
        contact_name: currentContact.contact_name,
        contact_phone: currentContact.contact_phone,
        full_address: getFullAddressString(currentContact),
      }
      console.log(
        '[DeliveryInfo] Setting delivery details to orderStore:',
        JSON.parse(JSON.stringify(deliveryInfoPayload)),
      )
      orderStore.setDeliveryDetails(deliveryInfoPayload)
    } else {
      console.log('[DeliveryInfo] Setting delivery details to orderStore: null')
      orderStore.setDeliveryDetails(null)
    }
  },
  { immediate: true, deep: true },
)

watch(
  [() => contacts.value, () => orderStore.selectedOrderType, () => isLoadingContacts.value],
  ([currentContacts, currentSelectedOrderTypeObj, currentIsLoading]) => {
    const currentOrderType = currentSelectedOrderTypeObj?.value
    if (
      currentOrderType === 'delivery' &&
      !currentIsLoading &&
      currentContacts &&
      currentContacts.length > 0 &&
      !selectedAddressId.value
    ) {
      // console.log('DeliveryInfo Watcher: Attempting to select default/first address.');
      let addressToSelect = currentContacts.find((c) => c.is_default)
      if (!addressToSelect && currentContacts.length > 0) {
        addressToSelect = currentContacts[0]
      }

      if (addressToSelect && addressToSelect.contact_id) {
        // console.log(`DeliveryInfo Watcher: Selecting address ${addressToSelect.contact_id}`);
        selectedAddressId.value = addressToSelect.contact_id
      } else {
        // console.log('DeliveryInfo Watcher: No suitable address to select.');
      }
    }
  },
  { immediate: true, deep: true },
)

const openAddAddressPopup = () => {
  editingContact.value = null
  isContactPopupVisible.value = true
}

const openEditAddressPopup = (address: Contact) => {
  editingContact.value = address
  isContactPopupVisible.value = true
}

const handleSaveAddress = async (contactData: Partial<Contact>) => {
  console.log('DeliveryInfo: handleSaveAddress function CALLED with data:', contactData) // Entry log
  try {
    let savedContact: Contact | null = null
    const payload: Omit<Contact, 'contact_id' | 'user_id' | 'store_id'> = {
      contact_name: contactData.contact_name!,
      contact_phone: contactData.contact_phone!,
      delivery_area: contactData.delivery_area || null,
      address_detail: contactData.address_detail || null,
      is_default: contactData.is_default || false,
    }

    if (contactData.contact_id) {
      const id =
        typeof contactData.contact_id === 'number'
          ? String(contactData.contact_id)
          : contactData.contact_id
      savedContact = await updateContact(id, payload as Contact)
      uni.showToast({ title: '地址更新成功', icon: 'success' })
    } else {
      savedContact = await createContact(payload as Contact)
      uni.showToast({ title: '地址添加成功', icon: 'success' })
    }
    console.log('DeliveryInfo: savedContact', savedContact)
    // No longer rely on savedContact having a value from response.data
    // If API call didn't throw, we assume success and proceed to invalidate/refetch.
    console.log('DeliveryInfo: API call presumed successful (no error thrown).')

    console.log('DeliveryInfo: Before invalidating contacts query', CONTACTS_QUERY_KEY)
    await queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    console.log('DeliveryInfo: After invalidating contacts query, before refetching')
    await queryClient.refetchQueries({ queryKey: CONTACTS_QUERY_KEY })
    console.log('DeliveryInfo: After refetching contacts query')
  } catch (err: any) {
    console.error('保存地址失败:', err)
    const errorMessage = err?.data?.message || err?.message || '操作失败，请稍后重试'
    uni.showToast({ title: errorMessage, icon: 'none' })
  }
}

const manualToggleAddressList = () => {
  isAddressListVisible.value = !isAddressListVisible.value
}
</script>

<style scoped>
/* Minimal scoped styles, Unocss preferred */
</style>
