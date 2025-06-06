import { getCookie } from "h3";
import { useRuntimeConfig } from "#imports";
import type { H3Event } from "h3";
import type { ResData } from "~/types/api/api";

export const apiFetch = async <T>(
  event: H3Event,
  url: string,
  options: Parameters<typeof $fetch>[1] = {}
): Promise<T> => {
  const config = useRuntimeConfig();
  const token = getCookie(event, "token") || "accacdf769b1c1a879262bf378f1a5aa"; // 开发环境默认token

  const res = await $fetch<ResData<T>>(url, {
    baseURL: config.apiBase, // 从 nuxt.config.ts 读取真实后端 API 前缀
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      ...options?.headers,
    },
    ...options,
  });

  if (res.code > 200 && res.code < 300) {
    throw createError({
      statusCode: 500,
      statusMessage: res.message || "请求失败",
    });
  }

  return res.data;
};
