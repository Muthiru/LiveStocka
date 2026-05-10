<template>
  <PageContainer size="wide">
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete cow?"
      description="This will permanently remove the cow and all associated records. This action cannot be undone."
      confirm-text="Delete cow"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <div class="mx-auto w-[calc(100%-1.5rem)] max-w-5xl">
      <PageHeader title="Edit Cow" :subtitle="form.name ? `Update details for ${form.name}` : 'Update cow details'" />

      <LoadingState v-if="loading" text="Loading cow details..." />

      <CowForm v-else v-model:form="form" :is-edit="true" @submit="handleSubmit">
        <template #actions>
          <div class="mt-2 space-y-3 sm:mt-4">
            <!-- Delete button section -->
            <div class="flex justify-start">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="saving || deleting"
                @click="showDeleteModal = true"
              >
                <Icon name="lucide:trash-2" class="h-4 w-4" />
                Delete cow
              </button>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-row justify-between gap-3">
              <UButton :to="`/cow/${cowId}`" variant="outline" color="neutral" :disabled="saving || deleting">
                Cancel
              </UButton>
              <UButton
                type="submit"
                class="bg-green-600 hover:bg-green-700 text-white"
                :loading="saving"
                :disabled="saving || deleting"
              >
                Update cow
              </UButton>
            </div>
          </div>
        </template>
      </CowForm>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import type { CowFormData } from '~/types'

const toast = useAppToast()
const route = useRoute()
const { getCowById, updateCow, deleteCow } = useCows()

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
  genetic_line: '',
  notes: ''
})
const cowId = ref<string>('')
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)

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
  const cow = await getCowById(String(route.params.id))
  if (!cow) {
    toast.error('Failed to load cow details')
    return navigateTo('/cows')
  }

  cowId.value = cow.id
  form.value = {
    name: cow.name || '',
    breed: cow.breed || '',
    tag_id: cow.tag_id || '',
    color: cow.color || '',
    age: cow.age?.toString() || '',
    weight: cow.weight?.toString() || '',
    status: cow.status || 'active',
    birth_date: cow.birth_date || '',
    sire: cow.sire || '',
    dam: cow.dam || '',
    genetic_line: cow.genetic_line || '',
    notes: cow.notes || ''
  }
  loading.value = false
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const updated = await updateCow(cowId.value, {
      ...form.value,
      age: form.value.age ? Number.parseFloat(form.value.age).toString() : null,
      weight: form.value.weight ? Number.parseFloat(form.value.weight).toString() : null
    })

    if (!updated) throw new Error('Failed to update cow')
    toast.success('Cow updated successfully')
    await navigateTo(`/cow/${cowId.value}`)
  } catch (error) {
    console.error('Update error:', error)
    toast.error((error as Error).message)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (deleting.value) return

  deleting.value = true
  try {
    const ok = await deleteCow(cowId.value)
    if (!ok) throw new Error('Failed to delete cow')
    toast.success('Cow deleted successfully')
    await navigateTo('/cows')
  } catch (error) {
    console.error('Delete error:', error)
    toast.error((error as Error).message)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}
</script>
