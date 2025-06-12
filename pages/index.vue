<template>
  <div>
    <p>Redirecting to login...</p>
  </div>
</template>

<script setup>
navigateTo('/login', { external: false, redirectCode: 302 });
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
  font-size: 1.2rem;
  color: #333;
}
</style>