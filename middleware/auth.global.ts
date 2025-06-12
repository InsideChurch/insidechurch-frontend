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

    console.log(`[Auth Middleware] Navigating to: ${to.path}, Auth Required: ${authRequired}, Logged In: ${loggedIn}`);

    if (authRequired && !loggedIn) {
      console.log("[Auth Middleware] Not logged in. Redirecting to login.");
      return navigateTo('/login'); 
    }

    if (loggedIn && (to.path === '/login' || to.path === '/')) {
      console.log("[Auth Middleware] Already logged in. Redirecting to dashboard.");
      return navigateTo('/dashboard');
    }
  }
});