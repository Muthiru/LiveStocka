<template>
  <div class="h-screen flex flex-col pt-16"> <!-- pt-16 to account for navbar -->
    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Icon name="lucide:network" class="w-6 h-6 text-indigo-600" />
          Family Tree
        </h1>
        
        <div class="h-6 w-px bg-gray-300"/>
        
        <!-- Root Selector -->
        <div class="flex items-center gap-2">
          <label for="root-select" class="text-sm font-medium text-gray-700">Root Cow:</label>
          <select 
            id="root-select"
            v-model="rootCowId"
            class="pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            :disabled="loadingCows"
          >
            <option value="" disabled>Select a cow...</option>
            <option v-for="cow in sortedCows" :key="cow.id" :value="cow.id">
              {{ cow.name }} ({{ cow.tag_id }})
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          @click="refresh"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Canvas Area -->
      <div class="flex-1 bg-gray-50 overflow-auto p-8 relative">
        <ClientOnly>
          <FamilyTreeCanvas 
            v-if="rootCowId"
            :cow-id="rootCowId" 
            :selected-id="selectedId"
            @node-click="handleNodeClick"
          />
          <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
            <Icon name="lucide:arrow-up-circle" class="w-16 h-16 mb-4 text-gray-300" />
            <p class="text-lg font-medium">Select a root cow above to generate pedigree</p>
          </div>
        </ClientOnly>
      </div>

      <!-- Sidebar -->
      <div 
        class="w-80 flex-shrink-0 bg-white shadow-xl z-20 transition-transform duration-300"
        :class="selectedId ? 'translate-x-0' : 'translate-x-full'" 
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
