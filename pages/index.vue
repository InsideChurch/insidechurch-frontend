<template>
    <div>
      <h1>InsideChurch Frontend</h1>
      <p>{{ message }}</p>
      <button @click="fetchBackendMessage">Fetch Message</button>
      <br><br>
      <NuxtLink to="/login">Go to Login</NuxtLink>
    </div>
  </template>
  
<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  const message = ref('Waiting for backend...');
  
  const fetchBackendMessage = async () => {
    try {
      const response = await axios.get('http://localhost:8080/');
      message.value = response.data;
    } catch (error) {
      console.error('Error fetching from backend:', error);
      message.value = 'Error connecting to backend.';
    }
  };
</script>