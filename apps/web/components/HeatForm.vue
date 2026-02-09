<template>
  <form class="space-y-4 p-4 bg-white rounded shadow" @submit.prevent="onSubmit">
    <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h4 class="text-sm font-semibold">Record Heat</h4>
        </div>
      <div v-if="!cowIdProvided" class="text-sm text-gray-500">Select a cow to enable recording</div>
    </div>

    <div v-if="!cowIdProvided" class="space-y-2">
      <div class="h-8 bg-gray-100 rounded animate-pulse" />
      <div class="h-8 bg-gray-100 rounded animate-pulse" />
      <div class="h-16 bg-gray-100 rounded animate-pulse" />
      <div class="flex items-center">
        <div class="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="event_time" class="block text-sm font-medium text-gray-700">Heat Detected At *</label>
          <input id="event_time" v-model="event_time" type="datetime-local" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>

        <div>
          <label for="intensity" class="block text-sm font-medium text-gray-700">Heat Intensity</label>
          <select id="intensity" v-model="intensity" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="strong">Strong</option>
          </select>
        </div>
      </div>

      <div class="mt-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Heat Signs Observed</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label v-for="s in signsList" :key="s" class="flex items-center gap-2 p-2 border rounded text-sm bg-white">
            <input v-model="signs" type="checkbox" :value="s" class="form-checkbox">
            <span class="text-sm text-gray-700">{{ s }}</span>
          </label>
        </div>
      </div>

      <div class="mt-4">
        <label for="detected_by" class="block text-sm font-medium text-gray-700">Detected By</label>
        <input id="detected_by" v-model="detected_by" type="text" placeholder="Observer name or tag" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
      </div>

      <div class="mt-4">
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea id="notes" v-model="notes" rows="3" class="mt-1 block w-full rounded border-gray-300 shadow-sm" />
      </div>

      <div class="flex items-center justify-between mt-4">
        <div>
            <button :disabled="loading || !cowIdProvided" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
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
const config = useRuntimeConfig()

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
    useToast().success('Heat event recorded successfully')
    // Trigger refresh of breeding windows and heat dropdowns
    refreshNuxtData('active-windows')
    // Also refresh the specific cow's heats in any BreedingForm
    if (props.cowId) {
      refreshNuxtData(`heats-${props.cowId}`)
    }
  }
}

</script>
