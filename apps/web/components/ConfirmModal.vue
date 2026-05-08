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
      content: 'z-[1001] bg-white w-full max-w-md rounded-2xl shadow-xl ring-1 ring-slate-200 divide-y-0',
      header: 'p-4 sm:p-6',
      body: 'px-4 sm:px-6',
      footer: 'p-4 sm:p-6'
    }"
    @update:open="setOpen"
  >
    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <UButton color="neutral" variant="outline" :disabled="loading" @click="setOpen(false)">
          {{ cancelText }}
        </UButton>
        <UButton :color="confirmColor" variant="solid" :loading="loading" @click="$emit('confirm')">
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
