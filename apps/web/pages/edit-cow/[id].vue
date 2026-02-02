<template>
  <div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Edit Cow</h1>
        <p class="mt-2 text-sm text-gray-600">Update the details for {{ form.name }}</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/>
        <p class="mt-2 text-sm text-gray-500">Loading cow details...</p>
      </div>

      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div class="px-5 py-5">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="tag_id" class="block text-sm font-medium text-gray-700">Tag ID / RFID *</label>
                <input
                  id="tag_id"
                  v-model="form.tag_id"
                  type="text"
                  required
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="breed" class="block text-sm font-medium text-gray-700">Breed</label>
                <input
                  id="breed"
                  v-model="form.breed"
                  type="text"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
                <input
                  id="color"
                  v-model="form.color"
                  type="text"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="age" class="block text-sm font-medium text-gray-700">Age (years)</label>
                <input
                  id="age"
                  v-model="form.age"
                  type="number"
                  min="0"
                  step="0.1"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="weight" class="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  id="weight"
                  v-model="form.weight"
                  type="number"
                  min="0"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  v-model="form.status"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="status in cowStatuses" :key="status.value" :value="status.value">{{ status.label }}</option>
                </select>
              </div>

              <div>
                <label for="birth_date" class="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  id="birth_date"
                  v-model="form.birth_date"
                  type="date"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Parentage Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Parentage</h3>
          </div>
          <div class="px-5 py-5">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="sire" class="block text-sm font-medium text-gray-700">Sire (Father)</label>
                <input
                  id="sire"
                  v-model="form.sire"
                  type="text"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>

              <div>
                <label for="dam" class="block text-sm font-medium text-gray-700">Dam (Mother)</label>
                <input
                  id="dam"
                  v-model="form.dam"
                  type="text"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Additional Notes</h3>
          </div>
          <div class="px-5 py-5">
            <textarea
              v-model="form.notes"
              rows="4"
              class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between">
          <button
            type="button"
            :disabled="saving || deleting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            @click="handleDelete"
          >
            <svg v-if="deleting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ deleting ? 'Deleting...' : 'Delete Cow' }}
          </button>
          
          <div class="flex space-x-3">
            <NuxtLink
              :to="`/cow/${route.params.id}`"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="saving || deleting"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ saving ? 'Saving...' : 'Update Cow' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const { $supabase } = useNuxtApp()
const { cowStatuses } = useCows()
const route = useRoute()
const form = ref({
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
    // Calculate difference in milliseconds
    const diff = now - birth
    // Convert to years (approximate)
    const ageInYears = diff / (1000 * 60 * 60 * 24 * 365.25)
    // Round to 1 decimal place
    form.value.age = Math.max(0, ageInYears).toFixed(1)
  }
})

onMounted(async () => {
  const { data, error } = await $supabase
    .from('cows')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error('Error loading cow:', error)
    alert('Failed to load cow details')
    navigateTo('/cows')
  } else {
    form.value = data
  }
  loading.value = false
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const { error } = await $supabase
      .from('cows')
      .update(form.value)
      .eq('id', route.params.id)

    if (error) throw error
    navigateTo(`/cow/${route.params.id}`)
  } catch (error) {
    console.error('Update error:', error)
    alert(error.message)
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
    const { error } = await $supabase
      .from('cows')
      .delete()
      .eq('id', route.params.id)

    if (error) throw error
    navigateTo('/cows')
  } catch (error) {
    console.error('Delete error:', error)
    alert(error.message)
  } finally {
    deleting.value = false
  }
}
</script>
