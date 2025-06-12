<template>
  <div class="dashboard-container">
    <h1>{{ $t('dashboard.title') }}</h1>
    <p>{{ $t('dashboard.logged_in_message') }}</p>

    <div class="user-info-section">
      <h2>{{ $t('dashboard.welcome_user', { name: authStore.userName }) }}</h2>
      <p><strong>{{ $t('dashboard.email_label') }}:</strong> {{ authStore.userEmail }}</p>
      <p><strong>{{ $t('dashboard.role_label') }}:</strong> {{ authStore.userRole }}</p>
    </div>
    
    <br>

    <div v-if="authStore.isGlobalSuperAdmin" class="admin-actions-section">
      <h2>{{ $t('dashboard.admin_actions') }}</h2>
      <div class="action-links">
        <NuxtLink to="/tenants" class="button">{{ $t('dashboard.create_tenant_link') }}</NuxtLink>
        <NuxtLink to="/tenants-admins" class="button">{{ $t('dashboard.create_tenant_admin_link') }}</NuxtLink>
      </div>
    </div>

    <br>

    <div class="general-actions-section">
      <button @click="handleLogout" class="logout-button">{{ $t('dashboard.logout_button') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore(); 
const router = useRouter();

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>


<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
  color: #333;
}

h1, h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

p {
  line-height: 1.6;
  margin-bottom: 10px;
}

.user-info-section,
.admin-actions-section,
.general-actions-section {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
}

.action-links .button {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.action-links .button:hover {
  background-color: #2980b9;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style>