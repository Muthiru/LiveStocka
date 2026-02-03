<template>
  <div class="text-center" :class="containerClass">
    <Icon 
      v-if="useIcon" 
      name="lucide:loader-2" 
      class="animate-spin text-indigo-600 mx-auto" 
      :class="sizeClass" 
    />
    <div 
      v-else 
      class="inline-block animate-spin rounded-full border-b-2 border-indigo-600" 
      :class="sizeClass"
    />
    <p v-if="text" class="mt-2 text-sm text-gray-500">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  size?: 'sm' | 'md' | 'lg'
  useIcon?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>(), {
  text: '',
  size: 'md',
  useIcon: true,
  padding: 'lg'
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  return sizes[props.size]
})

const containerClass = computed(() => {
  const paddings = {
    none: '',
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  }
  return paddings[props.padding]
})
</script>
