import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { CartItem } from "~/types/view/cart"; // 确保这个路径指向你的 CartItem 接口定义

// 定义 CartPanel.vue 期望的商品展示结构
export interface PanelDisplayItem {
  id: string; // 给 CartPanel v-for 使用的唯一 key (item_id-spec_id)
  item_id: number; // 原始商品ID，方便事件回调
  spec_id: number; // 原始规格ID，方便事件回调
  name: string;
  spec: string; // 对应 CartItem.spec_name
  price: number; // 单位：元
  quantity: number;
}

// 用于存储当前门店ID的 ref，需要在应用初始化时或选择门店后设置
const currentStoreId = ref<string | null>(null);

/**
 * 设置全局的门店ID，这将影响购物车持久化的key
 * @param storeId - 当前门店的ID
 */
export function setAppStoreId(storeId: string) {
  currentStoreId.value = storeId;
}

/**
 * 获取当前门店ID
 */
export function getCurrentStoreId(): string | null {
  return currentStoreId.value;
}

export const useCartStore = defineStore(
  "cart",
  () => {
    // 核心状态：扁平化的商品列表
    const items = ref<CartItem[]>([]);
    // UI交互锁定状态
    const isInteractionLocked = ref(false);

    // ==================== GETTERS (计算属性) ====================

    /**
     * 直接暴露给内部逻辑或调试使用的原始购物车商品列表 (CartItem[])
     */
    const rawCartItems = computed(() => items.value);

    /**
     * 计算属性：为 CartPanel.vue 准备的购物车商品列表 (PanelDisplayItem[])
     * 1. 生成唯一ID (item_id-spec_id)
     * 2. 转换价格单位：分 -> 元
     * 3. 映射字段名 (spec_name -> spec)
     */
    const panelDisplayItems = computed<PanelDisplayItem[]>(() => {
      return items.value.map((item) => ({
        id: `${item.item_id}-${item.spec_id}`, // CartPanel v-for key
        item_id: item.item_id, // 保留原始 item_id
        spec_id: item.spec_id, // 保留原始 spec_id
        name: item.name,
        spec: item.spec_name,
        price: parseFloat((item.price / 100).toFixed(2)), // 价格从 分 转换为 元
        quantity: item.quantity,
      }));
    });

    /**
     * 购物车中商品的总件数（累加所有商品的 quantity）
     */
    const totalItemsCount = computed(() => {
      return items.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    /**
     * 购物车中所有商品的总价（单位：分）
     */
    const totalPriceInCents = computed(() => {
      return items.value.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    });

    /**
     * 购物车中所有商品的总价（单位：元，格式化为字符串）
     */
    const totalPriceYuan = computed(() => {
      return (totalPriceInCents.value / 100).toFixed(2);
    });

    /**
     * 购物车是否为空
     */
    const isEmpty = computed(() => items.value.length === 0);

    /**
     * 根据商品ID和规格ID查找购物车中的商品
     * @param itemId - 商品ID
     * @param specId - 规格ID
     * @returns CartItem | undefined
     */
    const getItemByIdAndSpec = (
      itemId: number,
      specId: number
    ): CartItem | undefined => {
      return items.value.find(
        (item) => item.item_id === itemId && item.spec_id === specId
      );
    };

    /**
     * 获取特定分类下的所有购物车商品
     * @param categoryId - 分类ID
     * @returns CartItem[]
     */
    const getCategoryItems = (categoryId: number): CartItem[] => {
      return items.value.filter((item) => item.category_id === categoryId);
    };

    /**
     * 获取特定分类下商品的数量总和
     * @param categoryId - 分类ID
     * @returns number
     */
    const getCategoryCount = (categoryId: number): number => {
      return getCategoryItems(categoryId).reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    };

    // ==================== ACTIONS (数据修改方法) ====================

    function _updateInteractionLock(locked: boolean) {
      isInteractionLocked.value = locked;
    }

    /**
     * 添加商品到购物车。如果商品（及规格）已存在，则增加数量。
     * @param newItemData - 包含商品基本信息和规格信息，quantity 可选，默认为1
     */
    function addItem(
      newItemData: Omit<CartItem, "quantity"> & { quantity?: number }
    ) {
      if (isInteractionLocked.value) return; // 防止在锁定状态下操作

      const existingItem = getItemByIdAndSpec(
        newItemData.item_id,
        newItemData.spec_id
      );
      const quantityToAdd =
        newItemData.quantity === undefined || newItemData.quantity < 1
          ? 1
          : newItemData.quantity;

      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        // 确保所有 CartItem 的必需字段都被提供
        items.value.push({
          // 从 newItemData 扩展，并确保类型匹配 CartItem
          item_id: newItemData.item_id,
          name: newItemData.name,
          category_id: newItemData.category_id,
          item_type: newItemData.item_type,
          unit: newItemData.unit,
          spec_id: newItemData.spec_id,
          spec_name: newItemData.spec_name,
          price: newItemData.price,
          original_price: newItemData.original_price,
          quantity: quantityToAdd,
        } as CartItem); // 类型断言，确保结构符合
      }
    }

    /**
     * 从购物车中移除指定商品（及规格）
     * @param itemId - 商品ID
     * @param specId - 规格ID
     */
    function removeItem(itemId: number, specId: number) {
      if (isInteractionLocked.value) return;

      const itemIndex = items.value.findIndex(
        (item) => item.item_id === itemId && item.spec_id === specId
      );
      if (itemIndex > -1) {
        items.value.splice(itemIndex, 1);
      }
    }

    /**
     * 更新购物车中指定商品（及规格）的数量。如果数量小于等于0，则移除该商品。
     * @param itemId - 商品ID
     * @param specId - 规格ID
     * @param newQuantity - 新的数量
     */
    function updateItemQuantity(
      itemId: number,
      specId: number,
      newQuantity: number
    ) {
      if (isInteractionLocked.value) return;

      const item = getItemByIdAndSpec(itemId, specId);
      if (item) {
        if (newQuantity > 0) {
          item.quantity = newQuantity;
        } else {
          removeItem(itemId, specId); // 数量小于等于0则移除
        }
      }
    }

    /**
     * 增加指定商品（及规格）的数量
     * @param itemId - 商品ID
     * @param specId - 规格ID
     * @param amount - 增加的数量，默认为1
     */
    function incrementItemQuantity(
      itemId: number,
      specId: number,
      amount: number = 1
    ) {
      if (isInteractionLocked.value) return;

      const item = getItemByIdAndSpec(itemId, specId);
      if (item) {
        item.quantity += amount;
      }
    }

    /**
     * 减少指定商品（及规格）的数量。如果减少后数量小于等于0，则移除该商品。
     * @param itemId - 商品ID
     * @param specId - 规格ID
     * @param amount - 减少的数量，默认为1
     */
    function decrementItemQuantity(
      itemId: number,
      specId: number,
      amount: number = 1
    ) {
      if (isInteractionLocked.value) return;

      const item = getItemByIdAndSpec(itemId, specId);
      if (item) {
        const updatedQuantity = item.quantity - amount;
        if (updatedQuantity <= 0) {
          removeItem(itemId, specId);
        } else {
          item.quantity = updatedQuantity;
        }
      }
    }

    /**
     * 清空当前门店的购物车
     */
    function clearCart() {
      if (isInteractionLocked.value) return;
      items.value = [];
    }

    /**
     * 切换门店时清空购物车并重新加载对应门店的数据
     */
    function switchStoreCart(storeId: string) {
      if (isInteractionLocked.value) return;

      // 清空当前购物车
      items.value = [];

      // 设置新的门店ID
      setAppStoreId(storeId);

      // 这里可以添加从本地存储重新加载购物车数据的逻辑
      // 由于 Pinia persist 的限制，我们需要手动处理门店切换时的数据加载
      const storeKey = `cart-${storeId}`;
      try {
        const storedData = localStorage.getItem(storeKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.items && Array.isArray(parsedData.items)) {
            items.value = parsedData.items;
          }
        }
      } catch (error) {
        console.error("加载门店购物车数据失败:", error);
      }
    }

    /**
     * 手动保存购物车数据到对应门店的本地存储
     */
    function saveCartToStorage() {
      if (!currentStoreId.value) return;

      const storeKey = `cart-${currentStoreId.value}`;
      const dataToSave = {
        items: items.value,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(storeKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("保存购物车数据失败:", error);
      }
    }

    return {
      // State (通过 computed 暴露，或者是只读的 ref)
      rawCartItems, // 原始购物车数据
      panelDisplayItems, // 适配 CartPanel.vue 的数据
      isInteractionLocked: computed(() => isInteractionLocked.value),

      // Getters
      totalItemsCount,
      totalPriceInCents,
      totalPriceYuan,
      isEmpty,
      getItemByIdAndSpec,
      getCategoryItems,
      getCategoryCount,

      // Actions
      addItem,
      removeItem,
      updateItemQuantity,
      incrementItemQuantity,
      decrementItemQuantity,
      clearCart,
      switchStoreCart,
      saveCartToStorage,
      setInteractionLock: _updateInteractionLock,
    };
  },

  {
    persist: {
      key: "cart-default",
    },
  }
);
