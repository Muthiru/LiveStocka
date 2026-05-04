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

    <div v-if="!props.cowId || heatsPending || bullsPending" class="space-y-2">
      <div class="h-8 bg-gray-100 rounded animate-pulse" />
      <div class="h-8 bg-gray-100 rounded animate-pulse" />
      <div class="h-16 bg-gray-100 rounded animate-pulse" />
      <div class="flex items-center">
        <div class="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="heat_event_id" class="block text-sm font-medium text-gray-700">Heat Event *</label>
          <select id="heat_event_id" v-model="heat_event_id" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
            <option value="" disabled>Select from recent heat events...</option>
            <option v-for="h in heats" :key="h.id" :value="h.id">{{ h.cow_name || h.cow_id }} — {{ new Date(h.event_time).toLocaleString() }}</option>
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
            <label for="sire_id" class="block text-sm font-medium text-gray-700">Sire / Bull *</label>
            <select id="sire_id" v-model="sire_id" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
              <option value="" disabled>Select sire...</option>
              <option v-for="c in bulls" :key="c.id" :value="c.id">{{ c.name || c.tag_id }}</option>
            </select>
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
const notes = ref('')
const method = ref('ai')
const semen_batch = ref('')
const technician = ref('')
const bcs = ref('')
const cost = ref<number | null>(null)

interface HeatOption { id: string; cow_id: string; cow_name?: string; event_time: string }
interface Bull { id: string; name?: string; tag_id?: string }


const { $supabase } = useNuxtApp()
const config = useRuntimeConfig()

  const heatsKey: string = 'heats-' + (props.cowId || 'none')
  const { data: heatsData, pending: heatsPending } = await useAsyncData<HeatOption[]>(heatsKey, async () => {
  if (!props.cowId) return [] as HeatOption[]
  const { data } = await $supabase.from('v_active_breeding_windows').select('heat_event_id:id, cow_id, event_time').eq('cow_id', props.cowId).limit(10)
  return (data || []) as HeatOption[]
})

const bullsKey: string = 'bulls'
const { data: bullsData, pending: bullsPending } = await useAsyncData<Bull[]>(bullsKey, async () => {
  const base = config.public.supabaseUrl
  const url = `${base}/functions/v1/readService/bulls`
  const res = await $fetch<{ bulls?: Bull[] }>(url)
  return (res?.bulls || []) as Bull[]
})

const op = useAsyncOperation(async () => {
  const session = await $supabase.auth.getSession()
  const token = session?.data?.session?.access_token
  const url = `${config.public.supabaseUrl}/functions/v1/breedingRecordService/record_breeding_attempt`
  const body = {
    cow_id: props.cowId,
    heat_event_id: heat_event_id.value,
    sire_id: sire_id.value,
    method: method.value,
    semen_batch: semen_batch.value || null,
    technician: technician.value || null,
    bcs: bcs.value ? Number.parseFloat(bcs.value) : null,
    cost: cost.value,
    notes: notes.value
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'record_breeding_attempt failed')
  return json
})

const heats = heatsData
const bulls = bullsData

const loading = op.loading
const error = op.error

const onSubmit = async () => {
  await op.execute()
}
</script>
