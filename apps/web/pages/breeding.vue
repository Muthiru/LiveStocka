<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="mb-4">
        <h1 class="text-3xl font-bold text-gray-900">Breeding</h1>
        <p class="mt-1 text-sm text-gray-600">Record heats, schedule breeding, and view windows</p>
      </div>

      

      <!-- Info banner -->
      <div class="mb-6">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <div class="flex items-start gap-3">
            <div>
              <div class="text-sm font-semibold">Optimal Breeding Windows</div>
              <div class="text-sm text-gray-600">Breeding windows are calculated 12–18 hours after heat detection for best conception rates.</div>
            </div>
          </div>
          </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main class="lg:col-span-2 space-y-6">
          <section class="bg-white border rounded-lg shadow">
            <div class="px-5 py-4 border-b">
              <h2 class="text-lg font-semibold">Record Heat Event</h2>
            </div>
            <div class="p-5">
              <div class="mb-4">
                <label for="cow_select" class="block text-sm font-medium text-gray-700">Select Cow *</label>
                <select id="cow_select" v-model="selectedCowId" class="mt-1 block w-full rounded border-gray-300 shadow-sm">
                  <option value="" disabled>Choose a cow...</option>
                  <option v-for="c in breedingCows" :key="c.id" :value="c.id">{{ c.name || c.tag_id }}</option>
                </select>
              </div>

              <div>
                <HeatForm :cow-id="selectedCowId" />
              </div>
            </div>
          </section>

          <section id="breeding-form" class="bg-white border rounded-lg shadow">
            <div class="px-5 py-4 border-b">
              <h2 class="text-lg font-semibold">Record Breeding Attempt</h2>
            </div>
            <div class="p-5">
              <BreedingForm :cow-id="selectedCowId" />
            </div>
          </section>

          <section class="bg-white border rounded-lg shadow">
            <div class="px-5 py-4 border-b">
              <h2 class="text-lg font-semibold">Breeding History</h2>
            </div>
            <div class="p-5">
              <BreedingHistoryTable :cow-id="selectedCowId" />
            </div>
          </section>
        </main>

        <aside class="space-y-6">
          <div class="bg-white border rounded-lg shadow">
            <div class="px-4 py-3 border-b">
              <h3 class="text-sm font-semibold">Active Breeding Windows</h3>
            </div>
            <div class="p-4">
              <ActiveBreedingWindows />
            </div>
          </div>

          <div class="bg-white border rounded-lg shadow">
            <div class="px-4 py-3 border-b">
              <h3 class="text-sm font-semibold">Upcoming Events</h3>
            </div>
              <div class="p-4 space-y-3 text-sm text-gray-700">
                <div v-if="(pregnancyChecks || []).length === 0 && (expectedHeats || []).length === 0" class="p-3 border rounded text-gray-500">No upcoming events.</div>
                <template v-if="(pregnancyChecks || []).length > 0">
                  <div v-for="pc in pregnancyChecks" :key="pc.id" class="p-3 border rounded">
                    <div class="font-medium text-gray-900">Pregnancy Check Due</div>
                    <div class="text-xs text-gray-500 italic">{{ (pc as any).cow_name || pc.cow_id }}</div>
                    <div class="text-xs text-indigo-600 font-medium">Due: {{ pc.due_in || 'now' }}</div>
                  </div>
                </template>
                <template v-if="(expectedHeats || []).length > 0">
                  <div v-for="eh in expectedHeats" :key="eh.id" class="p-3 border rounded">
                    <div class="font-medium text-gray-900">Expected Heat</div>
                    <div class="text-xs text-gray-500 italic">{{ (eh as any).cow_name || eh.cow_id }}</div>
                    <div class="text-xs text-orange-600 font-medium">Expected in {{ eh.days_until ?? eh.expected_in_days ?? '' }} days</div>
                  </div>
                </template>
              </div>
          </div>
        </aside>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCows } from '~/composables/useCows'

definePageMeta({ layout: 'default' })

const { cows, fetchCows } = useCows()
const selectedCowId = ref<string | null>(null)

// Filter out bulls, deceased, and sold cows from the breeding list
const breedingCows = computed(() => {
  return cows.value.filter(c => {
    const s = (c.status || '').toLowerCase()
    return s !== 'bull' && s !== 'deceased' && s !== 'sold'
  })
})

const { $supabase } = useNuxtApp()

interface PendingPregCheck { id: string; cow_id?: string; due_in?: string }
interface ExpectedHeat { id: string; cow_id?: string; days_until?: number | null; expected_in_days?: number | null }

const { data: pregnancyChecksData } = await useAsyncData<PendingPregCheck[]>('pending-preg-checks', async () => {
  const { data } = await $supabase.from('v_pending_pregnancy_checks').select('*').limit(5)
  return (data || []) as PendingPregCheck[]
})

const { data: expectedHeatsData } = await useAsyncData<ExpectedHeat[]>('expected-heats', async () => {
  const { data } = await $supabase.from('v_expected_heats').select('*').limit(5)
  return (data || []) as ExpectedHeat[]
})

const pregnancyChecks = pregnancyChecksData
const expectedHeats = expectedHeatsData

onMounted(async () => {
  await fetchCows()
  if (breedingCows.value.length > 0) {
    selectedCowId.value = breedingCows.value[0].id
  }
})
</script>
