<template>
    <div>
      <h1>Welcome to the Dashboard!</h1>
      <p>You have successfully logged in.</p>
      <button @click="logout">Logout</button>
    </div>
</template>
  
<script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    router.push('/login'); 
  };
</script>