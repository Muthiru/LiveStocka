<template>
  <PageContainer size="wide">
    <PageHeader title="Breeding" subtitle="Record heats, schedule breeding, and view windows" />

    <div class="mx-auto max-w-7xl px-4 pt-4 space-y-6">
    <!-- Info banner -->
    <div class="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
      <div class="text-sm font-semibold text-slate-900">Optimal Breeding Windows</div>
      <div class="mt-1 text-sm text-slate-600">Breeding windows are calculated 12–18 hours after heat detection for best conception rates.</div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <main class="space-y-6">
          <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-200 px-3 py-3 sm:px-4 sm:py-4">
              <h2 class="text-sm sm:text-base font-semibold text-slate-900">Record Heat Event</h2>
            </div>
            <div class="p-3 sm:p-4">
              <div class="mb-4">
                <label for="cow_select" class="block text-sm font-medium text-slate-700">Select Cow *</label>
                <LoadingState v-if="cowsLoading" :boxed="false" text="Loading cows..." size="sm" />
                <EmptyState
                  v-else-if="breedingCows.length === 0"
                  :boxed="false"
                  icon="lucide:database"
                  title="No cows available"
                  description="Add an active cow to start recording breeding events."
                >
                  <template #actions>
                    <UButton to="/add-cow" color="primary" icon="i-lucide-plus">
                      Add cow
                    </UButton>
                  </template>
                </EmptyState>
                <select
                  v-else
                  id="cow_select"
                  v-model="selectedCowId"
                  class="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                >
                  <option value="" disabled>Choose a cow...</option>
                  <option v-for="c in breedingCows" :key="c.id" :value="c.id">{{ c.name || c.tag_id }}</option>
                </select>
              </div>

              <div>
                <HeatForm :cow-id="selectedCowId" />
              </div>
            </div>
          </section>

          <section id="breeding-form" class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-200 px-3 py-3 sm:px-4 sm:py-4">
              <h2 class="text-sm sm:text-base font-semibold text-slate-900">Record Breeding Attempt</h2>
            </div>
            <div class="p-3 sm:p-4">
              <BreedingForm :cow-id="selectedCowId" />
            </div>
          </section>

          <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-200 px-3 py-3 sm:px-4 sm:py-4">
              <h2 class="text-sm sm:text-base font-semibold text-slate-900">Breeding History</h2>
            </div>
            <div class="p-3 sm:p-4">
              <BreedingHistoryTable :cow-id="selectedCowId" />
            </div>
          </section>
        </main>

        <aside class="space-y-6 lg:sticky lg:top-4 lg:self-start">
          <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-200 px-3 py-3 sm:px-4">
              <h3 class="text-sm font-semibold text-slate-900">Active Breeding Windows</h3>
            </div>
            <div class="p-3 sm:p-4">
              <ActiveBreedingWindows />
            </div>
          </div>

          <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-200 px-3 py-3 sm:px-4">
              <h3 class="text-sm font-semibold text-slate-900">Upcoming Events</h3>
            </div>
              <div class="space-y-3 p-3 text-sm text-slate-700 sm:p-4">
                <div v-if="(pregnancyChecks || []).length === 0 && (expectedHeats || []).length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-500">No upcoming events.</div>
                <template v-if="(pregnancyChecks || []).length > 0">
                  <div v-for="pc in pregnancyChecks" :key="pc.id" class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div class="font-medium text-slate-900">Pregnancy Check Due</div>
                    <div class="text-xs italic text-slate-500">{{ (pc as any).cow_name || pc.cow_id }}</div>
                    <div class="mt-1 text-xs font-medium text-indigo-600">Due: {{ pc.due_in || 'now' }}</div>
                  </div>
                </template>
                <template v-if="(expectedHeats || []).length > 0">
                  <div v-for="eh in expectedHeats" :key="eh.id" class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div class="font-medium text-slate-900">Expected Heat</div>
                    <div class="text-xs italic text-slate-500">{{ (eh as any).cow_name || eh.cow_id }}</div>
                    <div class="mt-1 text-xs font-medium text-orange-600">Expected in {{ eh.days_until ?? eh.expected_in_days ?? '' }} days</div>
                  </div>
                </template>
              </div>
          </div>
        </aside>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCows } from '~/composables/useCows'

definePageMeta({ layout: 'default' })

const { cows, fetchCows, loading: cowsLoading } = useCows()
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
