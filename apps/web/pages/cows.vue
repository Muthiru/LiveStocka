<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">My Cows</h1>
          <p class="mt-2 text-sm text-gray-600">Manage and track your cattle</p>
        </div>
        <NuxtLink
          to="/add-cow"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Cow
        </NuxtLink>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6 bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <label for="search" class="sr-only">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                id="search"
                placeholder="Search by name, tag ID, or breed..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label for="status" class="sr-only">Status</label>
            <select
              v-model="statusFilter"
              id="status"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div>
            <label for="breed" class="sr-only">Breed</label>
            <select
              v-model="breedFilter"
              id="breed"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Breeds</option>
              <option v-for="breed in uniqueBreeds" :key="breed" :value="breed">{{ breed }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading cows...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCows.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No cows found</h3>
        <p class="mt-1 text-sm text-gray-500">{{ searchQuery || statusFilter || breedFilter ? 'Try adjusting your filters.' : 'Get started by adding your first cow.' }}</p>
        <div class="mt-6">
          <NuxtLink
            to="/add-cow"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Cow
          </NuxtLink>
        </div>
      </div>

      <!-- Cows Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="cow in filteredCows"
          :key="cow.id"
          class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateTo(`/cow/${cow.id}`)"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-2xl font-medium text-indigo-600">{{ cow.name.charAt(0) }}</span>
                </div>
              </div>
              <div class="ml-5 flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ cow.name }}</h3>
                <p class="text-sm text-gray-500">{{ cow.breed || 'Unknown breed' }}</p>
                <p class="text-xs text-gray-400 mt-1">Tag: {{ cow.tag_id || 'N/A' }}</p>
              </div>
              <div class="ml-4 flex-shrink-0">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(cow.status)"
                >
                  {{ cow.status || 'active' }}
                </span>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Age</p>
                <p class="font-medium text-gray-900">{{ cow.age || 'N/A' }} years</p>
              </div>
              <div>
                <p class="text-gray-500">Weight</p>
                <p class="font-medium text-gray-900">{{ cow.weight || 'N/A' }} kg</p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <NuxtLink
                :to="`/cow/${cow.id}`"
                class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                @click.stop
              >
                View Details →
              </NuxtLink>
              <NuxtLink
                :to="`/cow/${cow.id}/health`"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                @click.stop
              >
                Health Records →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const { $supabase } = useNuxtApp()
const cows = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const breedFilter = ref('')

const uniqueBreeds = computed(() => {
  const breeds = [...new Set(cows.value.map(cow => cow.breed).filter(Boolean))]
  return breeds.sort()
})

const filteredCows = computed(() => {
  let filtered = cows.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(cow =>
      cow.name?.toLowerCase().includes(query) ||
      cow.tag_id?.toLowerCase().includes(query) ||
      cow.breed?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(cow => cow.status === statusFilter.value)
  }

  if (breedFilter.value) {
    filtered = filtered.filter(cow => cow.breed === breedFilter.value)
  }

  return filtered
})

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-yellow-100 text-yellow-800',
    deceased: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  const { data, error } = await $supabase.from('cows').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error(error)
  } else {
    cows.value = data || []
  }
  loading.value = false
})
</script>
