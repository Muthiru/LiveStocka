<template>
  <PageContainer size="wide">
    <LoadingState v-if="loading" text="Loading cow details..." />

    <div v-else-if="cow">
      <PageHeader :title="cow.name" :subtitle="`Tag ID: ${cow.tag_id || 'N/A'}`">
        <template #title>
          <div class="flex flex-wrap items-center gap-3">
            <span>{{ cow.name }}</span>
            <span
              v-if="cow.genetic_line === 'Pedigree'"
              class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900"
            >
              <Icon name="lucide:award" class="mr-1 h-3 w-3" />
              Pedigree
            </span>
          </div>
        </template>

        <template #actions>
          <div class="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3">
            <UButton :to="`/family-tree?root=${cow.id}`" variant="soft" color="primary" icon="i-lucide-git-branch">
              Lineage
            </UButton>
            <UButton variant="solid" color="primary" icon="i-lucide-download" @click="exportProfile">
              Export
            </UButton>
            <UButton variant="outline" color="neutral" icon="i-lucide-pencil" @click="handleEdit">
              Edit
            </UButton>
          </div>
        </template>
      </PageHeader>

        <!-- Tabs -->
      <div class="mb-6 border-b border-slate-200">
        <nav class="-mb-px flex gap-6 overflow-x-auto">
            <button
              :class="activeTab === 'overview' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
              class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
              @click="activeTab = 'overview'"
            >
              Overview
            </button>
            <button
              :class="activeTab === 'health' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
              class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
              @click="goToRecords('health')"
            >
              Health
            </button>
            <button
              :class="activeTab === 'reproduction' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
              class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
              @click="activeTab = 'reproduction'"
            >
                Breeding
            </button>
            <button
              :class="activeTab === 'milk' ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
              class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
              @click="activeTab = 'milk'"
            >
              Milk Production
            </button>
          </nav>
        </div>

        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-pencil"
              size="sm"
              @click="handleEdit"
            >
              Edit Cow
            </UButton>
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
                <dt class="text-sm font-medium text-gray-500">Genetic Line</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.genetic_line || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Color</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cow.color || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Age</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatAge(cow.birth_date) }}</dd>
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
            <div class="flex items-center gap-3">
              <NuxtLink
                :to="`/cow/${cow.id}/health`"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </NuxtLink>
              <button
                class="text-sm font-medium text-green-600 hover:text-green-800"
                @click="goToRecords('health')"
              >
                View All →
              </button>
            </div>
          </div>
          <div class="px-5 py-5">
            <div v-if="healthRecords.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No health records yet.</p>
              <NuxtLink
                :to="`/cow/${cow.id}/health`"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Add Health Record
              </NuxtLink>
            </div>
            <ul v-else class="divide-y divide-gray-200">
              <li v-for="record in healthRecords.slice(0, 5)" :key="record.id" class="py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span :class="getRecordTypeColor(record.record_type)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                        {{ record.record_type }}
                      </span>
                      <p class="text-sm font-medium text-gray-900">{{ record.title }}</p>
                    </div>
                    <p v-if="record.description" class="text-sm text-gray-500 mt-1">{{ record.description }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">{{ formatDate(record.record_date) }}</p>
                    <p v-if="record.next_checkup_date" class="text-xs text-blue-600 mt-1">
                      Next: {{ formatDate(record.next_checkup_date) }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Breeding Tab -->
        <div v-if="activeTab === 'reproduction'" class="space-y-6">
          <BreedingHistoryTable :cow-id="cow.id" />
          
          <!-- Optional: Add a quick record breeding button or form if needed, 
               but the history table is the priority here -->
          <div class="bg-white shadow rounded-lg p-5">
             <div class="flex items-center justify-between">
                <div>
                   <h4 class="text-sm font-medium text-gray-900">Record New Attempt</h4>
                   <p class="text-xs text-gray-500">Add a new breeding entry for this cow.</p>
                </div>
                <NuxtLink to="/breeding" class="text-indigo-600 text-sm font-medium hover:underline">Go to Breeding Page →</NuxtLink>
             </div>
          </div>
        </div>

        <!-- Milk Production Tab -->
        <div v-if="activeTab === 'milk'">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white shadow rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Last 7 Days</p>
                  <p class="text-2xl font-bold text-gray-900">{{ milkStats.last7Days }} L</p>
                </div>
                <Icon name="lucide:calendar-days" class="w-10 h-10 text-gray-600" />
              </div>
            </div>

            <div class="bg-white shadow rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Last 30 Days</p>
                  <p class="text-2xl font-bold text-gray-900">{{ milkStats.last30Days }} L</p>
                </div>
                <Icon name="lucide:calendar" class="w-10 h-10 text-gray-600" />
              </div>
            </div>

            <div class="bg-white shadow rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Daily Average</p>
                  <p class="text-2xl font-bold text-gray-900">{{ milkStats.average }} L</p>
                </div>
                <Icon name="lucide:trending-up" class="w-10 h-10 text-gray-600" />
              </div>
            </div>
          </div>

          <!-- Production History -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Production Records</h3>
              <NuxtLink
                to="/milk-production"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800"
              >
                Add Record
              </NuxtLink>
            </div>
            <div class="px-5 py-5">
              <div v-if="loadingMilk" class="text-center py-8">
                <p class="text-sm text-gray-500">Loading production records...</p>
              </div>
              <div v-else-if="milkRecords.length === 0" class="text-center py-8">
                <Icon name="lucide:milk-off" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-sm text-gray-500">No production records yet</p>
                <NuxtLink
                  to="/milk-production"
                  class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800"
                >
                  Add First Record
                </NuxtLink>
              </div>
              <div v-else>
                <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <div class="flex items-center gap-1">
                          <Icon name="lucide:sunrise" class="w-4 h-4" />
                          Morning
                        </div>
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <div class="flex items-center gap-1">
                          <Icon name="lucide:sun" class="w-4 h-4" />
                          Midday
                        </div>
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <div class="flex items-center gap-1">
                          <Icon name="lucide:sunset" class="w-4 h-4" />
                          Evening
                        </div>
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="record in milkRecords" :key="record.id" class="hover:bg-gray-50">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ formatDate(record.production_date) }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {{ record.morning_yield || 0 }} L
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {{ record.midday_yield || 0 }} L
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {{ record.evening_yield || 0 }} L
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        {{ record.total_yield }} L
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <EmptyState
      v-else
      icon="lucide:search-x"
      title="Cow not found"
      description="We couldn't find this cow. It may have been deleted or you may not have access."
    >
      <template #actions>
        <UButton to="/cows" variant="outline" color="neutral" icon="i-lucide-arrow-left">
          Back to cows
        </UButton>
      </template>
    </EmptyState>
  </PageContainer>
</template>

<script setup>
import { getHealthRecordTypeColor as getRecordTypeColor } from '~/utils/statusHelpers'
import { getAgeParts } from '~/utils/formatDate'

const { $supabase } = useNuxtApp()
const { getCowById, getStatusClass } = useCows()
const route = useRoute()
const cow = ref(null)

// Restore last active tab if user navigated back from reports page
const restoreTab = () => {
  try {
    const key = `cow:${route.params.id}:lastTab`
    const last = sessionStorage.getItem(key)
    if (last) {
      activeTab.value = last
      sessionStorage.removeItem(key)
    }
  } catch (e) {
    console.warn('restoreTab: sessionStorage access failed', e)
  }
}

// Age parts are computed by `getAgeParts` from utils/formatDate

// Format age as human-friendly string using computed parts
const formatAge = (birth) => {
  try {
    const p = getAgeParts(birth)
    if (!p) return 'N/A'

    if (p.years >= 1) {
      const remMonths = Math.floor((p.days % 365) / 30)
      return remMonths > 0 ? `${p.years}y ${remMonths}m` : `${p.years}y`
    }

    if (p.months >= 1) {
      const remDays = p.days % 30
      return remDays > 0 ? `${p.months}m ${remDays}d` : `${p.months}m`
    }

    if (p.days >= 1) {
      const remHours = p.hours % 24
      return remHours > 0 ? `${p.days}d ${remHours}h` : `${p.days}d`
    }

    if (p.hours >= 1) {
      const remMinutes = p.minutes % 60
      return remMinutes > 0 ? `${p.hours}h ${remMinutes}m` : `${p.hours}h`
    }

    if (p.minutes >= 1) return `${p.minutes}m`
    return `${p.seconds}s`
  } catch (e) {
    console.error('formatAge error', e)
    return 'N/A'
  }
}

const healthRecords = ref([])
const milkRecords = ref([])
const loading = ref(true)
const loadingMilk = ref(false)
const activeTab = ref('overview')

const milkStats = ref({
  last7Days: 0,
  last30Days: 0,
  average: 0
})

async function exportProfile() {
  if (!cow.value) return

  try {
    const { data: allHealth } = await $supabase
      .from('health_records')
      .select('*')
      .eq('cow_id', cow.value.id)
      .order('record_date', { ascending: false })

    const { data: allMilk } = await $supabase
      .from('milk_production')
      .select('*')
      .eq('cow_id', cow.value.id)
      .order('production_date', { ascending: false })

    let report = `COW PROFILE: ${cow.value.name.toUpperCase()}\n`
    report += `==========================================\n\n`

    report += `DETAILS\n`
    report += `-------\n`
    report += `Name: ${cow.value.name}\n`
    report += `Tag ID: ${cow.value.tag_id}\n`
    report += `Breed: ${cow.value.breed || 'N/A'}\n`
    report += `Status: ${cow.value.status}\n`
    report += `Birth Date: ${formatDate(cow.value.birth_date)}\n`
    report += `Age: ${formatAge(cow.value.birth_date)}\n\n`

    report += `HEALTH RECORDS (${allHealth?.length || 0})\n`
    report += `-----------------\n`
    if (allHealth?.length) {
      allHealth.forEach(r => {
        report += `[${formatDate(r.record_date)}] Type: ${r.record_type} | Title: ${r.title || 'N/A'} | Cost: $${r.cost || 0}\n`
        report += `  Description: ${r.description || 'None'}\n`
        if (r.treatment) report += `  Treatment: ${r.treatment}\n`
        if (r.next_checkup_date) report += `  Next Checkup: ${formatDate(r.next_checkup_date)}\n`
        report += `-----------------\n`
      })
    } else {
      report += `No health records found.\n`
    }
    report += `\n`

    report += `MILK PRODUCTION (${allMilk?.length || 0})\n`
    report += `-------------------\n`
    if (allMilk?.length) {
      allMilk.forEach(m => {
        const midday = m.midday_yield ? `, Mid: ${m.midday_yield}L` : ''
        report += `[${formatDate(m.production_date)}] Total: ${m.total_yield}L (M: ${m.morning_yield}L${midday}, E: ${m.evening_yield}L)\n`
      })
    } else {
      report += `No milk production records found.\n`
    }

    const blob = new Blob([report], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${cow.value.name}_profile.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error('Error exporting profile:', err)
    useAppToast().error('Failed to export profile')
  }
}

const handleEdit = () => {
  navigateTo(`/edit-cow/${route.params.id}`)
}


async function loadMilkProduction() {
  loadingMilk.value = true
  
  try {
    // Fetch milk production records
    const { data: records } = await $supabase
      .from('milk_production')
      .select('*')
      .eq('cow_id', route.params.id)
      .order('production_date', { ascending: false })
      .limit(30)

    milkRecords.value = records || []

    // Calculate stats
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const records7Days = records?.filter(r => new Date(r.production_date) >= last7Days) || []
    const records30Days = records?.filter(r => new Date(r.production_date) >= last30Days) || []

    milkStats.value.last7Days = records7Days
      .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      .toFixed(1)

    milkStats.value.last30Days = records30Days
      .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      .toFixed(1)

    milkStats.value.average = records30Days.length > 0
      ? (Number.parseFloat(milkStats.value.last30Days) / records30Days.length).toFixed(1)
      : 0
  } catch (err) {
    console.error('Error loading milk production:', err)
  } finally {
    loadingMilk.value = false
  }
}

onMounted(async () => {
  // Fetch cow details
  cow.value = await getCowById(route.params.id)
  // Try immediate restore on mount
  restoreTab()

  // Also restore when the user navigates back via browser (popstate/pageshow)
  if (typeof globalThis !== 'undefined' && globalThis.window) {
    globalThis.window.addEventListener('popstate', restoreTab)
    globalThis.window.addEventListener('pageshow', restoreTab)
  }

  // Fetch recent health records
  const { data: records } = await $supabase
    .from('health_records')
    .select('*')
    .eq('cow_id', route.params.id)
    .order('record_date', { ascending: false })
    .limit(5)

  healthRecords.value = records || []
  
  // Load milk production data
  await loadMilkProduction()
  
  loading.value = false
})

// Save current tab and navigate to records page
const goToRecords = (tab = 'health') => {
  try {
    const idKey = route.params.id || (cow?.value?.id)
    if (idKey) sessionStorage.setItem(`cow:${idKey}:lastTab`, tab)
  } catch (e) {
    console.warn('goToRecords: sessionStorage set failed', e)
  }
  return navigateTo(`/cow-records/${route.params.id}`)
}

onBeforeUnmount(() => {
  if (typeof globalThis !== 'undefined' && globalThis.window) {
    globalThis.window.removeEventListener('popstate', restoreTab)
    globalThis.window.removeEventListener('pageshow', restoreTab)
  }
})
</script>
