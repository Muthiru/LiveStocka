<template>
  <div :class="rootClass">
    <LoadingSpinner :size="size" :text="text" :use-icon="useIcon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  size?: 'sm' | 'md' | 'lg'
  useIcon?: boolean
  boxed?: boolean
}>(), {
  text: 'Loading…',
  size: 'md',
  useIcon: true,
  boxed: true
})

const rootClass = computed(() => {
  const base = 'text-center'
  if (props.boxed === false) return base
  return `${base} rounded-2xl border border-slate-200 bg-white p-8 shadow-sm`
})
</script>
