<template>
  <form class="space-y-4 p-4 bg-white rounded shadow" @submit.prevent="onSubmit">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <h4 class="text-sm font-semibold">Record Breeding</h4>
      </div>
      <div v-if="!props.cowId" class="text-sm text-gray-500">Select a cow to enable breeding</div>
    </div>

    <div v-if="!props.cowId || heatsPending || bullsPending" class="py-8 text-center bg-gray-50 rounded border border-dashed border-gray-300">
      <div v-if="!props.cowId" class="text-gray-500">Select a cow to view heat events</div>
      <div v-else class="text-indigo-600 flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span>Loading breeding data...</span>
      </div>
    </div>
    <div v-if="heatsError || bullsError" class="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
      Failed to load breeding data: {{ (heatsError || bullsError)?.message || 'Unknown error' }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="heat_event_id" class="block text-sm font-medium text-gray-700">Heat Event *</label>
          <select id="heat_event_id" v-model="heat_event_id" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
            <option value="" disabled>Select from recent heat events...</option>
            <option v-for="h in heats" :key="h.id" :value="h.id">{{ h.cow_name || h.cow_tag_id || h.cow_id }} — {{ new Date(h.event_time).toLocaleString() }}</option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="method" class="block text-sm font-medium text-gray-700">Breeding Method *</label>
            <select id="method" v-model="method" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
              <option value="ai">Artificial Insemination</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="sire_id" class="block text-sm font-medium text-gray-700">Sire / Bull *</label>
              <button type="button" class="text-xs text-indigo-600 hover:text-indigo-500" @click="manualSire = !manualSire">
                {{ manualSire ? 'Select from herd' : 'Enter manually' }}
              </button>
            </div>
            <div v-if="!manualSire" class="mt-1">
              <select id="sire_id" v-model="sire_id" class="block w-full rounded border-gray-300 shadow-sm" :disabled="bulls.length === 0">
                <option value="" disabled>{{ bulls.length > 0 ? 'Select sire...' : 'No bulls found — please add a bull first' }}</option>
                <option v-for="c in bulls" :key="c.id" :value="c.id">{{ c.name || c.tag_id }}</option>
              </select>
            </div>
            <div v-else class="mt-1">
              <input id="sire_name" v-model="sire_name" type="text" placeholder="e.g., Bull Name or Semen Brand" class="block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="semen_batch" class="block text-sm font-medium text-gray-700">Semen Batch Number</label>
            <input id="semen_batch" v-model="semen_batch" placeholder="e.g., SEM-2024-001" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
          </div>
          <div>
            <label for="technician" class="block text-sm font-medium text-gray-700">Technician Name</label>
            <input id="technician" v-model="technician" placeholder="Name of person performing AI" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="bcs" class="block text-sm font-medium text-gray-700">Body Condition Score (1-5)</label>
            <input id="bcs" v-model="bcs" placeholder="e.g., 3.5" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
          </div>
          <div>
            <label for="cost" class="block text-sm font-medium text-gray-700">Cost</label>
            <input id="cost" v-model.number="cost" type="number" step="0.01" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
          </div>
          <div />
        </div>

        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea id="notes" v-model="notes" rows="3" class="mt-1 block w-full rounded border-gray-300 shadow-sm" />
        </div>

        <div class="flex items-center justify-between">
          <button :disabled="loading" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span v-if="!loading">Record Breeding</span>
            <span v-else>Saving...</span>
          </button>
          <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncOperation } from '~/composables/useAsyncOperation'

const props = defineProps<{ cowId?: string | null }>()

const heat_event_id = ref<string | null>(null)
const sire_id = ref<string | null>(null)
const sire_name = ref('')
const manualSire = ref(false)
const notes = ref('')
const method = ref('ai')
const semen_batch = ref('')
const technician = ref('')
const bcs = ref('')
const cost = ref<number | null>(null)

interface HeatOption { id: string; cow_id: string; cow_name?: string; cow_tag_id?: string; event_time: string }
interface Bull { id: string; name?: string; tag_id?: string }

const { $supabase } = useNuxtApp()
const config = useRuntimeConfig()

// Use reactive keys so useAsyncData knows when to re-fetch
const heatsKey = computed(() => `heats-${props.cowId || 'none'}`)
const bullsKey = 'bulls-shared' // Shared across instances

const { data: heatsData, pending: heatsPending, error: heatsError } = useAsyncData<HeatOption[]>(
  heatsKey.value, 
  async () => {
    if (!props.cowId) return []
    const { data } = await $supabase
      .from('v_active_breeding_windows')
      .select('id, cow_id, cow_name, cow_tag_id, event_time')
      .eq('cow_id', props.cowId)
      .limit(10)
    return (data || []) as HeatOption[]
  },
  { watch: [heatsKey] }
)

const { data: bullsData, pending: bullsPending, error: bullsError } = useAsyncData<Bull[]>(
  bullsKey, 
  async () => {
    const base = config.public.supabaseUrl
    const url = `${base}/functions/v1/readService/bulls`
    const res = await $fetch<{ bulls?: Bull[] }>(url)
    return (res?.bulls || []) as Bull[]
  }
)

const heats = computed(() => heatsData.value || [])
const bulls = computed(() => bullsData.value || [])

const op = useAsyncOperation(async () => {
  const currentTimestamp = new Date().toISOString()
  const { data, error: invokeError } = await $supabase.functions.invoke('breedingRecordService/record_breeding_attempt', {
    method: 'POST',
    body: {
      cow_id: props.cowId,
      heat_event_id: heat_event_id.value,
      sire_id: manualSire.value ? null : sire_id.value,
      sire_name: manualSire.value ? sire_name.value : null,
      attempt_time: currentTimestamp,
      breeding_timestamp: currentTimestamp,
      method: method.value,
      breeding_method: method.value, // Backup for DB constraint
      semen_batch: semen_batch.value || null,
      technician: technician.value || null,
      bcs: bcs.value ? Number.parseFloat(bcs.value) : null,
      cost: cost.value,
      notes: notes.value || null
    }
  })
  
  if (invokeError) {
    console.error('record_breeding_attempt edge function error:', invokeError)
    throw new Error(invokeError.message || 'record_breeding_attempt failed')
  }
  
  // Reset form on success
  heat_event_id.value = null
  sire_id.value = null
  sire_name.value = ''
  manualSire.value = false
  method.value = 'ai'
  semen_batch.value = ''
  technician.value = ''
  bcs.value = ''
  cost.value = null
  notes.value = ''
  
  return data
})

const loading = op.loading
const error = op.error

const onSubmit = async () => {
  const data = await op.execute()
  if (data) {
    useToast().success('Breeding attempt recorded successfully')
    // Trigger refresh of breeding windows and heat dropdowns
    refreshNuxtData('active-windows')
    if (props.cowId) {
      refreshNuxtData(`heats-${props.cowId}`)
    }
  }
}
</script>
