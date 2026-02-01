<script setup>
import { ref } from 'vue'

const message = ref('Welcome to LiveStocka Mobile App')
</script>

<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Cattle Tracking App - Mobile Version</p>
  </div>
</template>

<style scoped>
h1 {
  color: #42b883;
}
</style>