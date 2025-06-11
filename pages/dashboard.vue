<template>
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>You have successfully logged in.</p>
  
      <div v-if="isGlobalSuperAdmin">
        <h2>Admin Actions</h2>
        <NuxtLink to="/tenants">Create New Tenant</NuxtLink>
      </div>
  
      <br><br>
      <button @click="logout">Logout</button>
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