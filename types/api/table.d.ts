// 餐桌状态枚举
export type TableStatus = 'available' | 'occupied' | 'reserved';

// 餐桌数据结构（公用查询版本）
export interface PublicTable {
  table_id: number;
  table_name: string;
  area_name: string | null;
  capacity: number;
  status: TableStatus;
}

// 餐桌列表响应
export type TablesResponse = PublicTable[]; 