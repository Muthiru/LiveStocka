<template>
  <PageContainer size="narrow">
    <PageHeader title="Edit Cow" :subtitle="form.name ? `Update details for ${form.name}` : 'Update cow details'" />

    <LoadingState v-if="loading" text="Loading cow details..." />

    <CowForm v-else v-model:form="form" :is-edit="true" @submit="handleSubmit">
      <template #actions>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UButton
            type="button"
            color="error"
            variant="soft"
            :loading="deleting"
            :disabled="saving || deleting"
            icon="i-lucide-trash-2"
            @click="handleDelete"
          >
            Delete cow
          </UButton>

          <div class="flex flex-col gap-2 sm:flex-row">
            <UButton :to="`/cow/${route.params.id}`" variant="outline" color="neutral" :disabled="saving || deleting">
              Cancel
            </UButton>
            <UButton type="submit" color="primary" :loading="saving" :disabled="saving || deleting">
              Update cow
            </UButton>
          </div>
        </div>
      </template>
    </CowForm>
  </PageContainer>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CowFormData } from '~/types'

const { $supabase } = useNuxtApp()
const toast = useAppToast()
const route = useRoute()

const form = ref<CowFormData>({
  name: '',
  breed: '',
  tag_id: '',
  color: '',
  age: '',
  weight: '',
  status: 'active',
  birth_date: '',
  sire: '',
  dam: '',
  notes: ''
})
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

// Automatically calculate age when birth date changes
watch(() => form.value.birth_date, (newDate) => {
  if (newDate) {
    const birth = new Date(newDate)
    const now = new Date()
    const diff = now.getTime() - birth.getTime()
    const ageInYears = diff / (1000 * 60 * 60 * 24 * 365.25)
    form.value.age = Math.max(0, ageInYears).toFixed(1)
  }
})

onMounted(async () => {
  const { data, error } = await ($supabase as any)
    .from('cows')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error('Error loading cow:', error)
    toast.error('Failed to load cow details')
    navigateTo('/cows')
  } else {
    form.value = {
      ...data,
      age: data.age?.toString() || '',
      weight: data.weight?.toString() || ''
    }
  }
  loading.value = false
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const updateData = {
      ...form.value,
      age: form.value.age ? Number.parseFloat(form.value.age) : null,
      weight: form.value.weight ? Number.parseFloat(form.value.weight) : null
    }

    const { error } = await ($supabase as any)
      .from('cows')
      .update(updateData)
      .eq('id', route.params.id)

    if (error) throw error
    toast.success('Cow updated successfully')
    navigateTo(`/cow/${route.params.id}`)
  } catch (error) {
    console.error('Update error:', error)
    toast.error((error as Error).message)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this cow? This action cannot be undone.')) {
    return
  }

  deleting.value = true
  try {
    const { error } = await ($supabase as any)
      .from('cows')
      .delete()
      .eq('id', route.params.id)

    if (error) throw error
    toast.success('Cow deleted successfully')
    navigateTo('/cows')
  } catch (error) {
    console.error('Delete error:', error)
    toast.error((error as Error).message)
  } finally {
    deleting.value = false
  }
}
</script>
