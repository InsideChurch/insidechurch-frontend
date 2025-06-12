import { useAuthStore } from '~/store/auth';

export default defineNuxtRouteMiddleware(async (to, from) => { 
  if (process.client) { 
    const authStore = useAuthStore();

    if (!authStore.isLoggedIn && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userEmail = localStorage.getItem('user_email');
        const userName = localStorage.getItem('user_name');
        const userRole = localStorage.getItem('user_role');
        
        const isGlobalSuperAdmin = localStorage.getItem('is_global_super_admin') === 'true';

        if (token && userEmail && userName && userRole) {
            authStore.setAuth(token, userEmail, userName, userRole, isGlobalSuperAdmin);
        }
    }

    const publicPages = ['/login', '/']; 
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = authStore.isLoggedIn;

    if (authRequired && !loggedIn) {
      return navigateTo('/login'); 
    }

    if (loggedIn && (to.path === '/login' || to.path === '/')) {
      return navigateTo('/dashboard');
    }
  }
});