import { useAuthStore } from '~/store/auth'; 

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const authStore = useAuthStore();
    authStore.initializeAuth();
  }
});