<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading cow details...</p>
      </div>

      <div v-else-if="cow">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ cow.name }}</h1>
              <p class="mt-2 text-sm text-gray-600">Tag ID: {{ cow.tag_id || 'N/A' }}</p>
            </div>
            <div class="flex space-x-3">
              <NuxtLink
                :to="`/cow/${cow.id}/health`"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Health Records
              </NuxtLink>
              <button
                @click="handleEdit"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'overview'"
              :class="activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Overview
            </button>
            <button
              @click="activeTab = 'health'"
              :class="activeTab === 'health' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Health
            </button>
            <button
              @click="activeTab = 'reproduction'"
              :class="activeTab === 'reproduction' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Reproduction
            </button>
            <button
              @click="activeTab = 'milk'"
              :class="activeTab === 'milk' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Milk Production
            </button>
          </nav>
        </div>

        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div class="px-5 py-5">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.name || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Tag ID</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.tag_id || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Breed</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.breed || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Color</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.color || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Age</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.age ? `${cow.age} years` : 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Weight</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.weight ? `${cow.weight} kg` : 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(cow.status)"
                  >
                    {{ cow.status || 'active' }}
                  </span>
                </dd>
              </div>
              <div v-if="cow.birth_date">
                <dt class="text-sm font-medium text-gray-500">Birth Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(cow.birth_date) }}</dd>
              </div>
              <div v-if="cow.sire">
                <dt class="text-sm font-medium text-gray-500">Sire (Father)</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.sire }}</dd>
              </div>
              <div v-if="cow.dam">
                <dt class="text-sm font-medium text-gray-500">Dam (Mother)</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.dam }}</dd>
              </div>
            </dl>
            <dl v-if="cow.notes" class="mt-6">
              <dt class="text-sm font-medium text-gray-500">Notes</dt>
              <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ cow.notes }}</dd>
            </dl>
          </div>
        </div>

        <!-- Health Tab -->
        <div v-if="activeTab === 'health'" class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Health Records</h3>
            <NuxtLink
              :to="`/cow/${cow.id}/health`"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              View All →
            </NuxtLink>
          </div>
          <div class="px-5 py-5">
            <div v-if="healthRecords.length === 0" class="text-center py-8">
              <p class="text-sm text-gray-500">No health records yet.</p>
              <NuxtLink
                :to="`/cow/${cow.id}/health`"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Health Record
              </NuxtLink>
            </div>
            <ul v-else class="divide-y divide-gray-200">
              <li v-for="record in healthRecords.slice(0, 5)" :key="record.id" class="py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 capitalize">{{ record.type }}</p>
                    <p class="text-sm text-gray-500">{{ record.description }}</p>
                  </div>
                  <p class="text-sm text-gray-500">{{ formatDate(record.date) }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Reproduction Tab -->
        <div v-if="activeTab === 'reproduction'" class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Reproduction History</h3>
          </div>
          <div class="px-5 py-5">
            <div class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">Reproduction tracking coming soon</p>
            </div>
          </div>
        </div>

        <!-- Milk Production Tab -->
        <div v-if="activeTab === 'milk'" class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Milk Production</h3>
          </div>
          <div class="px-5 py-5">
            <div class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">Milk production tracking coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white shadow rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Cow not found</h3>
        <p class="mt-1 text-sm text-gray-500">The cow you're looking for doesn't exist.</p>
        <div class="mt-6">
          <NuxtLink
            to="/cows"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Cows
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '~/utils/formatDate.js'

const { $supabase } = useNuxtApp()
const route = useRoute()
const cow = ref(null)
const healthRecords = ref([])
const loading = ref(true)
const activeTab = ref('overview')

const handleEdit = () => {
  navigateTo(`/edit-cow/${route.params.id}`)
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-yellow-100 text-yellow-800',
    deceased: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  // Fetch cow details
  const { data, error } = await $supabase
    .from('cows')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error(error)
  } else {
    cow.value = data
  }

  // Fetch recent health records
  const { data: records } = await $supabase
    .from('health_records')
    .select('*')
    .eq('cow_id', route.params.id)
    .order('date', { ascending: false })
    .limit(5)

  healthRecords.value = records || []
  loading.value = false
})
</script>
