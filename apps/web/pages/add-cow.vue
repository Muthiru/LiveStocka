<template>
  <div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Add New Cow</h1>
        <p class="page-subtitle">Enter the details for your new cattle</p>
      </div>

      <CowForm v-model:form="form" @submit="handleSubmit">
        <template #actions>
          <div class="flex justify-end space-x-3">
            <NuxtLink to="/cows" class="btn-secondary">
              Cancel
            </NuxtLink>
            <button type="submit" :disabled="loading" class="btn-primary">
              <LoadingSpinner v-if="loading" size="sm" :use-icon="true" class="-ml-1 mr-3" />
              {{ loading ? 'Saving...' : 'Save Cow' }}
            </button>
          </div>
        </template>
      </CowForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CowFormData } from '~/types'

const toast = useToast()
const { addCow, loading } = useCows()

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

const handleSubmit = async () => {
  try {
    await addCow(form.value)
    toast.success('Cow added successfully')
    await navigateTo('/cows')
  } catch (error) {
    toast.error((error as Error).message)
  }
}
</script>
