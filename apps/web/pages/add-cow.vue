<template>
  <div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Add New Cow</h1>
        <p class="mt-2 text-sm text-gray-600">Enter the details for your new cattle</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
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
                  v-model="form.name"
                  type="text"
                  id="name"
                  required
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Bella"
                />
              </div>

              <div>
                <label for="tag_id" class="block text-sm font-medium text-gray-700">Tag ID / RFID *</label>
                <input
                  v-model="form.tag_id"
                  type="text"
                  id="tag_id"
                  required
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., TAG-001"
                />
              </div>

              <div>
                <label for="breed" class="block text-sm font-medium text-gray-700">Breed</label>
                <input
                  v-model="form.breed"
                  type="text"
                  id="breed"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Holstein, Angus"
                />
              </div>

              <div>
                <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
                <input
                  v-model="form.color"
                  type="text"
                  id="color"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Black, Brown"
                />
              </div>

              <div>
                <label for="age" class="block text-sm font-medium text-gray-700">Age (years)</label>
                <input
                  v-model="form.age"
                  type="number"
                  id="age"
                  min="0"
                  step="0.1"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., 3.5"
                />
              </div>

              <div>
                <label for="weight" class="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  v-model="form.weight"
                  type="number"
                  id="weight"
                  min="0"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., 450"
                />
              </div>

              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="form.status"
                  id="status"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label for="birth_date" class="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  v-model="form.birth_date"
                  type="date"
                  id="birth_date"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Parentage Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Parentage (Optional)</h3>
          </div>
          <div class="px-5 py-5">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="sire" class="block text-sm font-medium text-gray-700">Sire (Father)</label>
                <input
                  v-model="form.sire"
                  type="text"
                  id="sire"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Sire name or ID"
                />
              </div>

              <div>
                <label for="dam" class="block text-sm font-medium text-gray-700">Dam (Mother)</label>
                <input
                  v-model="form.dam"
                  type="text"
                  id="dam"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Dam name or ID"
                />
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
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                v-model="form.notes"
                id="notes"
                rows="4"
                class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Any additional information about this cow..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/cows"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Saving...' : 'Save Cow' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { $supabase } = useNuxtApp()
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
const loading = ref(false)
const userId = ref(null)

onMounted(async () => {
  const { data: { user } } = await $supabase.auth.getUser()
  userId.value = user?.id
})

const handleSubmit = async () => {
  if (!userId.value) {
    alert('Please log in to add a cow')
    return
  }
  
  loading.value = true
  try {
    const { error } = await $supabase.from('cows').insert([{
      ...form.value,
      farm_id: userId.value
    }])
    if (error) throw error
    await navigateTo('/cows')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>
