import { apiFetch } from "~/server/api";
import type { StoreMenu } from "~/types/api/store-menu";

export default defineEventHandler(async (event) => {
  const { storeCode } = event.context.params!;

  const res = await apiFetch<StoreMenu>(event, `/users/menus/${storeCode}`);
  return res;
});
