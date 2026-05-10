<template>
  <form class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" @submit.prevent="onSubmit">
    <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 class="text-sm font-semibold text-slate-900">Record Breeding</h4>
      </div>
      <div v-if="!props.cowId" class="text-sm text-slate-500">Select a cow to enable breeding</div>
    </div>

    <div v-if="!props.cowId || heatsPending || bullsPending" class="space-y-2">
      <div class="h-10 rounded-lg bg-slate-100 animate-pulse" />
      <div class="h-10 rounded-lg bg-slate-100 animate-pulse" />
      <div class="h-16 rounded-lg bg-slate-100 animate-pulse" />
      <div class="flex items-center">
        <div class="h-10 w-32 rounded-lg bg-slate-200 animate-pulse" />
      </div>
    </div>

    <div v-else>
      <div class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h5 class="text-sm font-semibold text-slate-900">Breeding Details</h5>
              <p class="text-xs text-slate-500">Pick the heat event and breeding method first.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label for="heat_event_id" class="mb-1.5 block text-sm font-medium text-slate-700">Heat Event *</label>
              <div class="relative">
                <select id="heat_event_id" v-model="heat_event_id" class="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
                  <option value="" disabled>Select from recent heat events...</option>
                  <option v-for="h in heats" :key="h.id" :value="h.id">{{ h.cow_name || h.cow_id }} — {{ new Date(h.event_time).toLocaleString() }}</option>
                </select>
                <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label for="method" class="mb-1.5 block text-sm font-medium text-slate-700">Breeding Method *</label>
                <div class="relative">
                  <select id="method" v-model="method" class="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
                    <option value="ai">Artificial Insemination</option>
                    <option value="natural">Natural</option>
                  </select>
                  <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label for="sire_id" class="mb-1.5 block text-sm font-medium text-slate-700">Sire / Bull *</label>
                <div class="relative">
                  <select id="sire_id" v-model="sire_id" class="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
                    <option value="" disabled>Select sire...</option>
                    <option v-for="c in bulls" :key="c.id" :value="c.id">{{ c.name || c.tag_id }}</option>
                  </select>
                  <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h5 class="text-sm font-semibold text-slate-900">Operational Details</h5>
              <p class="text-xs text-slate-500">Optional tracking fields for semen, staff, and cost.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="semen_batch" class="mb-1.5 block text-sm font-medium text-slate-700">Semen Batch Number</label>
              <input id="semen_batch" v-model="semen_batch" placeholder="e.g., SEM-2024-001" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
            </div>
            <div>
              <label for="technician" class="mb-1.5 block text-sm font-medium text-slate-700">Technician Name</label>
              <input id="technician" v-model="technician" placeholder="Name of person performing AI" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="bcs" class="mb-1.5 block text-sm font-medium text-slate-700">Body Condition Score (1-5)</label>
              <input id="bcs" v-model="bcs" placeholder="e.g., 3.5" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
            </div>
            <div>
              <label for="cost" class="mb-1.5 block text-sm font-medium text-slate-700">Cost</label>
              <input id="cost" v-model.number="cost" type="number" step="0.01" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
            </div>
          </div>
        </div>

        <div>
          <label for="notes" class="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
          <textarea id="notes" v-model="notes" rows="3" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15" />
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button :disabled="loading" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
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
