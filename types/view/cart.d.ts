export interface CartItem {
  item_id: number; // 商品ID
  name: string; // 商品名称
  category_id: number; // 分类ID
  item_type: string; // 商品类型（SINGLE/SPEC/COMBO）
  unit?: string; // 单位
  spec_id: number; // 规格ID
  spec_name: string; // 规格名称
  price: number; // 规格价格
  original_price?: number; // 原价（可选）
  quantity: number; // 购买数量
}
