<template>
  <div class="mb-6 sm:mb-8">
    <div class="sticky top-14 z-20 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:static sm:top-auto sm:px-0 sm:py-0 sm:shadow-none">
      <div class="relative sm:hidden">
        <div v-if="resolvedBackTo" class="absolute left-0 top-0">
          <UButton
            :to="resolvedBackTo"
            color="neutral"
            variant="ghost"
            square
            icon="i-lucide-arrow-left"
            size="sm"
            class="shrink-0"
            :aria-label="backLabel"
          />
        </div>

        <div class="mx-auto max-w-[calc(100%-4rem)] text-center">
          <p v-if="resolvedBackTo" class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {{ backLabel }}
          </p>
          <h1 class="truncate text-2xl font-bold tracking-tight text-slate-900">
            <slot name="title">{{ title }}</slot>
          </h1>
          <p v-if="subtitle" class="mt-1 text-sm text-slate-600">
            <slot name="subtitle">{{ subtitle }}</slot>
          </p>
        </div>
      </div>

      <div class="hidden flex-col gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
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
      <div class="sm:hidden">
        <div v-if="$slots.actions" class="mt-4 flex flex-col gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  backTo?: string | null
  backLabel?: string
}>(), {
  title: '',
  subtitle: '',
  backTo: null,
  backLabel: 'Back'
})

const route = useRoute()

const routeBackMap: Record<string, string> = {
  '/cows': '/dashboard',
  '/add-cow': '/cows',
  '/health-records': '/cows',
  '/breeding': '/dashboard',
  '/milk-production': '/dashboard',
  '/family-tree': '/dashboard',
  '/reports': '/dashboard'
}

const resolvedBackTo = computed(() => {
  if (props.backTo !== null) return props.backTo || null

  const path = route.path

  if (/^\/edit-cow\//.test(path)) return '/cows'
  if (/^\/cow-records\//.test(path)) return '/cows'
  if (/^\/cow\/.+\/health$/.test(path)) return path.replace(/\/health$/, '')
  if (/^\/cow\//.test(path)) return '/cows'

  return routeBackMap[path] || null
})
</script>

