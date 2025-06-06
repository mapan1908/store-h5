// plugins/pinia.ts (如果使用了 @pinia/nuxt 模块)
import { defineNuxtPlugin } from "#app";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export default defineNuxtPlugin((nuxtApp: any) => {
  nuxtApp.$pinia.use(piniaPluginPersistedstate);
});
