<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome to LiveStocka</h1>
      <p class="text-gray-600">Redirecting to login...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  navigateTo('/login')
})
</script>