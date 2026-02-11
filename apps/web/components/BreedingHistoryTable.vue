<template>
  <div class="repro-log-standard">
    <!-- Header matching table patterns -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">
        Reproduction History
      </h3>
      <div v-if="rows.length > 0" class="text-sm text-gray-500">
        {{ totalCount }} records
      </div>
    </div>

    <div v-if="loading" class="py-12 flex justify-center items-center gap-3">
      <div class="w-5 h-5 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"/>
      <span class="text-sm text-gray-500">Loading records...</span>
    </div>

    <div v-else-if="errorMessage" class="p-4 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-else-if="rows.length === 0" class="py-12 text-center bg-white border border-gray-200 rounded-lg">
      <p class="text-sm text-gray-500">No reproduction records found.</p>
    </div>

    <!-- Table-like List -->
    <div v-else class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-auto divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Date / Time</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cow</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-24">Type</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
              <th class="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-16"/>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="r in paginatedRows" :key="r.id">
              <tr 
                class="hover:bg-gray-50 transition-colors cursor-pointer group"
                @click="toggleExpand(r.id)"
              >
                <!-- Date -->
                <td class="px-4 py-3 align-top whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ formatDate(r.timestamp) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(r.timestamp) }}</div>
                </td>

                <!-- Cow Name -->
                <td class="px-4 py-3 align-top whitespace-nowrap">
                   <div class="font-medium text-indigo-700">{{ r.cow_name || '-' }}</div>
                </td>

                <!-- Type -->
                <td class="px-4 py-3 align-top whitespace-nowrap">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-medium border"
                    :class="r.type === 'breeding' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'"
                  >
                    {{ r.type.charAt(0).toUpperCase() + r.type.slice(1) }}
                  </span>
                </td>

                <!-- Key Insight -->
                <td class="px-4 py-3 align-top">
                  <div v-if="r.type === 'breeding'" class="space-y-0.5">
                    <div class="text-gray-900 font-medium">Method: {{ r.method }}</div>
                    <div v-if="r.sire_name" class="text-xs text-gray-600">Sire: {{ r.sire_name }}</div>
                  </div>
                  <div v-else class="space-y-0.5">
                    <div class="text-gray-900 font-medium">Intensity: {{ r.intensity || '-' }}</div>
                    <div v-if="r.signs && r.signs.length" class="text-xs text-gray-600 truncate max-w-xs">
                      {{ r.signs.join(', ') }}
                    </div>
                  </div>
                </td>

                <!-- Notes Abstract -->
                <td class="px-4 py-3 align-top">
                  <p class="text-gray-600 line-clamp-1 max-w-xs" :title="r.notes">
                    {{ r.notes || '-' }}
                  </p>
                </td>

                <!-- Expand Arrow -->
                <td class="px-4 py-3 align-top text-right">
                   <div
class="text-gray-400 group-hover:text-gray-600 transition-transform duration-200" 
                     :class="expandedId === r.id ? 'rotate-180' : ''">
                     <Icon name="lucide:chevron-down" class="w-4 h-4" />
                   </div>
                </td>
              </tr>

              <!-- Expanded Details -->
              <tr v-if="expandedId === r.id" class="bg-gray-50/50">
                <td colspan="6" class="px-8 py-4 border-t border-gray-100">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <template v-if="r.type === 'breeding'">
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Technician</span>
                        <span class="text-sm text-gray-900 font-medium">{{ r.technician || '-' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semen Batch</span>
                        <span class="text-sm font-mono text-gray-700">{{ r.semen_batch || '-' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cost Incurred</span>
                        <span class="text-sm text-gray-900">{{ r.cost ? r.cost + ' KES' : '-' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">BCS Rating</span>
                        <span class="text-sm text-gray-900">{{ r.bcs || '-' }} / 5.0</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex flex-col col-span-2">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Observations</span>
                        <div class="flex flex-wrap gap-2 mt-1">
                          <span v-for="sign in r.signs" :key="sign" class="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                            {{ sign }}
                          </span>
                        </div>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Intensity</span>
                        <span class="text-sm font-medium text-gray-900 uppercase">{{ r.intensity || '-' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Record ID</span>
                        <span class="text-xs font-mono text-gray-400">#{{ r.id.slice(0, 8) }}</span>
                      </div>
                    </template>

                    <div class="col-span-full border-t border-gray-200 pt-4 mt-2">
                      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Notes</span>
                      <p class="text-sm text-gray-600 leading-relaxed italic">
                        {{ r.notes || 'No comments recorded.' }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Showing page <span class="font-medium">{{ currentPage }}</span> of <span class="font-medium">{{ totalPages }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            :disabled="currentPage === 1" class="px-3 py-1.5 border rounded-md bg-white text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            @click="prevPage">
            Previous
          </button>
          <button 
            :disabled="currentPage === totalPages" class="px-3 py-1.5 border rounded-md bg-white text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            @click="nextPage">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{ cowId?: string | null }>()
const { $supabase } = useNuxtApp()

interface ReproductionRow {
  id: string
  type: 'heat' | 'breeding'
  timestamp: string
  cow_name?: string
  notes?: string
  method?: string
  sire_name?: string
  intensity?: string
  signs?: string[]
  technician?: string
  semen_batch?: string
  cost?: string | number
  bcs?: string | number
}

const rows = ref<ReproductionRow[]>([])
const loading = ref(false)
const error = ref<unknown | null>(null)
const expandedId = ref<string | null>(null)

// Pagination
const currentPage = ref(1)
const perPage = 10

const totalCount = computed(() => rows.value.length)
const totalPages = computed(() => Math.ceil(rows.value.length / perPage))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return rows.value.slice(start, end)
})

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

const formatDate = (ts: string) => {
  return new Date(ts).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatTime = (ts: string) => {
  return new Date(ts).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

interface ErrorObject {
  message?: string
  error?: { message?: string }
  error_description?: string
  statusText?: string
}

const errorMessage = computed(() => {
  const val = error.value
  if (val == null) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const errorObj = val as ErrorObject
    const msg = errorObj.message || errorObj.error?.message || errorObj.error_description || errorObj.statusText
    if (msg && typeof msg === 'string') return msg
  }
  return 'Unable to load history'
})

const fetchHistory = async () => {
  loading.value = true
  error.value = null
  currentPage.value = 1
  expandedId.value = null
  
  try {
    const url = props.cowId 
      ? `readService/reproduction_history?cow_id=${props.cowId}` 
      : `readService/reproduction_history`;

    const { data: res, error: invokeError } = await $supabase.functions.invoke(url, {
      method: 'GET'
    })
    
    if (invokeError) throw invokeError
    rows.value = (res?.history || []) as ReproductionRow[]
    
  } catch (e: unknown) {
    console.error('Error calling reproduction_history edge function:', e)
    const errorObj = e as ErrorObject
    error.value = errorObj?.message || 'Failed to fetch reproduction history'
    
    // Fallback: Just fetch breeding (optional handling for global fallback if needed)
    if (props.cowId) {
      try {
        const { data, error: qErr } = await $supabase
          .from('breeding_attempts')
          .select('id,attempt_time,notes,method,sire_id,cow_id, cows!fk_breeding_attempts_cow(name, tag_id)')
          .eq('cow_id', props.cowId)
          .order('attempt_time', { ascending: false })

        if (qErr) throw qErr
        
        interface BreedingAttempt {
          id: string
          attempt_time: string
          notes?: string
          method?: string
          sire_id?: string
          cow_id: string
          cows?: { name?: string; tag_id?: string }
        }

        rows.value = (data || []).map((r: BreedingAttempt) => ({
          id: r.id,
          type: 'breeding' as const,
          timestamp: r.attempt_time,
          cow_name: r.cows?.name || r.cows?.tag_id || undefined,
          method: r.method || 'ai',
          notes: r.notes || undefined,
          sire_name: undefined
        }))
        error.value = null
      } catch (error_: unknown) {
        console.error('Reproduction History Fallback failed:', error_)
        error.value = 'Complete data fetch failed'
        rows.value = []
      }
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.cowId, () => {
  fetchHistory()
}, { immediate: true })
</script>

<style scoped>
.repro-log-standard {
  font-family: inherit;
}
</style>
