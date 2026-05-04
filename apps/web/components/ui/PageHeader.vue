<template>
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle" class="mt-2 text-sm text-slate-600">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>

    <div v-if="$slots.actions" class="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

