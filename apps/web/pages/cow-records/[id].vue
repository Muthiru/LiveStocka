<template>
  <div>
    <div class="min-h-screen bg-gray-50 p-6 root">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-start mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900">{{ cow?.name || 'Cow' }}</h1>
              <span 
                v-if="cow?.genetic_line === 'Pedigree'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"
              >
                <Icon name="lucide:award" class="w-3 h-3 mr-1" />
                Pedigree
              </span>
            </div>
            <p class="text-sm text-gray-600">Tag: {{ cow?.tag_id || 'N/A' }}</p>

            <!-- Tabs bar similar to cow page -->
            <nav class="mt-4 -mb-px flex space-x-8">
              <button
                :class="'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ' + (activeTab === 'overview' ? 'border-gray-700 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')"
                @click.prevent="goToCow('overview')"
              >
                Overview
              </button>
              <button
                :class="'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ' + (activeTab === 'health' ? 'border-gray-700 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')"
                @click.prevent="activeTab = 'health'"
              >
                Health
              </button>
              <button
                :class="'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ' + (activeTab === 'reproduction' ? 'border-gray-700 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')"
                @click.prevent="activeTab = 'reproduction'"
              >
                Breeding
              </button>
              <button
                :class="'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ' + (activeTab === 'milk' ? 'border-gray-700 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')"
                @click.prevent="goToCow('milk')"
              >
                Milk Production
              </button>
            </nav>

          
          </div>

          <div class="flex items-center gap-2 mt-3">
            <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700" @click="openAdd">
              <Icon name="lucide:plus" class="w-4 h-4" />
              Add Health Record
            </button>
            <button class="px-3 py-2 border rounded-md" @click="exportCSV">
              Export CSV
            </button>
            <NuxtLink 
              v-if="cow"
              :to="`/family-tree?root=${cow.id}`" 
              class="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Icon name="lucide:network" class="w-4 h-4" />
              Lineage
            </NuxtLink>
            <NuxtLink to="/health-records" class="px-3 py-2 border rounded-md">Back</NuxtLink>
          </div>
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

        <div v-if="activeTab === 'health'" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full table-auto divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                  <tr>
                    <th class="pl-0 pr-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date / Time</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Vet</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cost</th>
                      <th class="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                      <th class="px-2 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="rec in paginated" :key="rec.id">
                  <td class="pl-0 pr-3 py-2 align-top">
                    <div class="flex flex-col">
                      <div class="font-medium">{{ formatDateOnly(rec.record_date, rec.record_time) }}</div>
                      <div class="text-xs text-gray-600">{{ formatTimeOnly(rec.record_date, rec.record_time) }}</div>
                    </div>
                  </td>
                  <td class="px-2 py-2 whitespace-nowrap"><span :class="getTypeColor(rec.record_type)" class="px-2 py-1 rounded-full text-xs font-medium">{{ formatRecordType(rec.record_type) }}</span></td>
                  <td class="px-2 py-2 whitespace-nowrap">{{ rec.title }}</td>
                  <td class="px-2 py-2 whitespace-nowrap">
                    <div v-if="rec.vaccine_name">Vaccine: {{ rec.vaccine_name }}</div>
                    <div v-if="rec.medication_name">Medication: {{ rec.medication_name }}</div>
                    <div v-if="rec.disease_name">Disease: {{ rec.disease_name }}</div>
                    <div v-if="rec.treatment_plan">Treatment: {{ rec.treatment_plan }}</div>
                    <div v-if="rec.dosage">Dosage: {{ rec.dosage }}</div>
                    <div v-if="rec.administered_by">By: {{ rec.administered_by }}</div>
                  </td>
                  <td class="px-2 py-2 whitespace-nowrap">{{ rec.vet_name || '-' }}</td>
                  <td class="px-2 py-2 whitespace-nowrap">{{ formatCost(rec.cost) }}</td>
                  <td class="px-2 py-2 whitespace-nowrap">{{ rec.notes || '-' }}</td>
                  <td class="px-2 py-2 whitespace-nowrap text-right">
                    <button class="p-2 text-gray-500 hover:text-indigo-600" @click="onEdit(rec)"><Icon name="lucide:edit" class="w-4 h-4" /></button>
                    <button class="p-2 text-gray-500 hover:text-red-600" @click="onDelete(rec)"><Icon name="lucide:trash-2" class="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filtered.length">
                <tr class="bg-gray-50 font-semibold">
                  <td colspan="5" class="px-2 py-2 text-right">Total</td>
                  <td class="px-2 py-2">{{ totalCost }}</td>
                  <td class="px-2 py-2">{{ filtered.length }} records</td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
    </div>
    <HealthRecordModal v-model="showModal" :record="editing" :cows="cows" :preselected-cow-id="cow?.id" @save="refresh" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
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

const load = async () => {
  await Promise.all([fetchCows(), fetchHealthRecords()])
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

const totalCost = computed(() => filtered.value.reduce((sum, r) => sum + (Number(r.cost) || 0), 0))



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
  showModal.value = true
}

const onEdit = (rec) => {
  editing.value = { ...rec }
  showModal.value = true
}

const onDelete = async (rec) => {
  if (confirm('Delete this record?')) {
    await deleteHealthRecord(rec.id)
    await fetchHealthRecords()
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
