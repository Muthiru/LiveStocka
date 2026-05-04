<template>
  <PageContainer size="narrow">
    <PageHeader title="Add New Cow" subtitle="Enter the details for your new cattle" />

    <CowForm v-model:form="form" @submit="handleSubmit">
      <template #actions>
        <div class="flex flex-col justify-end gap-2 sm:flex-row">
          <UButton to="/cows" variant="outline" color="neutral">
            Cancel
          </UButton>
          <UButton type="submit" :loading="loading" color="primary">
            Save cow
          </UButton>
        </div>
      </template>
    </CowForm>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CowFormData } from '~/types'

const toast = useAppToast()
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
