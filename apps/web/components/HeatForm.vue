<template>
  <form class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" @submit.prevent="onSubmit">
    <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 class="text-sm font-semibold text-slate-900">Record Heat</h4>
        </div>
      <div v-if="!cowIdProvided" class="text-sm text-slate-500">Select a cow to enable recording</div>
    </div>

    <div v-if="!cowIdProvided" class="space-y-2">
      <div class="h-10 rounded-lg bg-slate-100 animate-pulse" />
      <div class="h-10 rounded-lg bg-slate-100 animate-pulse" />
      <div class="h-16 rounded-lg bg-slate-100 animate-pulse" />
      <div class="flex items-center">
        <div class="h-10 w-28 rounded-lg bg-slate-200 animate-pulse" />
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="event_time" class="mb-1.5 block text-sm font-medium text-slate-700">Heat Detected At *</label>
          <input id="event_time" v-model="event_time" type="datetime-local" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
        </div>

        <div>
          <label for="intensity" class="mb-1.5 block text-sm font-medium text-slate-700">Heat Intensity</label>
          <div class="relative">
            <select id="intensity" v-model="intensity" class="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong</option>
            </select>
            <Icon name="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="mb-3 text-sm font-medium text-slate-700">Heat Signs Observed</div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label v-for="s in signsList" :key="s" class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <input v-model="signs" type="checkbox" :value="s" class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
            <span>{{ s }}</span>
          </label>
        </div>
      </div>

      <div>
        <label for="detected_by" class="mb-1.5 block text-sm font-medium text-slate-700">Detected By</label>
        <input id="detected_by" v-model="detected_by" type="text" placeholder="Observer name or tag" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15">
      </div>

      <div>
        <label for="notes" class="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
        <textarea id="notes" v-model="notes" rows="3" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15" />
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <button :disabled="loading || !cowIdProvided" class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span v-if="!loading">Record Heat</span>
            <span v-else>Saving...</span>
          </button>
        </div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAsyncOperation } from '~/composables/useAsyncOperation'

const props = defineProps<{ cowId?: string | null }>()

const defaultEventTime = (() => {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
})()
const event_time = ref<string | null>(defaultEventTime)
const detected_by = ref('')
const notes = ref('')
const intensity = ref('moderate')
const signs = ref<string[]>([])
const signsList = ['Mounting behavior', 'Mucus discharge', 'Restlessness', 'Decreased appetite', 'Vocalization', 'Swollen vulva']

const { $supabase } = useNuxtApp()

const op = useAsyncOperation(async () => {
  // Call heatService edge function with create_heat_event path
  const { data, error: invokeError } = await $supabase.functions.invoke('heatService/create_heat_event', {
    method: 'POST',
    body: {
      cow_id: props.cowId,
      event_time: event_time.value,
      intensity: intensity.value,
      signs: signs.value,
      detected_by: detected_by.value || null,
      notes: notes.value || null
    }
  })
  
  if (invokeError) {
    console.error('create_heat_event edge function error:', invokeError)
    throw new Error(invokeError.message || 'create_heat_event failed')
  }
  
  // Reset form on success
  event_time.value = defaultEventTime
  intensity.value = 'moderate'
  signs.value = []
  detected_by.value = ''
  notes.value = ''
  
  return data
})

const loading = op.loading
const error = op.error
const cowIdProvided = computed(() => !!props.cowId)

const onSubmit = async () => {
  const data = await op.execute()
  if (data) {
    useAppToast().success('Heat event recorded successfully')
    // Trigger refresh of breeding windows and heat dropdowns
    refreshNuxtData('active-windows')
    // Also refresh the specific cow's heats in any BreedingForm
    if (props.cowId) {
      refreshNuxtData(`heats-${props.cowId}`)
    }
  }
}

</script>
