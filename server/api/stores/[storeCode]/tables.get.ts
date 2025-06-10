import { apiFetch } from "~/server/api";
import type { TablesResponse } from "~/types/api/table";

export default defineEventHandler(async (event) => {
  const { storeCode } = event.context.params!;

  const res = await apiFetch<TablesResponse>(
    event,
    `/stores/${storeCode}/tables`
  );

  return res;
}); 