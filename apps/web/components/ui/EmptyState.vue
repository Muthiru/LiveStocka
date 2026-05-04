<template>
  <div :class="rootClass">
    <div v-if="icon" class="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
      <Icon :name="icon" class="h-6 w-6" />
    </div>
    <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-sm leading-6 text-slate-600">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-6 flex justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  boxed?: boolean
}>(), {
  description: '',
  icon: '',
  boxed: true
})

const rootClass = computed(() => {
  const base = 'text-center'
  if (props.boxed === false) return base
  return `${base} rounded-2xl border border-slate-200 bg-white p-8 shadow-sm`
})
</script>
