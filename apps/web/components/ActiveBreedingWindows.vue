<template>
  <div class="p-4 bg-white rounded shadow">
    <h3 class="text-lg font-medium mb-2">Active Breeding Windows</h3>

    <div v-if="loading" class="py-8 flex justify-center">
      <div class="text-gray-500">Loading...</div>
    </div>

    <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

    <ul v-if="!loading && !error" class="space-y-3">
      <li v-for="w in windows" :key="w.heat_event_id" class="p-3 border rounded flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div class="font-semibold">{{ w.cow_name || w.cow_id }}</div>
            <div class="text-sm text-gray-500">Heat: {{ formatDateTime(w.event_time) }}</div>
          </div>
          <div class="mt-2">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">Window:</span>
              <span :class="['px-2 py-1 text-xs font-semibold rounded', w.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800']">{{ w.status === 'open' ? 'OPTIMAL' : 'CLOSING' }}</span>
              <div class="ml-3 text-sm text-gray-500">Start: {{ formatDate(w.window_start) }} • End: {{ formatDate(w.window_end) }}</div>
            </div>

            <div class="mt-3">
              <div class="w-full bg-gray-100 h-2 rounded overflow-hidden">
                <div class="h-2 bg-indigo-600" :style="{ width: progressFor(w) + '%' }" />
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ progressFor(w) }}% of optimal window elapsed</div>
            </div>

            <div class="mt-3 flex items-center gap-2">
              <NuxtLink :to="`/cow/${w.cow_id}`" class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100">View cow</NuxtLink>
              <button class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50" :disabled="loadingMap[w.heat_event_id]" @click="markAsBred(w)">Mark as bred</button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'

interface ActiveWindow {
  heat_event_id: string
  cow_id: string
  cow_name?: string
  status: string
  window_start: string
  window_end: string
  event_time: string
}

const windows = ref<ActiveWindow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadingMap = ref<Record<string, boolean>>({})

const formatDate = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString() : '—'
const formatDateTime = (s: string | null | undefined) => s ? new Date(s).toLocaleString() : '—'

const nuxtApp = useNuxtApp()
const supabase = (nuxtApp as unknown as { $supabase?: SupabaseClient }).$supabase ?? null

const markAsBred = async (w: ActiveWindow) => {
  if (!confirm(`Mark ${w.cow_name || w.cow_id} as bred now?`)) return
  loadingMap.value[w.heat_event_id] = true
  try {
    if (!supabase) throw new Error('Supabase client not available')
    const { error: insertErr } = await supabase.from('breeding_attempts').insert({ cow_id: w.cow_id, attempt_time: new Date().toISOString(), result: 'bred', notes: 'Marked as bred via UI' })
    if (insertErr) throw insertErr
    // remove window from list optimistically
    windows.value = windows.value.filter(x => x.heat_event_id !== w.heat_event_id)
  } catch (e) {
    console.error('markAsBred error', e)
    alert('Failed to mark bred: ' + (e?.message || String(e)))
  } finally {
    loadingMap.value[w.heat_event_id] = false
  }
}

const { data: windowsData, pending, error: fetchErr } = useAsyncData('active-windows', async () => {
  if (!supabase) return [] as ActiveWindow[]
  const { data } = await supabase.from('v_active_breeding_windows').select('*').order('window_start', { ascending: true })
  return (data || []) as ActiveWindow[]
})

watch(windowsData, (newData) => {
  if (newData) windows.value = newData
}, { immediate: true })

loading.value = !!pending.value
if (fetchErr.value) error.value = String(fetchErr.value)

const progressFor = (w: ActiveWindow) => {
  try {
    const start = new Date(w.window_start).getTime()
    const end = new Date(w.window_end).getTime()
    const now = Date.now()
    if (!start || !end || end <= start) return 0
    const pct = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, Math.round(pct)))
  } catch (e: unknown) {
    if (e instanceof Error) console.warn('progressFor error:', e.message)
    else console.warn('progressFor error:', String(e))
    return 0
  }
}
</script>
