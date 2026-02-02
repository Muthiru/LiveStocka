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
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, tag ID, or breed..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
          </div>
          <div>
            <label for="status" class="sr-only">Status</label>
            <select
              id="status"
              v-model="statusFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option v-for="status in cowStatuses" :key="status.value" :value="status.value">{{ status.label }}</option>
            </select>
          </div>
          <div>
            <label for="breed" class="sr-only">Breed</label>
            <select
              id="breed"
              v-model="breedFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Breeds</option>
              <option v-for="breed in allBreeds" :key="breed" :value="breed">{{ breed }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/>
        <p class="mt-2 text-sm text-gray-500">Loading cows...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="cows.length === 0" class="text-center py-12 bg-white shadow rounded-lg">
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

      <!-- Cows Table -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="cow in cows" 
                :key="cow.id" 
                class="hover:bg-gray-50 cursor-pointer"
                @click="navigateTo(`/cow/${cow.id}`)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-lg font-medium text-indigo-600">{{ cow.name.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ cow.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ cow.tag_id || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ cow.breed || 'Unknown' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(cow.status)"
                  >
                    {{ cow.status || 'active' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ cow.age || 'N/A' }} yrs
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ cow.weight || 'N/A' }} kg
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <NuxtLink
                    :to="`/cow/${cow.id}`"
                    class="text-indigo-600 hover:text-indigo-900"
                    @click.stop
                  >
                    Details
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="totalCount > 0" class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            @click="prevPage"
          >
            Previous
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            @click="nextPage"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(currentPage * pageSize, totalCount) }}</span>
              of
              <span class="font-medium">{{ totalCount }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                @click="prevPage"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="[
                  page === currentPage ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0',
                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <button
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                @click="nextPage"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const { fetchCowsPaginated, getStatusClass, fetchCows, cowStatuses } = useCows()

// State
const cows = ref([])
const loading = ref(true)
const state = ref({
  searchQuery: '',
  statusFilter: '',
  breedFilter: '',
  currentPage: 1,
  pageSize: 10
})

const { searchQuery, statusFilter, breedFilter, currentPage, pageSize } = toRefs(state.value)
const totalCount = ref(0)
const allBreeds = ref([]) // For filter dropdown

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const displayedPages = computed(() => {
  const diff = 2
  const start = Math.max(1, currentPage.value - diff)
  const end = Math.min(totalPages.value, currentPage.value + diff)
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Use watcher for debounced search and filters
let searchTimeout
watch([searchQuery, statusFilter, breedFilter], () => {
  currentPage.value = 1 // Reset to first page
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCows()
  }, 300)
})

watch(currentPage, () => {
  loadCows()
})

async function loadCows() {
  loading.value = true
  try {
    const { data, count } = await fetchCowsPaginated({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      breed: breedFilter.value
    })
    cows.value = data
    totalCount.value = count
  } catch (err) {
    console.error('Error loading cows:', err)
  } finally {
    loading.value = false
  }
}

async function loadBreeds() {
  // Quick fetch to get all breeds for the filter
  // We use the normal fetch but just for distinct values logic (simulating distinct)
  const allData = await fetchCows() // This fetches everything by default, which is okay for just getting breeds initially or we could optimize
  // Or better, just get breeds column if possible, but fetchCows gets all.
  // With 500 rows, it's fine to fetch once for filter options.
  const breeds = [...new Set(allData.map(cow => cow.breed).filter(Boolean))]
  allBreeds.value = breeds.sort()
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goToPage(page) {
  currentPage.value = page
}

onMounted(async () => {
  await loadBreeds()
  await loadCows()
})
</script>
