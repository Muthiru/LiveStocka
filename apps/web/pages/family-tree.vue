<template>
  <div class="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:min-h-screen">
    <!-- Toolbar -->
    <div class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <h1 class="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
            <Icon name="lucide:network" class="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
          Family Tree
          </h1>

          <div class="hidden h-6 w-px bg-slate-200 sm:block" />

          <!-- Root Selector -->
          <div class="flex min-w-0 flex-1 flex-col gap-1 sm:flex-initial">
            <label for="root-select" class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Root Cow
            </label>
            <div class="relative">
              <select
                id="root-select"
                v-model="rootCowId"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 sm:w-72"
                :disabled="loadingCows"
              >
                <option value="" disabled>
                  {{ loadingCows ? 'Loading cows…' : 'Select a cow…' }}
                </option>
                <option v-for="cow in sortedCows" :key="cow.id" :value="cow.id">
                  {{ cow.name }}{{ cow.tag_id ? ` (${cow.tag_id})` : '' }}
                </option>
              </select>
              <Icon
                name="lucide:chevron-down"
                class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            type="button"
            @click="refresh"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            <span class="hidden sm:inline">Refresh</span>
            <span class="sr-only sm:hidden">Refresh family tree</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative flex flex-1 overflow-hidden">
      <!-- Canvas Area -->
      <div class="relative flex-1 overflow-auto bg-slate-50 p-3 sm:p-6">
        <ClientOnly>
          <FamilyTreeCanvas 
            v-if="rootCowId"
            :cow-id="rootCowId" 
            :selected-id="selectedId"
            @node-click="handleNodeClick"
          />
          <div v-else class="mx-auto flex h-full max-w-md flex-col items-center justify-center px-4 text-center text-slate-500 sm:px-6">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
              <Icon name="lucide:arrow-up-circle" class="h-8 w-8 text-slate-400" />
            </div>
            <p class="text-base font-semibold text-slate-700 sm:text-lg">Select a root cow</p>
            <p class="mt-1 text-sm leading-6">Choose a cow above to generate a pedigree tree.</p>
          </div>
        </ClientOnly>
      </div>

      <!-- Mobile overlay (when sidebar open) -->
      <button
        v-if="selectedId"
        type="button"
        class="absolute inset-0 z-20 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
        aria-label="Close details panel"
        @click="selectedId = ''"
      />

      <!-- Sidebar (doesn't steal width on mobile) -->
      <div
        class="absolute right-0 top-0 z-30 h-full w-80 bg-white shadow-2xl transition-transform duration-300 lg:static lg:z-20 lg:shadow-xl"
        :class="selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cow } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { fetchCows } = useCows()

// State
const rootCowId = ref('')
const selectedId = ref('')
const allCows = ref<Cow[]>([])
const loadingCows = ref(false)

const sortedCows = computed(() => {
  return [...allCows.value].sort((a, b) => a.name.localeCompare(b.name))
})

// Methods
const loadCows = async () => {
  loadingCows.value = true
  try {
    allCows.value = await fetchCows()
  } catch (e) {
    console.error('Failed to load cows', e)
  } finally {
    loadingCows.value = false
  }
}

const handleNodeClick = (node: string | { id: string }) => {
  // If node object passed (from graph), use node.id. If string (from sidebar), use directly
  const id = typeof node === 'string' ? node : node?.id
  if (id) selectedId.value = id
}

const refresh = () => {
  const currentRoot = rootCowId.value
  rootCowId.value = ''
  setTimeout(() => {
    rootCowId.value = currentRoot
  }, 100)
}

const route = useRoute()

onMounted(async () => {
  await loadCows()
  
  // Check for root query param
  const queryRoot = route.query.root as string
  if (queryRoot) {
    rootCowId.value = queryRoot
    selectedId.value = queryRoot
  }
})
</script>
