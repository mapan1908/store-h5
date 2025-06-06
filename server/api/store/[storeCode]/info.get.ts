import { apiFetch } from "~/server/api";
import type { StoreInfoWithConfig } from "~/types/api/store";

export default defineEventHandler(async (event) => {
  const { storeCode } = event.context.params!;

  const res = await apiFetch<StoreInfoWithConfig>(
    event,
    `/users/store/${storeCode}/info`
  );

  // 直接返回数据，而不是包装在 { data: ... } 中
  return res;
});
