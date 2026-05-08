<template>
  <PageContainer size="wide">
    <HealthRecordModal v-model="showModal" :record="editing" :cows="cows" :preselected-cow-id="cow?.id" @save="refresh" />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete record?"
      :description="deleteTarget ? `This will permanently delete “${deleteTarget.title || 'this record'}”.` : 'This will permanently delete this record.'"
      confirm-text="Delete"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />

    <PageHeader :subtitle="`Tag: ${cow?.tag_id || 'N/A'}`">
      <template #title>
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ cow?.name || 'Cow' }}</span>
          <span
            v-if="cow?.genetic_line === 'Pedigree'"
            class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900"
          >
            <Icon name="lucide:award" class="mr-1 h-3 w-3" />
            Pedigree
          </span>
        </div>
      </template>
      <template #actions>
        <div class="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-4">
          <UButton color="primary" icon="i-lucide-plus" @click="openAdd">
            Add record
          </UButton>
          <UButton variant="outline" color="neutral" icon="i-lucide-download" @click="exportCSV">
            Export CSV
          </UButton>
          <UButton v-if="cow" :to="`/edit-cow/${cow.id}`" variant="outline" color="neutral" icon="i-lucide-pencil">
            Edit cow
          </UButton>
          <UButton v-if="cow" :to="`/family-tree?root=${cow.id}`" variant="soft" color="primary" icon="i-lucide-network">
            Lineage
          </UButton>
          <UButton to="/health-records" variant="ghost" color="neutral" icon="i-lucide-arrow-left">
            Back
          </UButton>
        </div>
      </template>
    </PageHeader>

    <!-- Tabs bar similar to cow page -->
    <div class="mb-6 border-b border-slate-200">
      <nav class="-mb-px flex gap-6 overflow-x-auto">
              <button
                :class="activeTab === 'overview' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                @click.prevent="goToCow('overview')"
              >
                Overview
              </button>
              <button
                :class="activeTab === 'health' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                @click.prevent="activeTab = 'health'"
              >
                Health
              </button>
              <button
                :class="activeTab === 'reproduction' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                @click.prevent="activeTab = 'reproduction'"
              >
                Breeding
              </button>
              <button
                :class="activeTab === 'milk' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                @click.prevent="goToCow('milk')"
              >
                Milk Production
              </button>
            </nav>
    </div>

        <div v-if="activeTab === 'health'" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input v-model="search" type="text" placeholder="Search title or description" class="form-input">
          <select v-model="typeFilter" class="form-select">
            <option value="">All types</option>
            <option value="vaccination">Vaccination</option>
            <option value="medication">Medication</option>
            <option value="disease">Disease</option>
            <option value="treatment">Treatment</option>
            <option value="checkup">Checkup</option>
            <option value="injury">Injury</option>
          </select>
          <input v-model="dateFrom" type="date" class="form-input">
          <input v-model="dateTo" type="date" class="form-input">
          <select v-model.number="perPage" class="form-select">
            <option :value="5">5 per page</option>
            <option :value="10">10 per page</option>
            <option :value="20">20 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>

        <div v-if="activeTab === 'health'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LoadingState v-if="loading" text="Loading records..." />
          <EmptyState
            v-else-if="filtered.length === 0"
            icon="lucide:heart-pulse"
            title="No health records"
            description="Add the first health record for this cow."
          >
            <template #actions>
              <UButton color="primary" icon="i-lucide-plus" @click="openAdd">
                Add record
              </UButton>
            </template>
          </EmptyState>
          <div v-else class="p-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div v-for="rec in paginated" :key="rec.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span :class="getTypeColor(rec.record_type)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ formatRecordType(rec.record_type) }}
                      </span>
                      <div class="text-xs text-slate-500">
                        {{ formatDateOnly(rec.record_date, rec.record_time) }} · {{ formatTimeOnly(rec.record_date, rec.record_time) }}
                      </div>
                    </div>
                    <div class="mt-2 truncate text-base font-semibold text-slate-900">{{ rec.title }}</div>
                    <div v-if="rec.description" class="mt-1 text-sm text-slate-600 line-clamp-2">{{ rec.description }}</div>
                  </div>

                  <div class="flex items-center gap-1">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-pencil"
                      title="Edit"
                      aria-label="Edit record"
                      @click="onEdit(rec)"
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      title="Delete"
                      aria-label="Delete record"
                      @click="onDelete(rec)"
                    />
                  </div>
                </div>

                <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div v-if="rec.vet_name" class="flex items-center gap-2">
                    <Icon name="lucide:stethoscope" class="h-4 w-4 text-slate-400" />
                    <span class="truncate">{{ rec.vet_name }}</span>
                  </div>
                  <div v-if="rec.cost !== null && rec.cost !== undefined && String(rec.cost).trim() !== ''" class="flex items-center gap-2">
                    <Icon name="lucide:coins" class="h-4 w-4 text-slate-400" />
                    <span>{{ formatCost(rec.cost) }}</span>
                  </div>
                  <div v-if="rec.vaccine_name" class="sm:col-span-2 text-slate-600">Vaccine: <span class="text-slate-800">{{ rec.vaccine_name }}</span></div>
                  <div v-if="rec.medication_name" class="sm:col-span-2 text-slate-600">Medication: <span class="text-slate-800">{{ rec.medication_name }}</span></div>
                  <div v-if="rec.disease_name" class="sm:col-span-2 text-slate-600">Disease: <span class="text-slate-800">{{ rec.disease_name }}</span></div>
                  <div v-if="rec.treatment_plan" class="sm:col-span-2 text-slate-600">Treatment: <span class="text-slate-800">{{ rec.treatment_plan }}</span></div>
                  <div v-if="rec.notes" class="sm:col-span-2 text-slate-600">Notes: <span class="text-slate-800">{{ rec.notes }}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!loading && filtered.length" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="text-sm text-gray-700">
              <template v-if="filtered.length === 0">Showing <span class="font-medium">0</span> records</template>
              <template v-else>Showing <span class="font-medium">{{ displayStart }}</span> to <span class="font-medium">{{ displayEnd }}</span> of <span class="font-medium">{{ filtered.length }}</span> records</template>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="totalPages > 1" class="flex items-center gap-2">
                <button :disabled="page === 1" class="px-3 py-1.5 border rounded-md disabled:opacity-50" @click="page--">Previous</button>
              </div>

              <div v-if="totalPages <= 7 && totalPages > 1" class="flex items-center gap-1">
                <button
                  v-for="n in totalPages"
                  :key="n"
                  :class="[
                    'px-3 py-1.5 border rounded-md',
                    n === page ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'
                  ]"
                  @click="page = n"
                >
                  {{ n }}
                </button>
              </div>

              <div v-if="totalPages > 1" class="flex items-center gap-2">
                <button :disabled="page === totalPages" class="px-3 py-1.5 border rounded-md disabled:opacity-50" @click="page++">Next</button>
              </div>

              <div v-if="totalPages > 1" class="ml-3 text-sm text-gray-600">Page <span class="font-medium">{{ page }}</span> of <span class="font-medium">{{ totalPages }}</span></div>
            </div>
          </div>
        </div>

        <!-- Reproduction Tab -->
        <div v-else-if="activeTab === 'reproduction'" class="space-y-6">
           <BreedingHistoryTable :cow-id="id" />
        </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import type { HealthRecord, Cow } from '~/types'
import { formatDateOnly, formatTimeOnly } from '~/utils/formatDate'
const route = useRoute()
const { healthRecords, fetchHealthRecords, deleteHealthRecord } = useHealthRecords()
const { cows, fetchCows } = useCows()

const id = String(route.params.id)
const cow = computed(() => cows.value.find(c => c.id === id) as Cow | undefined)

const search = ref('')
const typeFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const activeTab = ref('health')
const page = ref(1)
const perPage = ref(10)

const showModal = ref(false)
const editing = ref<HealthRecord | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)
const deleteTarget = ref<HealthRecord | null>(null)
const deleting = ref(false)

watch(showDeleteModal, (open) => {
  if (!open && !deleting.value) deleteTarget.value = null
})

const load = async () => {
  loading.value = true
  try {
    await Promise.all([fetchCows(), fetchHealthRecords()])
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  
  // Handle deep linking from alerts
  const query = route.query
  if (query.tab) {
    // Map query tab names to actual tab values
    const tabMap = {
      'health': 'health',
      'milk': 'milk',
      'breeding': 'reproduction',
      'reproduction': 'reproduction',
      'overview': 'overview'
    }
    const targetTab = tabMap[String(query.tab)] || 'health'
    
    // Redirect to main cow profile for overview and milk tabs
    if (targetTab === 'overview' || targetTab === 'milk') {
      return navigateTo(`/cow/${id}?tab=${targetTab}`)
    }
    
    activeTab.value = targetTab
  }
  
  // Auto-open add form if action=add
  if (query.action === 'add' && activeTab.value === 'health') {
    // Small delay to ensure the page is fully loaded
    setTimeout(() => {
      openAdd()
    }, 300)
  }
})

const filtered = computed(() => {
  let r = healthRecords.value.filter(h => h.cow_id === id)
  if (search.value) {
    const q = search.value.toLowerCase()
    r = r.filter(x => (x.title || '').toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q))
  }
  if (typeFilter.value) r = r.filter(x => x.record_type === typeFilter.value)
  if (dateFrom.value) r = r.filter(x => new Date(x.record_date) >= new Date(dateFrom.value))
  if (dateTo.value) r = r.filter(x => new Date(x.record_date) <= new Date(dateTo.value))
  return r.sort((a,b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const paginated = computed(() => filtered.value.slice(start.value, end.value))

const displayStart = computed(() => filtered.value.length === 0 ? 0 : start.value + 1)
const displayEnd = computed(() => filtered.value.length === 0 ? 0 : Math.min(end.value, filtered.value.length))

const goToCow = (tab = 'overview') => {
  try {
    const idKey = route.params.id
    if (idKey) sessionStorage.setItem(`cow:${idKey}:lastTab`, tab)
  } catch (e) {
    console.warn('goToCow: sessionStorage set failed', e)
  }
  return navigateTo(`/cow/${route.params.id}`)
}

const formatCost = (c) => {
  if (c === null || c === undefined || String(c).trim() === '') return '-'
  return String(c)
}

const exportCSV = () => {
  const rows = filtered.value.map(r => ({
    Type: formatRecordType(r.record_type),
    Title: r.title || '',
    DateTime: `${formatDateOnly(r.record_date, r.record_time)} ${formatTimeOnly(r.record_date, r.record_time)}`,
    Details: [r.vaccine_name, r.medication_name, r.disease_name, r.treatment_plan].filter(Boolean).join(' | '),
    Vet: r.vet_name || '',
    Cost: (r.cost !== undefined && r.cost !== null) ? String(r.cost) : '',
    Notes: r.notes || ''
  }))

  const csvEscape = (v) => '"' + String(v).replaceAll('"', '""') + '"'
  const headers = ['Type','Title','DateTime','Details','Vet','Cost','Notes']
  const csv = [headers.map(csvEscape).join(',')]
  rows.forEach(row => {
    csv.push(headers.map(h => csvEscape(row[h] ?? '')).join(','))
  })

  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = (cow?.value?.name || id).replaceAll(/[^a-z0-9-_]/gi, '_')
  a.href = url
  a.setAttribute('download', `cow-${safeName}-records.csv`)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const formatRecordType = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Unknown'
const getTypeColor = (type) => {
  if (type === 'vaccination') return 'text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium'
  if (type === 'medication') return 'text-purple-700 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium'
  if (type === 'disease') return 'text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium'
  return 'text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium'
}

const openAdd = () => {
  editing.value = null
  nextTick(() => {
    showModal.value = true
  })
}

const onEdit = async (rec) => {
  editing.value = { ...rec }
  await nextTick()
  showModal.value = true
}

const onDelete = async (rec) => {
  deleteTarget.value = rec
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value?.id || deleting.value) return
  deleting.value = true
  try {
    await deleteHealthRecord(deleteTarget.value.id)
    await fetchHealthRecords()
    showDeleteModal.value = false
    deleteTarget.value = null
  } catch (e) {
    console.error('Delete record error:', e)
  } finally {
    deleting.value = false
  }
}

const refresh = async () => {
  showModal.value = false
  editing.value = null
  await fetchHealthRecords()
}
</script>

<style scoped>
.root,
.root > *:not(span[class*="rounded-full"]) {
  color: #111827 !important;
}

.root th {
  text-transform: uppercase !important;
  font-weight: 700 !important;
}
</style>
