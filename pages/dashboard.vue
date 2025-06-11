<template>
  <div>
    <h1>{{ $t('dashboard.title') }}</h1>
    <p>{{ $t('dashboard.logged_in_message') }}</p>

    <div v-if="isGlobalSuperAdmin">
      <h2>{{ $t('dashboard.admin_actions') }}</h2>
      <NuxtLink to="/tenants">{{ $t('dashboard.create_tenant_link') }}</NuxtLink>
    </div>

    <br><br>
    <button @click="logout">{{ $t('dashboard.logout_button') }}</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isGlobalSuperAdmin = ref(false);

onMounted(() => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.is_global_super_admin) {
    isGlobalSuperAdmin.value = true;
  }
});

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  router.push('/login');
};
</script>