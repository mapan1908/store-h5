<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-md mx-auto">
      <!-- Service Type Selection with Sub Components -->
      <ServiceTypeSelector 
        v-model="serviceType"
        v-model:selectedTable="selectedTable"
        @change="handleServiceTypeChange"
        @add-contact="showContactModal = true"
        @add-address="showAddressModal = true"
      />

      <!-- Selected Items -->
      <div class="mx-4 mb-4 bg-white rounded-lg shadow-sm border">
        <div class="p-4">
          <div class="text-base font-medium flex items-center pb-3">
            <div class="w-1 h-4 bg-orange-500 rounded mr-2"></div>
            已选商品
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, index) in orderItems"
              :key="index"
              class="flex justify-between items-center"
            >
              <div>
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-sm text-gray-600">{{ item.spec }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">x{{ item.quantity }}</div>
                <div class="font-medium">¥{{ item.price.toFixed(2) }}</div>
              </div>
            </div>
            <div class="flex justify-between items-center pt-2 border-t">
              <div class="text-sm">小计:</div>
              <div class="text-orange-500 font-medium">¥{{ subtotal.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="mx-4 mb-4 bg-white rounded-lg shadow-sm border">
        <div class="p-4">
          <div class="text-base font-medium flex items-center pb-3">
            <div class="w-1 h-4 bg-orange-500 rounded mr-2"></div>
            订单信息
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <span>商品金额</span>
              <span>¥{{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="packagingFee > 0" class="flex justify-between">
              <span>打包费</span>
              <span>¥{{ packagingFee.toFixed(2) }}</span>
            </div>
            <div v-if="deliveryFee > 0" class="flex justify-between">
              <span>配送费</span>
              <span>¥{{ deliveryFee.toFixed(2) }}</span>
            </div>
            <div v-if="serviceFee > 0" class="flex justify-between">
              <span>{{ serviceType === 'dine-in' ? '服务费' : '打包费' }}</span>
              <span>¥{{ serviceFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-medium text-lg pt-2 border-t">
              <span>合计</span>
              <span class="text-orange-500">¥{{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="mx-4 mb-20 bg-white rounded-lg shadow-sm border">
        <div class="p-4">
          <div class="text-base font-medium flex items-center pb-3">
            <div class="w-1 h-4 bg-orange-500 rounded mr-2"></div>
            备注
          </div>

          <van-field
            v-model="notes"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
            autosize
          />
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div class="max-w-md mx-auto flex items-center justify-between">
          <div class="text-lg font-medium">
            合计: <span class="text-orange-500">¥{{ total.toFixed(2) }}</span>
          </div>
          <van-button type="primary" color="#ff6600" @click="submitOrder">
            提交订单
          </van-button>
        </div>
      </div>

      <!-- Add Address Modal -->
      <van-popup
        v-model:show="showAddressModal"
        position="bottom"
        round
        :style="{ height: '80%' }"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium">新增地址</h3>
            <van-icon name="close" @click="showAddressModal = false" />
          </div>

          <van-form>
            <van-field
              v-model="newAddress.name"
              label="联系人姓名"
              placeholder="请输入联系人姓名"
              required
              label-class="text-red-500"
            />
            <van-field
              v-model="newAddress.phone"
              label="手机号码"
              placeholder="请输入手机号码"
              required
              label-class="text-red-500"
            />
            
            <div class="my-4">
              <div class="text-sm font-medium mb-2">配送区域</div>
              <div class="flex gap-2">
                <van-button
                  v-for="area in deliveryAreas"
                  :key="area"
                  :type="newAddress.area === area ? 'primary' : 'default'"
                  :color="newAddress.area === area ? '#ff6600' : undefined"
                  size="small"
                  @click="newAddress.area = area"
                >
                  {{ area }}
                </van-button>
              </div>
            </div>

            <van-field
              v-model="newAddress.detail"
              label="详细地址"
              placeholder="例如：X栋X单元XXX室"
            />

            <van-cell title="设为默认地址">
              <template #right-icon>
                <van-switch v-model="newAddress.isDefault" />
              </template>
            </van-cell>
          </van-form>

          <div class="text-xs text-gray-500 text-center my-4">
            *本店仅支持配送至：万景城、保利叶语
          </div>

          <div class="flex gap-3 mt-6">
            <van-button 
              plain 
              class="flex-1" 
              @click="showAddressModal = false"
            >
              取消
            </van-button>
            <van-button 
              type="primary" 
              color="#ff6600" 
              class="flex-1"
              @click="saveAddress"
            >
              保存
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- Add Contact Modal -->
      <van-popup
        v-model:show="showContactModal"
        position="bottom"
        round
        :style="{ height: '60%' }"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium">新增联系人</h3>
            <van-icon name="close" @click="showContactModal = false" />
          </div>

          <van-form>
            <van-field
              v-model="newContact.name"
              label="联系人姓名"
              placeholder="请输入联系人姓名"
              required
              label-class="text-red-500"
            />
            <van-field
              v-model="newContact.phone"
              label="手机号码"
              placeholder="请输入手机号码"
              required
              label-class="text-red-500"
            />

            <van-cell title="设为默认联系人">
              <template #right-icon>
                <van-switch v-model="newContact.isDefault" />
              </template>
            </van-cell>
          </van-form>

          <div class="flex gap-3 mt-6">
            <van-button 
              plain 
              class="flex-1" 
              @click="showContactModal = false"
            >
              取消
            </van-button>
            <van-button 
              type="primary" 
              color="#ff6600" 
              class="flex-1"
              @click="saveContact"
            >
              保存
            </van-button>
          </div>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<script setup lang="ts" name="OrderConfirm">
// 组件导入
import ServiceTypeSelector from "~/components/order/ServiceTypeSelector/index.vue"

// 定义页面元信息
definePageMeta({
  layout: "default",
});

// 类型定义
type ServiceType = "dine-in" | "pickup" | "delivery"

interface Address {
  id: string
  name: string
  phone: string
  area: string
  detail: string
  isDefault: boolean
}

interface Table {
  id: string
  name: string
  capacity: number
  status: "available" | "occupied"
  area: string
}

interface OrderItem {
  name: string
  spec: string
  price: number
  quantity: number
}

// 响应式数据
const serviceType = ref<ServiceType>("delivery")
const showAddressModal = ref(false)
const showContactModal = ref(false)
const selectedTable = ref("")
const notes = ref("")

// 处理服务类型变化
const handleServiceTypeChange = (newType: ServiceType) => {
  console.log("服务类型已切换:", newType)
  // 这里可以添加额外的处理逻辑，比如重置表单等
}

// 订单商品
const orderItems = ref<OrderItem[]>([
  { name: "西瓜", spec: "标准", price: 15.0, quantity: 1 },
  { name: "草莓", spec: "标准", price: 12.0, quantity: 1 },
])

// 新增地址表单
const newAddress = reactive({
  name: "",
  phone: "",
  area: "万景城",
  detail: "",
  isDefault: false,
})

// 新增联系人表单
const newContact = reactive({
  name: "",
  phone: "",
  isDefault: false,
})

// 配送区域
const deliveryAreas = ["万景城", "保利叶语"]

// 计算属性
const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const packagingFee = computed(() => {
  return serviceType.value === "delivery" ? 0.01 : 0
})

const deliveryFee = computed(() => {
  return serviceType.value === "delivery" ? 0.03 : 0
})

const serviceFee = computed(() => {
  return serviceType.value === "dine-in" ? 0.01 : 0.02
})

const total = computed(() => {
  return subtotal.value + packagingFee.value + deliveryFee.value + serviceFee.value
})

// 方法

const saveAddress = () => {
  // 保存地址逻辑
  console.log("保存地址:", newAddress)
  showAddressModal.value = false
  // 重置表单
  Object.assign(newAddress, {
    name: "",
    phone: "",
    area: "万景城",
    detail: "",
    isDefault: false,
  })
}

const saveContact = () => {
  // 保存联系人逻辑
  console.log("保存联系人:", newContact)
  showContactModal.value = false
  // 重置表单
  Object.assign(newContact, {
    name: "",
    phone: "",
    isDefault: false,
  })
}

const submitOrder = () => {
  // 提交订单逻辑
  const orderData = {
    serviceType: serviceType.value,
    selectedTable: selectedTable.value,
    items: orderItems.value,
    notes: notes.value,
    total: total.value,
  }
  console.log("提交订单:", orderData)
}
</script>

<style scoped>
/* 自定义样式 */
:deep(.van-button--plain) {
  @apply border border-gray-300;
}

:deep(.van-field__label) {
  @apply text-sm font-medium;
}
</style> 