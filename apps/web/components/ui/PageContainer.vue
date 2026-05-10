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

const outerClass = computed(() => (props.padded ? 'py-4 sm:py-6' : ''))

const innerClass = computed(() => {
  let width = 'lg:max-w-4xl'

  if (props.size === 'wide') {
    width = 'lg:max-w-7xl'
  } else if (props.size === 'default') {
    width = 'lg:max-w-6xl'
  }

  return `w-full ${width} lg:mx-auto px-4 sm:px-6 lg:px-8`
})
</script>
