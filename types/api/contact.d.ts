// 联系人数据结构
export interface Contact {
  contact_id: number;
  user_id: number;
  store_code: string | null;
  contact_name: string;
  contact_phone: string;
  delivery_area: string | null;
  address_detail: string | null;
  is_default: boolean;
}

// 创建联系人请求体
export interface CreateContactBody {
  contact_name: string;
  contact_phone: string;
  store_code?: string | null;
  delivery_area?: string | null;
  address_detail?: string | null;
  is_default?: boolean;
}

// 更新联系人请求体
export interface UpdateContactBody {
  contact_name?: string;
  contact_phone?: string;
  delivery_area?: string | null;
  address_detail?: string | null;
  is_default?: boolean;
}

// 路径参数
export interface UserIdParams {
  userId: number;
}

export interface ContactIdParams {
  contactId: number;
}

export interface UserContactParams {
  userId: number;
  contactId: number;
}

// 响应类型
export type ContactsResponse = Contact[];
export type ContactResponse = Contact; 