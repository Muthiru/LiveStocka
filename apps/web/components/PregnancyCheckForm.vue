<template>
  <form class="space-y-4 p-4 bg-white rounded shadow" @submit.prevent="onSubmit">
    <div>
      <label for="breeding_attempt_id" class="block text-sm font-medium text-gray-700">Breeding Attempt</label>
      <select id="breeding_attempt_id" v-model="breeding_attempt_id" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
        <option v-for="a in attempts" :key="a.id" :value="a.id">{{ new Date(a.attempt_time).toLocaleDateString() }} — {{ a.sire?.name || a.sire?.tag_id || a.sire?.id || 'Unknown sire' }}</option>
      </select>
    </div>

    <div>
      <label for="result" class="block text-sm font-medium text-gray-700">Result</label>
      <select id="result" v-model="result" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
        <option value="pregnant">Pregnant</option>
        <option value="open">Open</option>
        <option value="inconclusive">Inconclusive</option>
      </select>
    </div>

    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
      <textarea id="notes" v-model="notes" rows="3" class="mt-1 block w-full rounded border-gray-300 shadow-sm" />
    </div>

    <div class="flex items-center justify-between">
      <button :disabled="loading" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">
        <span v-if="!loading">Record Check</span>
        <span v-else>Saving...</span>
      </button>
      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncOperation } from '~/composables/useAsyncOperation'

const props = defineProps<{ cowId: string }>()


const breeding_attempt_id = ref<string | null>(null)
const result = ref('pregnant')
const notes = ref('')

interface Attempt { id: string; attempt_time: string; sire?: { id?: string; name?: string; tag_id?: string } }

const attempts = ref<Attempt[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const { $supabase } = useNuxtApp()

interface AttemptsResponse {
  attempts?: Attempt[]
}

const { data: attemptsData, pending: attemptsPending, error: attemptsError } = await useAsyncData('attempts-' + props.cowId, async () => {
  const base = useRuntimeConfig().public.supabaseUrl
  const url = `${base}/functions/v1/readService/breeding_history?cow_id=${props.cowId}`
  const res = await $fetch<AttemptsResponse>(url)
  return (res?.attempts || []) as Attempt[]
})

attempts.value = attemptsData.value || []
loading.value = !!attemptsPending.value
if (attemptsError.value) error.value = String(attemptsError.value)

const op = useAsyncOperation(async () => {
  const { data, error: invokeError } = await $supabase.functions.invoke('pregnancyRecordService/record_pregnancy_result', {
    method: 'POST',
    body: {
      breeding_attempt_id: breeding_attempt_id.value,
      result: result.value,
      notes: notes.value || null
    }
  })
  
  if (invokeError) {
    console.error('record_pregnancy_result edge function error:', invokeError)
    throw new Error(invokeError.message || 'record_pregnancy_result failed')
  }
  
  // Reset form on success
  breeding_attempt_id.value = null
  result.value = 'pregnant'
  notes.value = ''
  
  return data
})

const onSubmit = async () => {
  const data = await op.execute()
  if (data) {
    useToast().success('Pregnancy check recorded successfully')
  }
}

</script>
