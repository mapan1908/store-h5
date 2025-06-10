import { apiFetch } from "~/server/api";
import type { ContactResponse, CreateContactBody } from "~/types/api/contact";

export default defineEventHandler(async (event) => {
  const { userId } = event.context.params!;
  const body = await readBody<CreateContactBody>(event);

  const res = await apiFetch<ContactResponse>(
    event,
    `/users/${userId}/contacts`,
    {
      method: 'POST',
      body
    }
  );

  return res;
}); 