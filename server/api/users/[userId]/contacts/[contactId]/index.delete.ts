import { apiFetch } from "~/server/api";

export default defineEventHandler(async (event) => {
  const { userId, contactId } = event.context.params!;

  const res = await apiFetch(
    event,
    `/users/${userId}/contacts/${contactId}`,
    {
      method: 'DELETE'
    }
  );

  return res;
}); 