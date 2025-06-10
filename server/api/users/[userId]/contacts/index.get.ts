import { apiFetch } from "~/server/api";
import type { ContactsResponse } from "~/types/api/contact";

export default defineEventHandler(async (event) => {
  const { userId } = event.context.params!;

  const res = await apiFetch<ContactsResponse>(
    event,
    `/users/${userId}/contacts`
  );

  return res;
}); 