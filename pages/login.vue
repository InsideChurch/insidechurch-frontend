<template>
  <div class="login-container">
    <h1>{{ $t('login.title') }}</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">{{ $t('login.email') }}:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">{{ $t('login.password') }}:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">{{ $t('login.button') }}</button>
    </form>
    <p v-if="errorMessage === 'Invalid credentials. Please try again.'" class="error-message">{{ $t('login.invalid_credentials') }}</p>
    <p v-else-if="errorMessage" class="error-message">{{ $t('login.unexpected_error') }}</p>
  </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  
  const handleLogin = async () => {
    errorMessage.value = '';
    try {
      const response = await axios.post('http://localhost:8080/login', {
        email: email.value,
        password: password.value,
      });
  
      const { token, user } = response.data;
  
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user)); 
  
      navigateTo('/dashboard');
  
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        errorMessage.value = 'Invalid credentials. Please try again.';
      } else {
        errorMessage.value = 'An unexpected error occurred. Please try again later.';
      }
    }
  };
</script>
  
<style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input[type="email"],
  input[type="password"] {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  button {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  button:hover {
    background-color: #0056b3;
  }
  .error-message {
    color: red;
    margin-top: 10px;
  }
</style>