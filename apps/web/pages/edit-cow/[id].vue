<template>
  <div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Edit Cow</h1>
        <p class="page-subtitle">Update the details for {{ form.name }}</p>
      </div>

      <LoadingSpinner v-if="loading" text="Loading cow details..." class="py-12" />

      <CowForm v-else v-model:form="form" :is-edit="true" @submit="handleSubmit">
        <template #actions>
          <div class="flex justify-between">
            <button
              type="button"
              :disabled="saving || deleting"
              class="btn-danger"
              @click="handleDelete"
            >
              <LoadingSpinner v-if="deleting" size="sm" :use-icon="true" class="-ml-1 mr-3" />
              {{ deleting ? 'Deleting...' : 'Delete Cow' }}
            </button>
            
            <div class="flex space-x-3">
              <NuxtLink :to="`/cow/${route.params.id}`" class="btn-secondary">
                Cancel
              </NuxtLink>
              <button type="submit" :disabled="saving || deleting" class="btn-primary">
                <LoadingSpinner v-if="saving" size="sm" :use-icon="true" class="-ml-1 mr-3" />
                {{ saving ? 'Saving...' : 'Update Cow' }}
              </button>
            </div>
          </div>
        </template>
      </CowForm>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CowFormData } from '~/types'

const { $supabase } = useNuxtApp()
const toast = useToast()
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
