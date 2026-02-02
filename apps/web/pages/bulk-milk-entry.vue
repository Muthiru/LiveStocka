<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <NuxtLink to="/milk-production" class="text-gray-600 hover:text-gray-900 text-sm mb-3 inline-flex items-center">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        Back to Milk Production
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-900 mt-2">Bulk Milk Production Entry</h1>
      <p class="text-gray-600 mt-2">Record milk production for multiple cows at once</p>
    </div>

    <!-- Session Selection -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Session Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="morning">Morning Milking</option>
              <option value="evening">Evening Milking</option>
              <option value="both">Both Sessions</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              :disabled="loading"
              class="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              @click="loadCowsForEntry"
            >
              {{ loading ? 'Loading...' : 'Load Cows' }}
            </button>
          </div>
        </div>
      </div>
    

    <!-- Success/Error Messages -->
    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
      {{ success }}
    </div>
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
      {{ error }}
    </div>

    <!-- Bulk Entry Table -->
    <div v-if="entries.length > 0" class="bg-white rounded-lg shadow-md">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          Enter Production Data
          <span class="text-sm text-gray-500 font-normal ml-2">({{ entries.length }} cows)</span>
        </h3>
        <div class="space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            @click="clearAll"
          >
            Clear All
          </button>
          <button
            :disabled="loading"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            @click="saveAll"
          >
            {{ loading ? 'Saving...' : 'Save All' }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cow</th>
              <th v-if="sessionType !== 'evening'" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Morning Yield (L)
              </th>
              <th v-if="sessionType !== 'morning'" class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Evening Yield (L)
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total (L)</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="entry in entries" :key="entry.cow_id" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ entry.cow_name }}</div>
                <div class="text-xs text-gray-500">{{ entry.cow_tag_id }}</div>
              </td>
              <td v-if="sessionType !== 'evening'" class="px-4 py-3">
                  <input
                    v-model="entry.morning_yield"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                  >
                </td>
                <td v-if="sessionType !== 'morning'" class="px-4 py-3">
                  <input
                    v-model="entry.evening_yield"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
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
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                <td v-if="sessionType !== 'evening'" class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ totalMorning.toFixed(2) }} L
                </td>
                <td v-if="sessionType !== 'morning'" class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ totalEvening.toFixed(2) }} L
                </td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">
                  {{ grandTotal.toFixed(2) }} L
                </td>
                <td class="px-4 py-3"/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
      <Icon name="lucide:clipboard-list" class="w-16 h-16 text-gray-300 mx-auto mb-3" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Cows Loaded</h3>
      <p class="text-sm text-gray-600">Select a date and session type, then click "Load Cows" to begin bulk entry</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { $supabase } = useNuxtApp()
const toast = useToast()
const { fetchCows } = useCows()

// State
const entryDate = ref(new Date().toISOString().split('T')[0])
const sessionType = ref('morning')
const entries = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Computed
const todayDate = computed(() => new Date().toISOString().split('T')[0])

const totalMorning = computed(() => {
  return entries.value.reduce((sum, entry) => {
    const val = Number.parseFloat(entry.morning_yield) || 0
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
    const evening = Number.parseFloat(entry.evening_yield) || 0
    return sum + morning + evening
  }, 0)
})

// Methods
function calculateTotal(entry) {
  const morning = Number.parseFloat(entry.morning_yield) || 0
  const evening = Number.parseFloat(entry.evening_yield) || 0
  return (morning + evening).toFixed(2)
}

async function loadCowsForEntry() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) {
      error.value = 'User not authenticated'
      return
    }

    const cows = await fetchCows({ status: 'active', orderBy: 'name' })

    if (!cows || cows.length === 0) {
      error.value = 'No active cows found. Please add cows first.'
      toast.error('No active cows found')
      entries.value = []
      return
    }

    // Fetch existing records for this date
    const { data: existingRecords } = await $supabase
      .from('milk_production')
      .select('cow_id, morning_yield, evening_yield, notes')
      .eq('farm_id', user.user.id)
      .eq('production_date', entryDate.value)

    const recordMap = new Map((existingRecords || []).map(r => [r.cow_id, r]))

    // Initialize entries
    entries.value = cows.map(cow => {
      const existing = recordMap.get(cow.id)
      return {
        cow_id: cow.id,
        cow_name: cow.name,
        cow_tag_id: cow.tag_id,
        morning_yield: existing?.morning_yield ?? '',
        evening_yield: existing?.evening_yield ?? '',
        notes: existing?.notes ?? ''
      }
    })

    success.value = `Loaded ${cows.length} cows for bulk entry`
    toast.success(`Loaded ${cows.length} cows for bulk entry`)
    setTimeout(() => {
      success.value = ''
    }, 2000)
  } catch (err) {
    console.error('Error loading cows:', err)
    error.value = 'Failed to load cows. Please try again.'
    toast.error('Failed to load cows')
  } finally {
    loading.value = false
  }
}

function clearAll() {
  entries.value.forEach(entry => {
    entry.morning_yield = ''
    entry.evening_yield = ''
    entry.notes = ''
  })
}

async function saveAll() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) {
      error.value = 'User not authenticated'
      return
    }

    // Filter entries that have at least one yield value
    const validEntries = entries.value.filter(entry => {
      const morning = Number.parseFloat(entry.morning_yield) || 0
      const evening = Number.parseFloat(entry.evening_yield) || 0
      return morning > 0 || evening > 0
    })

    if (validEntries.length === 0) {
      error.value = 'Please enter at least one production value'
      return
    }

    // Prepare records for insertion
    const records = validEntries.map(entry => ({
      farm_id: user.user.id,
      cow_id: entry.cow_id,
      production_date: entryDate.value,
      morning_yield: Number.parseFloat(entry.morning_yield) || 0,
      evening_yield: Number.parseFloat(entry.evening_yield) || 0,
      notes: entry.notes || null
    }))

    const { error: insertError } = await $supabase
      .from('milk_production')
      .upsert(records, { onConflict: 'cow_id,production_date' })

    if (insertError) {
      throw insertError
    }

    success.value = `Successfully saved ${validEntries.length} production records!`
    toast.success(`Successfully saved ${validEntries.length} production records!`)
    
    // Clear entries after successful save
    setTimeout(() => {
      entries.value = []
      success.value = ''
    }, 2000)
  } catch (err) {
    console.error('Error saving bulk entries:', err)
    error.value = 'Failed to save production records. Please try again.'
    toast.error('Failed to save production records')
  } finally {
    loading.value = false
  }
}
</script>
