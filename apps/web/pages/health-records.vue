<template>
  <PageContainer size="wide">
    <PageHeader title="Health Records" subtitle="Quick access to all health records across your herd" />

    <HealthRecordModal
      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cows"
      :preselected-cow-id="preselectedCowId"
      @save="handleSave"
    />

    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete record?"
      :description="deleteDescription"
      confirm-text="Delete"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <div class="mx-auto max-w-7xl px-4 pt-4 space-y-6">
      <!-- Alerts Section -->
      <div v-if="overdueVaccinations.length > 0" class="mb-6">
        <div class="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 shadow-sm">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="mt-0.5 h-5 w-5 text-red-600" />
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
      <div class="mb-6 rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 items-end">
          <div class="col-span-2 md:col-span-2">
            <label for="hr-search" class="sr-only">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="hr-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search title or description"
                class="form-input pl-10"
              >
            </div>
          </div>

          <div>
            <label for="hr-type" class="sr-only">Type</label>
            <div class="relative">
              <select
                id="hr-type"
                v-model="filterStatus"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">All types</option>
                <option value="vaccination">Vaccination</option>
                <option value="medication">Medication</option>
                <option value="disease">Disease</option>
                <option value="treatment">Treatment</option>
                <option value="checkup">Checkup</option>
                <option value="injury">Injury</option>
                <option value="other">Other</option>
              </select>
              <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label for="hr-period" class="sr-only">Time period</label>
            <div class="relative">
              <select
                id="hr-period"
                v-model="filterPeriod"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="1">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="365">Last 365 days</option>
                <option value="all">All time</option>
              </select>
              <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div class="col-span-2 flex items-center justify-start md:col-span-1 md:justify-end">
            <UButton color="primary" icon="i-lucide-plus" @click="openAddModal()">
              Add record
            </UButton>
          </div>
        </div>
      </div>

      <LoadingState v-if="loading" text="Loading health records..." />

      <EmptyState
        v-else-if="filteredRecords.length === 0"
        title="No records found"
        description="Try adjusting your search or filter criteria."
        icon="lucide:heart-pulse"
      >
        <template #actions>
          <UButton color="primary" icon="i-lucide-plus" @click="openAddModal()">
            Add record
          </UButton>
        </template>
      </EmptyState>

      <!-- Mobile list (cards) -->
      <div v-else class="space-y-4 md:hidden">
        <button
          v-for="record in paginatedRecords"
          :key="record.id"
          type="button"
          class="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          @click="editRecord(record)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span :class="getTypeColor(record.record_type)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {{ formatRecordType(record.record_type) }}
                </span>
                <span class="text-xs text-slate-500">{{ formatDate(record.record_date) }}</span>
              </div>
              <p class="mt-2 truncate text-base font-semibold text-slate-900">{{ record.title }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ getCowName(record.cow_id) }} · Tag: {{ getCowTag(record.cow_id) }}</p>
            </div>
          </div>
          <p v-if="record.description" class="mt-3 line-clamp-2 text-sm text-slate-600">{{ record.description }}</p>
          <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span v-if="record.vet_name" class="inline-flex items-center gap-1">
              <Icon name="lucide:stethoscope" class="h-4 w-4" />
              {{ record.vet_name }}
            </span>
            <span v-if="record.cost !== null && record.cost !== undefined && String(record.cost).trim() !== ''" class="inline-flex items-center gap-1">
              <Icon name="lucide:coins" class="h-4 w-4" />
              {{ record.cost }}
            </span>
          </div>
          <div class="mt-4 flex items-center justify-end gap-2">
            <button
              class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700"
              @click.stop="editRecord(record)"
            >
              <Icon name="lucide:pencil" class="h-4 w-4" />
              Edit
            </button>
          </div>
        </button>
      </div>

      <div v-if="filteredRecords.length > 0" class="hidden overflow-hidden rounded-lg bg-white shadow-sm md:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cow</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="record in paginatedRecords" :key="record.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeColor(record.record_type)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {{ formatRecordType(record.record_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ getCowName(record.cow_id) }}</div>
                  <div class="text-sm text-gray-500">Tag: {{ getCowTag(record.cow_id) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(record.record_date) }}
                  <span v-if="record.record_time">· {{ record.record_time }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ record.title }}</div>
                  <div v-if="record.description" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ record.description }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div class="space-y-1">
                    <div v-if="record.vet_name">Vet: {{ record.vet_name }}</div>
                    <div v-if="record.medication_name">Medication: {{ record.medication_name }}</div>
                    <div v-if="record.vaccine_name">Vaccine: {{ record.vaccine_name }}</div>
                    <div v-if="record.next_checkup_date">Next checkup: {{ formatDate(record.next_checkup_date) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex justify-end gap-2">
                    <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="editRecord(record)" />
                    <UButton size="xs" color="error" icon="lucide:trash-2" @click="promptDelete(record)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4">
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ startIndex + 1 }}</span> to
            <span class="font-medium">{{ Math.min(endIndex, filteredRecords.length) }}</span> of
            <span class="font-medium">{{ filteredRecords.length }}</span> records
          </div>
          <div class="flex gap-2">
            <button
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click="currentPage--"
            >
              Previous
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="[
                  'rounded-lg px-3 py-1.5 text-sm',
                  page === currentPage ? 'bg-green-600 text-white' : 'border border-gray-300 hover:bg-gray-100'
                ]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </div>
            <button
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              @click="currentPage++"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'
import type { HealthRecord } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const { healthRecords, loading: recordsLoading, fetchHealthRecords, deleteHealthRecord, getOverdueVaccinations } = useHealthRecords()
const { cows, loading: cowsLoading, fetchCows } = useCows()

const loading = computed(() => cowsLoading.value || recordsLoading.value)

const searchQuery = ref('')
const filterStatus = ref('')
const filterPeriod = ref('30')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const selectedRecord = ref<HealthRecord | null>(null)
const deleteTarget = ref<HealthRecord | null>(null)
const deleting = ref(false)
const preselectedCowId = ref<string | null>(null)
const overdueVaccinations = ref<HealthRecord[]>([])

const deleteDescription = computed(() => {
  const title = deleteTarget.value?.title || 'this record'
  return `This will permanently delete "${title}".`
})

const getCowById = (cowId: string) => cows.value.find(cow => cow.id === cowId)

const getCowName = (cowId: string) => getCowById(cowId)?.name || 'Unknown'

const getCowTag = (cowId: string) => getCowById(cowId)?.tag_id || 'N/A'

const getTypeColor = (type: HealthRecord['record_type']) => {
  if (type === 'vaccination') return 'bg-blue-100 text-blue-700'
  if (type === 'medication') return 'bg-purple-100 text-purple-700'
  if (type === 'disease') return 'bg-red-100 text-red-700'
  if (type === 'treatment') return 'bg-amber-100 text-amber-700'
  if (type === 'checkup') return 'bg-emerald-100 text-emerald-700'
  if (type === 'injury') return 'bg-orange-100 text-orange-700'
  return 'bg-slate-100 text-slate-700'
}

const formatRecordType = (type: HealthRecord['record_type']) => {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const filteredRecords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const recordType = filterStatus.value
  const periodValue = filterPeriod.value

  const cutoff = periodValue === 'all'
    ? null
    : new Date(Date.now() - Number.parseInt(periodValue, 10) * 24 * 60 * 60 * 1000)

  return [...healthRecords.value]
    .filter(record => {
      if (recordType && record.record_type !== recordType) return false
      if (cutoff && new Date(record.record_date) < cutoff) return false

      if (!query) return true

      const cow = getCowById(record.cow_id)
      const searchable = [
        record.title,
        record.description,
        record.notes,
        record.vet_name,
        record.vaccine_name,
        record.medication_name,
        record.disease_name,
        record.treatment_plan,
        record.record_type,
        cow?.name,
        cow?.tag_id,
        cow?.breed
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
    .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / itemsPerPage.value)))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedRecords = computed(() => filteredRecords.value.slice(startIndex.value, endIndex.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
})

watch([searchQuery, filterStatus, filterPeriod, itemsPerPage], () => {
  currentPage.value = 1
})

const openAddModal = (cowId: string | null = null) => {
  preselectedCowId.value = cowId
  selectedRecord.value = null
  showAddModal.value = true
}

const editRecord = (record: HealthRecord) => {
  selectedRecord.value = { ...record }
  preselectedCowId.value = record.cow_id
  showAddModal.value = true
}

const promptDelete = (record: HealthRecord) => {
  deleteTarget.value = record
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  deleting.value = true
  try {
    await deleteHealthRecord(deleteTarget.value.id)
    await fetchHealthRecords()
  } finally {
    deleting.value = false
    deleteTarget.value = null
    showDeleteModal.value = false
  }
}

const handleSave = async () => {
  showAddModal.value = false
  selectedRecord.value = null
  preselectedCowId.value = null
  await fetchHealthRecords()
}

onMounted(async () => {
  await Promise.all([
    fetchCows(),
    fetchHealthRecords()
  ])

  overdueVaccinations.value = await getOverdueVaccinations()

  if (route.query.cowId) {
    preselectedCowId.value = String(route.query.cowId)
  }

  if (route.query.add || route.query.cowId) {
    showAddModal.value = true
    try {
      router.replace({ path: route.path, query: {} })
    } catch (error) {
      console.error('Failed to clear query params after opening health record modal:', error)
    }
  }
})
</script>
<style scoped>
/* Hide any horizontal separator in ConfirmModal */
.confirm-modal-content > .border-t,
.confirm-modal-content > .border-b {
  display: none !important;
}
</style>

