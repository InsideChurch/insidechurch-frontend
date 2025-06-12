import { defineStore } from 'pinia';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  isGlobalSuperAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    userEmail: null,
    userName: null,
    userRole: null,
    isGlobalSuperAdmin: false,
  }),

  getters: {
    isLoggedIn: (state: AuthState): boolean => !!state.token,
  },

  actions: {
    setAuth(token: string, userEmail: string, userName: string, userRole: string, isGlobalSuperAdmin: boolean) {
      this.token = token;
      this.userEmail = userEmail;
      this.userName = userName;
      this.userRole = userRole;
      this.isGlobalSuperAdmin = isGlobalSuperAdmin;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', userEmail);
        localStorage.setItem('user_name', userName);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('is_global_super_admin', isGlobalSuperAdmin.toString());
      }
    },
    clearAuth() {
      this.token = null;
      this.userEmail = null;
      this.userName = null;
      this.userRole = null;
      this.isGlobalSuperAdmin = false;

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
        localStorage.removeItem('is_global_super_admin');
      }
    },
    initializeAuth() {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userEmail = localStorage.getItem('user_email');
        const userName = localStorage.getItem('user_name');
        const userRole = localStorage.getItem('user_role');
        const isGlobalSuperAdmin = localStorage.getItem('is_global_super_admin') === 'true';

        if (token && userEmail && userName && userRole) {
          this.setAuth(token, userEmail, userName, userRole, isGlobalSuperAdmin);
        }
      }
    }
  }
});