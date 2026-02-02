<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Health Records</h1>
          <p v-if="cow" class="mt-2 text-sm text-gray-600">for {{ cow.name }}</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink
            :to="`/cow/${route.params.id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cow
          </NuxtLink>
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            @click="showAddForm = !showAddForm"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ showAddForm ? 'Cancel' : 'Add Record' }}
          </button>
        </div>
      </div>

      <!-- Add Record Form -->
      <div v-if="showAddForm" class="mb-6 bg-white shadow rounded-lg">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Add Health Record</h3>
        </div>
        <form class="px-5 py-5" @submit.prevent="handleAddRecord">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700">Type *</label>
              <select
                id="type"
                v-model="newRecord.type"
                required
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="vaccination">Vaccination</option>
                <option value="medication">Medication</option>
                <option value="disease">Disease</option>
                <option value="checkup">Checkup</option>
                <option value="treatment">Treatment</option>
              </select>
            </div>
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700">Date *</label>
              <input
                id="date"
                v-model="newRecord.date"
                type="date"
                required
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
            </div>
            <div class="sm:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                v-model="newRecord.description"
                rows="3"
                class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter details about the health record..."
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="showAddForm = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="adding"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <svg v-if="adding" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ adding ? 'Adding...' : 'Add Record' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Health Records List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Health History</h3>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/>
          <p class="mt-2 text-sm text-gray-500">Loading records...</p>
        </div>
        <div v-else-if="healthRecords.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No health records</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a health record.</p>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="record in healthRecords" :key="record.id" class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div :class="getTypeIconClass(record.type)" class="h-10 w-10 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium" :class="getTypeTextClass(record.type)">{{ record.type.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ record.type }}</div>
                  <div class="text-sm text-gray-500">{{ record.description || 'No description' }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ formatDate(record.date) }}</div>
                <div class="text-xs text-gray-500">{{ getRelativeDate(record.date) }}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate, getRelativeDate } from '~/utils/formatDate.js'

const { $supabase } = useNuxtApp()
const route = useRoute()
const cow = ref(null)
const healthRecords = ref([])
const showAddForm = ref(false)
const adding = ref(false)
const loading = ref(true)
const newRecord = ref({
  type: 'vaccination',
  description: '',
  date: new Date().toISOString().split('T')[0]
})

const getTypeIconClass = (type) => {
  const classes = {
    vaccination: 'bg-yellow-100',
    medication: 'bg-blue-100',
    disease: 'bg-red-100',
    checkup: 'bg-green-100',
    treatment: 'bg-purple-100'
  }
  return classes[type] || 'bg-gray-100'
}

const getTypeTextClass = (type) => {
  const classes = {
    vaccination: 'text-yellow-800',
    medication: 'text-blue-800',
    disease: 'text-red-800',
    checkup: 'text-green-800',
    treatment: 'text-purple-800'
  }
  return classes[type] || 'text-gray-800'
}


const loadData = async () => {
  // Fetch cow details
  const { data: cowData } = await $supabase
    .from('cows')
    .select('*')
    .eq('id', route.params.id)
    .single()
  cow.value = cowData

  // Fetch health records
  const { data: records } = await $supabase
    .from('health_records')
    .select('*')
    .eq('cow_id', route.params.id)
    .order('date', { ascending: false })
  
  healthRecords.value = records || []
  loading.value = false
}

onMounted(loadData)

const handleAddRecord = async () => {
  adding.value = true
  try {
    const { error } = await $supabase.from('health_records').insert([{
      ...newRecord.value,
      cow_id: route.params.id
    }])
    if (error) throw error
    
    // Reload data
    await loadData()
    
    showAddForm.value = false
    newRecord.value = {
      type: 'vaccination',
      description: '',
      date: new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    alert(error.message)
  } finally {
    adding.value = false
  }
}
</script>
