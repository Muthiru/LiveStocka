<template>
  <div :class="outerClass">
    <div :class="innerClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  padded?: boolean
  size?: 'default' | 'wide'
}>(), {
  padded: true,
  size: 'default'
})

const outerClass = computed(() => (props.padded ? 'py-6' : ''))

const innerClass = computed(() => {
  const width = props.size === 'wide' ? 'max-w-7xl' : 'max-w-6xl'
  return `${width} mx-auto px-4 sm:px-6 lg:px-8`
})
</script>
