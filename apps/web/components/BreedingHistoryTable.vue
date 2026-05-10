<template>
  <div class="p-4 bg-white rounded shadow">
    <h3 class="text-lg font-medium mb-2">Breeding History</h3>

    <div v-if="loading" class="py-8 flex justify-center">Loading...</div>
    <div v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</div>

    <div v-if="!loading && !error">
      <div v-if="rows.length === 0" class="p-6 text-sm text-gray-600 border rounded bg-gray-50">No breeding history for the selected cow. Use the <a href="#breeding-form" class="text-indigo-600 hover:underline">Record Breeding</a> form above to add an entry.</div>

      <table v-else class="min-w-full divide-y divide-gray-200 mt-2">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Cow</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Sire</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Method</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="r in rows" :key="r.id">
                <td class="px-4 py-2 text-sm text-gray-700">{{ new Date(r.attempt_time).toLocaleDateString() }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">{{ r.cow_id || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">{{ r.sire_name || r.sire_id || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">{{ r.method || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">
                  <span v-if="r.result === 'pending'" class="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">PENDING</span>
                  <span v-else-if="r.result === 'confirmed'" class="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">CONFIRMED</span>
                  <span v-else class="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">{{ (r.result || 'OPEN').toUpperCase() }}</span>
                </td>
              </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
const props = defineProps<{ cowId?: string | null }>()
const { $supabase } = useNuxtApp()

interface BreedingRow {
  id: string
  attempt_time: string
  sire_id?: string | null
  sire_name?: string | null
  result?: string | null
  notes?: string | null
  cow_id?: string | null
  method?: string | null
}

const rows = ref<BreedingRow[]>([])
const loading = ref(false)
// error may be a string or an Error/object returned from APIs; store as unknown
const error = ref<unknown | null>(null)

const errorMessage = computed(() => {
  const val = error.value
  if (val == null) return null
  if (typeof val === 'string') return val
  if (val instanceof Error) return val.message
  try {
    return JSON.stringify(val)
  } catch (error_: unknown) {
    console.debug('Failed to stringify error value in BreedingHistoryTable:', error_)
    return String(val)
  }
})

interface ApiAttempt {
  id: string
  attempt_time: string
  notes?: string | null
  result?: string | null
  sire?: { id?: string | null; name?: string | null; tag_id?: string | null } | null
  cow?: { id?: string | null } | null
  cow_id?: string | null
  method?: string | null
  breeding_method?: string | null
}

// Supabase fallback row shape for direct table query
interface SupabaseAttempt {
  id: string
  attempt_time: string
  result?: string | null
  notes?: string | null
  method?: string | null
  sire_id?: string | null
  cow_id?: string | null
}

interface CowIdRow {
  id: string
}

const isUuid = (val?: string | null) => {
  if (!val) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)
}

const resolveCowId = async (rawId: string) => {
  if (isUuid(rawId)) return rawId
  // Try to resolve by name or tag
  try {
    const query = $supabase
      .from('cows')
      .select('id')
      .or(`name.eq.${rawId},tag_id.eq.${rawId}`)
      .limit(1) as unknown as {
        maybeSingle: () => Promise<{ data: CowIdRow | null; error: unknown }>
      }

    const { data, error: qErr } = await query.maybeSingle()
    if (qErr) throw qErr
    const row = data as CowIdRow | null
    if (row?.id) return row.id
  } catch (err) {
    console.debug('Failed to resolve cow id from name/tag:', err)
  }
  return rawId
}

const fetchHistory = async () => {
  if (!props.cowId) {
    rows.value = []
    loading.value = false
    error.value = null
    return
  }

  loading.value = true
  error.value = null
  try {
    const cowIdResolved = await resolveCowId(props.cowId)
    const base = useRuntimeConfig().public.supabaseUrl
    const url = `${base}/functions/v1/readService/breeding_history?cow_id=${cowIdResolved}`
    const res = await $fetch<{ attempts?: ApiAttempt[] }>(url)
    const attempts = (res?.attempts || []) as ApiAttempt[]
    rows.value = attempts.map(r => ({
      id: r.id,
      attempt_time: r.attempt_time,
      cow_id: r.cow_id || r.cow?.id || null,
      sire_id: r.sire?.id || null,
      sire_name: r.sire?.name || r.sire?.tag_id || null,
      method: r.method || null,
      result: null,  // Result is from pregnancy_checks table, not breeding_attempts
      notes: r.notes || null
    }))
  } catch (e: unknown) {
    // Network or auth error calling the edge function — log and attempt to fallback to direct Supabase query
    console.error('Error calling breeding_history edge function:', e)
    try {
      const { data, error: qErr } = await $supabase
        .from('breeding_attempts')
        .select('id,attempt_time,notes,method,sire_id,cow_id')
        .eq('cow_id', props.cowId)
        .order('attempt_time', { ascending: false })

      if (qErr) throw qErr
      const attempts = (data || []) as Array<SupabaseAttempt>
      rows.value = attempts.map((r: SupabaseAttempt) => ({
        id: r.id,
        attempt_time: r.attempt_time,
        cow_id: r.cow_id || null,
        sire_id: r.sire_id || null,
        sire_name: null,
        method: r.method || null,
        result: null,  // Result is from pregnancy_checks table, not breeding_attempts
        notes: r.notes || null
      }))
      error.value = null
    } catch (error_: unknown) {
      // Handle fallback query error
      console.error('Fallback Supabase query failed:', error_)
      if (error_ instanceof Error) error.value = error_.message
      else error.value = String(error_)
      rows.value = []
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.cowId, () => {
  fetchHistory()
}, { immediate: true })

onMounted(() => {
  fetchHistory()
})
</script>
