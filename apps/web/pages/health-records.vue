<template>
  <PageContainer size="wide">
    <PageHeader title="Health Records" subtitle="Select a cow to view and manage health records" />

      <!-- Alerts Section -->
      <div v-if="overdueVaccinations.length > 0" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 mt-0.5" />
            <div class="flex-1">
              <h3 class="font-semibold text-red-900">Overdue Checkups</h3>
              <p class="text-sm text-red-700 mt-1">
                {{ overdueVaccinations.length }} checkup(s) overdue
              </p>
              <div class="mt-2 space-y-1">
                <div v-for="record in overdueVaccinations.slice(0, 3)" :key="record.id" class="text-sm text-red-800">
                  • {{ getCowName(record.cow_id) }} - {{ record.title }} (Due: {{ formatDate(record.next_checkup_date) }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or tag..."
            class="form-input"
          >
          <select v-model="filterStatus" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pregnant">Pregnant</option>
            <option value="dry">Dry</option>
            <option value="sold">Sold</option>
          </select>
          <select v-model="itemsPerPage" class="form-select">
            <option :value="5">5 per page</option>
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>

      <!-- Cows Data Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <LoadingState v-if="loading" text="Loading cows..." />

        <div v-else-if="filteredCows.length === 0" class="p-6">
          <EmptyState
            title="No cows found"
            description="Try adjusting your search or filter criteria."
            icon="lucide:search-x"
          />
        </div>

        <div v-else>
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cow
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breed
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Records
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checkup
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="cow in paginatedCows"
                  :key="cow.id"
                  class="hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="selectCow(cow)"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span class="text-sm font-semibold text-green-700">{{ cow.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ cow.name }}</div>
                        <div v-if="cow.age" class="text-sm text-gray-500">{{ cow.age }} years old</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-mono text-gray-900">{{ cow.tag_id }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ cow.breed || '-' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(cow.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ cow.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ getCowRecordCount(cow.id) }} records</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-500">{{ getLastCheckupDate(cow.id) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      @click.stop="openAddModal(cow)"
                    >
                      <Icon name="lucide:plus" class="w-4 h-4" />
                      Add Record
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ startIndex + 1 }}</span> to
              <span class="font-medium">{{ Math.min(endIndex, filteredCows.length) }}</span> of
              <span class="font-medium">{{ filteredCows.length }}</span> cows
            </div>
            <div class="flex gap-2">
              <button
                :disabled="currentPage === 1"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="currentPage--"
              >
                Previous
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  :class="[
                    'px-3 py-1.5 text-sm rounded-lg',
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  ]"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </div>
              <button
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="currentPage++"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cow Records Modal (replaces inline selected-cow panel) -->
	      <CowRecordsModal
	        v-model="showCowModal"
	        :cow="selectedCow"
	        :records="selectedCowRecords"
	        @add="openAddModal"
	        @edit="editRecord"
	        @delete="confirmDelete"
	      />

	    <!-- Add/Edit Modal -->
	    <HealthRecordModal
	      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cows"
      :preselected-cow-id="preselectedCowId"
      @save="handleSave"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import type { Cow, HealthRecord } from '~/types'
import { getCowStatusColor } from '~/utils/statusHelpers'

definePageMeta({
  middleware: 'auth'
})


const route = useRoute()
const router = useRouter()

const { healthRecords, loading: recordsLoading, fetchHealthRecords, deleteHealthRecord, getOverdueVaccinations } = useHealthRecords()
const { cows, loading: cowsLoading, fetchCows } = useCows()

const loading = computed(() => cowsLoading.value || recordsLoading.value)

// State
const searchQuery = ref('')
const filterStatus = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedCow = ref<Cow | null>(null)
const showAddModal = ref(false)
const showCowModal = ref(false)
const selectedRecord = ref<HealthRecord | null>(null)
const preselectedCowId = ref<string | null>(null)

// Computed
const overdueVaccinations = computed(() => getOverdueVaccinations())

const filteredCows = computed(() => {
  let result = [...cows.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(cow =>
      cow.name.toLowerCase().includes(query) ||
      cow.tag_id.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    result = result.filter(cow => cow.status === filterStatus.value)
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredCows.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedCows = computed(() => {
  return filteredCows.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const selectedCowRecords = computed(() => {
  if (!selectedCow.value) return []
  return healthRecords.value
    .filter(r => r.cow_id === selectedCow.value?.id)
    .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
})

// Methods
const getCowName = (cowId: string) => {
  const cow = cows.value.find(c => c.id === cowId)
  return cow?.name || 'Unknown'
}

const getCowRecordCount = (cowId: string) => {
  return healthRecords.value.filter(r => r.cow_id === cowId).length
}

const getLastCheckupDate = (cowId: string) => {
  const cowRecords = healthRecords.value.filter(r => r.cow_id === cowId)
  if (cowRecords.length === 0) return 'Never'

  const latest = cowRecords.reduce((a, b) =>
    new Date(a.record_date) > new Date(b.record_date) ? a : b
  )
  return new Date(latest.record_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusColor = getCowStatusColor

const selectCow = (cow: Cow) => {
  // Navigate to the paginated health report book page for this cow
  try {
    router.push({ path: `/cow-records/${cow.id}` })
  } catch (e) {
    console.error('Failed to navigate to cow records page:', e)
  }
}

const openAddModal = (cow: Cow) => {
  preselectedCowId.value = cow.id
  selectedRecord.value = null
  showAddModal.value = true
}

const editRecord = (record: HealthRecord) => {
  selectedRecord.value = { ...record }
  preselectedCowId.value = record.cow_id
  showAddModal.value = true
}

const confirmDelete = async (record: HealthRecord) => {
  if (confirm(`Are you sure you want to delete this health record?`)) {
    await deleteHealthRecord(record.id)
    await fetchHealthRecords()
  }
}

const handleSave = async () => {
  showAddModal.value = false
  selectedRecord.value = null
  preselectedCowId.value = null
  await fetchHealthRecords()
}

// Watch for filter changes to reset pagination
watch([searchQuery, filterStatus, itemsPerPage], () => {
  currentPage.value = 1
})

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchCows(),
    fetchHealthRecords()
  ])

  // Open add modal if navigated with ?add=1 (optionally with ?cowId=<id>)
  if (route.query.add) {
    preselectedCowId.value = route.query.cowId ? String(route.query.cowId) : null
    showAddModal.value = true
    // remove query param to avoid reopening modal on navigation
    try {
      router.replace({ path: route.path, query: {} })
    } catch (e) {
      console.error('Failed to clear query params after opening add modal:', e)
    }
  }

  // Open cow modal if navigated with ?cowId=<id>
  if (route.query.cowId) {
    const id = String(route.query.cowId)
    const cowFound = cows.value.find(c => c.id === id)
    if (cowFound) {
      selectedCow.value = cowFound
      showCowModal.value = true
    }
    try {
      router.replace({ path: route.path, query: {} })
    } catch (e) {
      console.error('Failed to clear query params after opening cow modal:', e)
    }
  }
})
</script>
