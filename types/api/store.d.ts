// 营业时间接口（实际API返回格式）
export interface BusinessHours {
  start: string;
  end: string;
}

// 服务时间接口
export interface ServiceHours {
  start: string;
  end: string;
}

// 门店配置接口（实际API返回格式）
export interface StoreConfig {
  order_type: "pickup" | "delivery";
  enabled: boolean;
  service_hours: ServiceHours[];
  delivery_fee: number;
  packaging_fee: number;
  service_fee: number;
  pickup_point?: string | null;
  delivery_area?: string[] | null;
}

// 门店信息接口定义
export interface StoreInfo {
  id: number;
  store_code: string;
  name: string;
  address: string;
  store_type?: string;
  province?: string;
  city?: string;
  district?: string;
  phone: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  business_hours?: BusinessHours[];
  status: "open" | "closed";
}

// 带配置的门店信息
export interface StoreInfoWithConfig extends StoreInfo {
  config: StoreConfig[];
}

// API 响应格式
export interface StoreInfoResponse {
  data: StoreInfoWithConfig;
}
