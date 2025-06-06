<template>
  <van-card
    :title="item.name"
    :desc="item.description"
    :price="((item.min_price || 0) / 100).toFixed(2)"
    :tag="item.item_type !== 'SINGLE' ? '多规格' : ''"
    class="bg-white rounded-lg shadow-sm mb-2"
  >
    <!-- 自定义缩略图区域，支持图片预览和占位 -->
    <template #thumb>
      <div
        class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden"
        :class="{
          'cursor-pointer': item.image_url && !imageLoadError,
        }"
        @click="handleImagePreview"
      >
        <img
          v-if="item.image_url && !imageLoadError"
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
          @error="onImageError"
          @load="imageLoadError = false"
        />
        <!-- 图片占位区域 - 无图片或加载失败时显示 -->
        <div
          v-else
          class="w-full h-full flex flex-col items-center justify-center text-gray-400"
        >
          <van-icon name="photo" size="20" class="mb-1" />
          <span class="text-xs">暂无图片</span>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-end">
        <!-- 单规格商品：显示数量控制器 -->
        <van-stepper
          v-if="item.item_type === 'SINGLE'"
          :model-value="cartCount"
          :min="0"
          :integer="true"
          theme="round"
          button-size="24"
          input-width="32"
          style="min-width: 90px"
          :show-minus="cartCount > 0"
          :show-input="cartCount > 0"
          @change="onStepperChange"
        />

        <!-- 多规格商品：显示规格选择按钮 -->
        <van-button
          v-else
          size="small"
          type="primary"
          round
          class="spec-btn"
          @click="showSpecModal = true"
        >
          选规格
        </van-button>
      </div>
    </template>
  </van-card>

  <!-- 规格选择弹框 -->
  <van-popup
    v-model:show="showSpecModal"
    position="center"
    :style="{ width: '70%', maxHeight: '50vh' }"
    round
    closeable
    close-icon-position="top-right"
    lock-scroll
  >
    <div class="spec-modal" @wheel.stop @touchmove.stop>
      <!-- 商品名称 -->
      <div class="text-center mb-4 pt-4 px-4">
        <h3 class="text-lg font-bold text-gray-800">{{ item.name }}</h3>
      </div>

      <!-- 规格列表 -->
      <div class="spec-list">
        <div
          v-for="spec in item.item_specs"
          :key="spec.id"
          class="flex items-center justify-between px-4 py-4 border-b border-gray-100 last:border-none"
        >
          <!-- 左侧：规格名称和价格 -->
          <div class="flex-1 text-left">
            <div class="text-base text-gray-800 mb-1">{{ spec.name }}</div>
            <div class="text-sm text-orange-500 font-medium">
              ¥{{ (spec.price / 100).toFixed(2) }}
            </div>
          </div>

          <!-- 右侧：数量控制 -->
          <div class="w-24 flex justify-end">
            <van-stepper
              :model-value="getSpecCartCount(spec.id)"
              :min="0"
              :integer="true"
              theme="round"
              button-size="24"
              input-width="32"
              :show-minus="getSpecCartCount(spec.id) > 0"
              :show-input="getSpecCartCount(spec.id) > 0"
              @change="(value) => onSpecStepperChange(spec, value)"
            />
          </div>
        </div>

        <!-- 如果没有规格 -->
        <div
          v-if="!item.item_specs || item.item_specs.length === 0"
          class="text-center text-gray-500 py-10"
        >
          暂无可选规格
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { MenuItem } from "~/types/api/store-menu";
import { useCartStore } from "~/stores/cart";
import { computed, ref } from "vue";
import { showImagePreview, showToast } from "vant";
// Vant Card 组件自动全局注册，无需手动import
const props = defineProps<{
  item: MenuItem;
}>();
const cartStore = useCartStore();
const showSpecModal = ref(false);
const imageLoadError = ref(false);

// 单规格商品的购物车数量
const cartCount = computed(() => {
  if (props.item.item_type !== "SINGLE") return 0;
  const cartItem = cartStore.getItemByIdAndSpec(props.item.id, 0);
  return cartItem ? cartItem.quantity : 0;
});

// 获取指定规格的购物车数量
const getSpecCartCount = (specId: number) => {
  const cartItem = cartStore.getItemByIdAndSpec(props.item.id, specId);
  return cartItem ? cartItem.quantity : 0;
};

// 单规格商品数量变化处理
const onStepperChange = (newCount: number) => {
  if (cartCount.value === 0 && newCount > 0) {
    cartStore.addItem({
      item_id: props.item.id,
      name: props.item.name,
      category_id: props.item.category_id,
      item_type: props.item.item_type,
      unit: props.item.unit,
      spec_id: 0,
      spec_name: "",
      price: props.item.min_price,
      original_price: props.item.min_price,
      quantity: newCount,
    });
  } else if (newCount >= 0) {
    cartStore.updateItemQuantity(props.item.id, 0, newCount);
  }
};

// 多规格商品数量变化处理
const onSpecStepperChange = (spec: any, newCount: number) => {
  const currentCount = getSpecCartCount(spec.id);

  if (currentCount === 0 && newCount > 0) {
    cartStore.addItem({
      item_id: props.item.id,
      name: props.item.name,
      category_id: props.item.category_id,
      item_type: props.item.item_type,
      unit: props.item.unit,
      spec_id: spec.id,
      spec_name: spec.name,
      price: spec.price,
      original_price: spec.price,
      quantity: newCount,
    });
  } else if (newCount >= 0) {
    cartStore.updateItemQuantity(props.item.id, spec.id, newCount);
  }
};

// 处理图片预览
const handleImagePreview = () => {
  const imageUrl = props.item.image_url;
  if (imageUrl && !imageLoadError.value) {
    showImagePreview({
      images: [imageUrl],
      closeable: true,
      closeIcon: "cross",
      closeIconPosition: "top-right",
      onClose() {
        console.log(`关闭${props.item.name}的图片预览`);
      },
      onScale({ index, scale }) {
        console.log(`图片缩放: ${scale}`);
      },
    });
  } else {
    showToast("暂无商品图片");
  }
};

// 处理图片加载错误
const onImageError = () => {
  imageLoadError.value = true;
  const imageUrl = props.item.image_url;
  console.warn(`商品图片加载失败: ${imageUrl}`);
};
</script>
<style scoped>
/* 你可以自定义 stepper-placeholder 的样式来代替显示0的数值 */
.stepper-placeholder {
  height: 32px; /* 根据你 UI 的高度调整 */
}

.spec-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.spec-list {
  flex: 1;
  overflow-y: auto;
}
</style>

<style>
/* 设置 Vant Card 价格颜色为桔红色 - 全局样式确保覆盖 */
.van-card__price,
.van-card__price-currency,
.van-card__price-integer,
.van-card__price-decimal {
  color: #f97316 !important; /* text-orange-500 的颜色值 */
}

/* 如果上面不生效，尝试更具体的选择器 */
.van-card .van-card__bottom .van-card__price {
  color: #f97316 !important;
}

/* 确保按钮样式正确 */
:deep(.spec-btn.van-button) {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  color: white !important;
  font-weight: 500 !important;
  border-radius: 12px !important;
  min-width: 60px !important;
}

:deep(.spec-btn.van-button:active) {
  background-color: #0570e6 !important;
  border-color: #0570e6 !important;
}
</style>
