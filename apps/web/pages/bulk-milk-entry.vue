<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <NuxtLink to="/milk-production" class="text-gray-600 hover:text-gray-900 text-sm mb-3 inline-flex items-center">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Back to Milk Production
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-900 mt-2">Bulk Milk Production Entry</h1>
      <p class="text-gray-600 mt-2">Select and record milk production for milking cows</p>
    </div>

    <!-- Session Selection -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Session Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="entry_date" class="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="entry_date"
              v-model="entryDate"
              type="date"
              :max="todayDate"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
          </div>

          <div>
            <label for="session_type" class="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              id="session_type"
              v-model="sessionType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="morning">Morning Only</option>
              <option value="midday">Midday Only</option>
              <option value="evening">Evening Only</option>
              <option value="morning_evening">Morning + Evening</option>
              <option value="all">All Sessions (3x Daily)</option>
            </select>
          </div>
        </div>

        <!-- Time Settings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div v-if="showMorning">
            <label for="morning_time" class="block text-sm font-medium text-gray-700 mb-2">
              Morning Time
            </label>
            <input
              id="morning_time"
              v-model="morningTime"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
          </div>
          <div v-if="showMidday">
            <label for="midday_time" class="block text-sm font-medium text-gray-700 mb-2">
              Midday Time
            </label>
            <input
              id="midday_time"
              v-model="middayTime"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
          </div>
          <div v-if="showEvening">
            <label for="evening_time" class="block text-sm font-medium text-gray-700 mb-2">
              Evening Time
            </label>
            <input
              id="evening_time"
              v-model="eveningTime"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
          </div>
        </div>
      
      <!-- Cow Selection -->
      <div>
        <label for="cow_select" class="block text-sm font-medium text-gray-700 mb-2">
          Select Cows to Add
        </label>
        <div class="flex gap-2">
          <select
            id="cow_select"
            v-model="selectedCowId"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            :disabled="loadingCows"
          >
            <option value="">{{ loadingCows ? 'Loading cows...' : 'Choose a cow to add' }}</option>
            <option 
              v-for="cow in availableCows" 
              :key="cow.id" 
              :value="cow.id"
            >
              {{ cow.name }} ({{ cow.tag_id }})
            </option>
          </select>
          <button
            :disabled="!selectedCowId || loading"
            class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            @click="addCowToEntry"
          >
            Add Cow
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Only milking cows are shown (excludes bulls, calves, and dry cows)
        </p>
      </div>
    </div>
    <!-- Entry Table -->
    <div v-if="entries.length > 0" class="bg-white rounded-lg shadow-md">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          Production Entries
          <span class="text-sm text-gray-500 font-normal ml-2">({{ entries.length }} cows)</span>
        </h3>
        <button
          :disabled="isSavingAll || entries.length === 0"
          class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          @click="saveAllEntries"
        >
          <Icon name="lucide:save" class="w-4 h-4 mr-2" />
          {{ isSavingAll ? 'Saving...' : 'Save All Entries' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cow</th>
              <th v-if="showMorning" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Morning (L)
              </th>
              <th v-if="showMidday" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Midday (L)
              </th>
              <th v-if="showEvening" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Evening (L)
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total (L)</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="entry in entries" :key="entry.cow_id" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ entry.cow_name }}</div>
                <div class="text-xs text-gray-500">{{ entry.cow_tag_id }}</div>
              </td>
              <td v-if="showMorning" class="px-4 py-3">
                <input
                  v-model="entry.morning_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                >
              </td>
              <td v-if="showMidday" class="px-4 py-3">
                <input
                  v-model="entry.midday_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                >
              </td>
              <td v-if="showEvening" class="px-4 py-3">
                <input
                  v-model="entry.evening_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                >
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ calculateTotal(entry) }}
              </td>
                <td class="px-4 py-3">
                  <input
                    v-model="entry.notes"
                    type="text"
                    placeholder="Optional notes"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                  >
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      :disabled="savingCowIds.includes(entry.cow_id)"
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      @click="saveSingleEntry(entry)"
                    >
                      {{ savingCowIds.includes(entry.cow_id) ? 'Saving...' : 'Save' }}
                    </button>
                    <button
                      :disabled="savingCowIds.includes(entry.cow_id)"
                      class="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      @click="removeEntry(entry.cow_id)"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                <td v-if="showMorning" class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ totalMorning.toFixed(2) }} L
                </td>
                <td v-if="showMidday" class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ totalMidday.toFixed(2) }} L
                </td>
                <td v-if="showEvening" class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ totalEvening.toFixed(2) }} L
                </td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ grandTotal.toFixed(2) }} L
                </td>
                <td class="px-4 py-3" colspan="2"/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
      <Icon name="lucide:clipboard-list" class="w-16 h-16 text-gray-300 mx-auto mb-3" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Cows Added</h3>
      <p class="text-sm text-gray-600">Use the dropdown above to select and add milking cows for production entry</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})


const toast = useAppToast()
const { fetchCows, isMilkable } = useCows()
const { fetchProduction, bulkAddProduction } = useMilkProduction()

// State
const entryDate = ref(new Date().toISOString().split('T')[0])
const sessionType = ref('morning')
const morningTime = ref('06:00')
const middayTime = ref('12:00')
const eveningTime = ref('18:00')
const entries = ref([])
const allCows = ref([])
const dateRecords = ref([])
const selectedCowId = ref('')
const loading = ref(false)
const loadingCows = ref(false)
const savingCowIds = ref([])
const isSavingAll = ref(false)

// Session visibility computed properties
const showMorning = computed(() => ['morning', 'morning_evening', 'all'].includes(sessionType.value))
const showMidday = computed(() => ['midday', 'all'].includes(sessionType.value))
const showEvening = computed(() => ['evening', 'morning_evening', 'all'].includes(sessionType.value))

// Computed
const todayDate = computed(() => new Date().toISOString().split('T')[0])

// Filter cows that can produce milk (exclude bulls, calves, dry cows)
const availableCows = computed(() => {
  const addedCowIds = new Set(entries.value.map(e => e.cow_id))
  return allCows.value.filter(cow => 
    isMilkable(cow.status) && !addedCowIds.has(cow.id)
  )
})

const totalMorning = computed(() => {
  return entries.value.reduce((sum, entry) => {
    const val = Number.parseFloat(entry.morning_yield) || 0
    return sum + val
  }, 0)
})

const totalMidday = computed(() => {
  return entries.value.reduce((sum, entry) => {
    const val = Number.parseFloat(entry.midday_yield) || 0
    return sum + val
  }, 0)
})

const totalEvening = computed(() => {
  return entries.value.reduce((sum, entry) => {
    const val = Number.parseFloat(entry.evening_yield) || 0
    return sum + val
  }, 0)
})

const grandTotal = computed(() => {
  return entries.value.reduce((sum, entry) => {
    const morning = Number.parseFloat(entry.morning_yield) || 0
    const midday = Number.parseFloat(entry.midday_yield) || 0
    const evening = Number.parseFloat(entry.evening_yield) || 0
    return sum + morning + midday + evening
  }, 0)
})

// Methods
function calculateTotal(entry) {
  const morning = Number.parseFloat(entry.morning_yield) || 0
  const midday = Number.parseFloat(entry.midday_yield) || 0
  const evening = Number.parseFloat(entry.evening_yield) || 0
  return (morning + midday + evening).toFixed(2)
}

async function loadAllCows() {
  try {
    loadingCows.value = true
    const cows = await fetchCows()
    allCows.value = cows || []
  } catch (err) {
    console.error('Error loading cows:', err)
    toast.error('Failed to load cows')
  } finally {
    loadingCows.value = false
  }
}

async function loadDateRecords() {
  try {
    // console.log('Loading records for date:', entryDate.value)
    const records = await fetchProduction(entryDate.value)
    dateRecords.value = records || []
  } catch (err) {
    console.error('Error loading date records:', err)
  }
}

async function addCowToEntry() {
  if (!selectedCowId.value) return

  const cow = allCows.value.find(c => c.id === selectedCowId.value)
  if (!cow) return

  // Check if entry already exists
  if (entries.value.some(e => e.cow_id === cow.id)) {
    toast.warning(`${cow.name} is already in the list`)
    return
  }

  // Check existing record from pre-fetched data
  const existingRecord = dateRecords.value.find(r => r.cow_id === cow.id)

  entries.value.push({
    cow_id: cow.id,
    cow_name: cow.name,
    cow_tag_id: cow.tag_id,
    morning_yield: existingRecord?.morning_yield ?? '',
    midday_yield: existingRecord?.midday_yield ?? '',
    evening_yield: existingRecord?.evening_yield ?? '',
    notes: existingRecord?.notes ?? ''
  })

  // toast.success(`${cow.name} added to list`)
  selectedCowId.value = '' // Reset selection
}

function removeEntry(cowId) {
  const entry = entries.value.find(e => e.cow_id === cowId)
  entries.value = entries.value.filter(e => e.cow_id !== cowId)
  if (entry) {
    // toast.info(`${entry.cow_name} removed`)
  }
}

function prepareRecord(entry) {
  const morning = Number.parseFloat(entry.morning_yield) || 0
  const midday = Number.parseFloat(entry.midday_yield) || 0
  const evening = Number.parseFloat(entry.evening_yield) || 0

  return {
    cow_id: entry.cow_id,
    production_date: entryDate.value,
    morning_yield: morning,
    morning_time: showMorning.value && morning > 0 ? morningTime.value : null,
    midday_yield: midday,
    midday_time: showMidday.value && midday > 0 ? middayTime.value : null,
    evening_yield: evening,
    evening_time: showEvening.value && evening > 0 ? eveningTime.value : null,
    notes: entry.notes || null
  }
}

async function saveSingleEntry(entry) {
  try {
    savingCowIds.value.push(entry.cow_id)

    const morning = Number.parseFloat(entry.morning_yield) || 0
    const midday = Number.parseFloat(entry.midday_yield) || 0
    const evening = Number.parseFloat(entry.evening_yield) || 0

    if (morning === 0 && midday === 0 && evening === 0) {
      toast.warning(`Please enter at least one yield value for ${entry.cow_name}`)
      return
    }

    const record = prepareRecord(entry)
    const result = await bulkAddProduction([record])

    if (result && result.failed > 0) {
       throw new Error(result.errors[0]?.error || 'Failed to save')
    }

    toast.success(`✓ ${entry.cow_name}: ${calculateTotal(entry)}L saved`)
    
    // Remove the entry from the list after successful save (and refresh buffer)
    entries.value = entries.value.filter(e => e.cow_id !== entry.cow_id)
    await loadDateRecords() // Refresh background data
    
  } catch (err) {
    console.error('Error saving entry:', err)
    toast.error(`Failed to save ${entry.cow_name}: ${err.message}`)
  } finally {
    savingCowIds.value = savingCowIds.value.filter(id => id !== entry.cow_id)
  }
}

async function saveAllEntries() {
  if (entries.value.length === 0) return
  
  isSavingAll.value = true
  try {
    const validRecords = []
    
    // Validate all first
    for (const entry of entries.value) {
        const morning = Number.parseFloat(entry.morning_yield) || 0
        const midday = Number.parseFloat(entry.midday_yield) || 0
        const evening = Number.parseFloat(entry.evening_yield) || 0
        
        if (morning > 0 || midday > 0 || evening > 0) {
            validRecords.push(prepareRecord(entry))
        }
    }
    
    if (validRecords.length === 0) {
        toast.warning('No valid entries with data to save')
        return
    }
    
    const result = await bulkAddProduction(validRecords)
    
    if (result) {
        const successCount = result.success || 0
        const failedCount = result.failed || 0
        
        if (successCount > 0) {
            toast.success(`Successfully saved ${successCount} records`)
            
             // Construct set of successful IDs to remove
            const successfulCowIds = new Set(result.results.map(r => r.cow_id))
            entries.value = entries.value.filter(e => !successfulCowIds.has(e.cow_id))
            
            await loadDateRecords()
        }
        
        if (failedCount > 0) {
             toast.error(`Failed to save ${failedCount} records. Check errors.`)
             console.error('Bulk save errors:', result.errors)
        }
    }
    
  } catch (err) {
    console.error('Error in bulk save:', err)
    toast.error('Failed to save entries')
  } finally {
    isSavingAll.value = false
  }
}

// Watch date to refresh records
watch(entryDate, () => {
    loadDateRecords()
    // Optional: clear entries if date changes? Or keep them?
    // User might want to carry over list to another date? 
    // Usually bulk entry is for TODAY. Let's keep them but warn if data exists?
    // For now, let's reload date records so new additions get correct pre-fill
}, { immediate: true })

// Load cows on mount
onMounted(() => {
  loadAllCows()
})
</script>
