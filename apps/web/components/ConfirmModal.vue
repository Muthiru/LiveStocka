<template>
  <UModal
    v-if="open"
    :open="open"
    :title="title"
    :description="description"
    scrollable
    :dismissible="!loading"
    :close="!loading"
    portal="body"
    :ui="{
      overlay: 'z-[1000] bg-slate-900/20 grid place-items-center p-4 sm:py-8',
      content: 'z-[1001] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200',
      header: 'hidden',
      body: 'p-0',
      footer: 'border-t border-slate-200 bg-slate-50/90 px-5 py-4 sm:px-6',
      close: 'absolute top-4 right-4'
    }"
    @update:open="setOpen"
  >
    <template #body>
      <div class="px-5 pt-5 sm:px-6 sm:pt-6">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <Icon name="lucide:triangle-alert" class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ description }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <UButton color="neutral" variant="outline" class="w-full sm:w-auto" :disabled="loading" @click="setOpen(false)">
          {{ cancelText }}
        </UButton>
        <UButton :color="confirmColor" variant="solid" class="w-full sm:w-auto" :loading="loading" @click="$emit('confirm')">
          {{ confirmText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  cancelText?: string
  confirmText?: string
  confirmColor?: 'primary' | 'neutral' | 'success' | 'warning' | 'error'
  loading?: boolean
}>(), {
  description: '',
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmColor: 'primary',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const open = computed(() => props.modelValue)
const setOpen = (value: boolean) => emit('update:modelValue', value)
</script>
