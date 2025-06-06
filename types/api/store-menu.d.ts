// 菜品规格
export interface ItemSpec {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  min_quantity: number;
  max_quantity?: number | null;
  status: number;
  is_stock_managed: boolean;
  sequence_number: number;
}

// 菜品信息
export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  item_type: "SINGLE" | "MULTI";
  unit?: string;
  discount_eligible: boolean;
  image_url?: string;
  sequence_number: number;
  min_price: number;
  item_specs: ItemSpec[];
}

// 分类信息
export interface Category {
  id: number;
  name: string;
  sequence_number: number;
  is_active: boolean;
  menu_items: MenuItem[];
}

// 整个门店的菜单数据
export interface StoreMenu {
  store_id: number;
  categories: Category[];
}

// API 响应格式
export interface StoreMenuResponse {
  code: number;
  message: string;
  data: StoreMenu;
  timestamp: number;
}
