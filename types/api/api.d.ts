// 全局响应数据类型
export type ResData<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: number;
};
// 登录返回数据类型
export interface User {
  /** 用户 ID */
  userId: number;
  /** 用户名 */
  name: string;
  /** 用户Token */
  token: string;
  /** 用户OpenId */
  openId: string;
  /** 用户角色 */
  role: string;
  /** 用户头像 */
  avatarUrl: string;
}
