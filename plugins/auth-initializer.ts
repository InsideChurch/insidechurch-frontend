import { useAuthStore } from '~/store/auth'; 

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const authStore = useAuthStore();
    authStore.initializeAuth();
  });
});