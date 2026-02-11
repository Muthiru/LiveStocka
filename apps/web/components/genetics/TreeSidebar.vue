<template>
  <div class="h-full bg-white border-l border-gray-200 p-6 overflow-y-auto">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"/>
    </div>

    <div v-else-if="cow" class="space-y-6">
      <!-- Header -->
      <div class="border-b border-gray-100 pb-4">
        <h2 class="text-2xl font-bold text-gray-900">{{ cow.name }}</h2>
        <div class="flex items-center mt-2 text-gray-500">
          <span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{{ cow.tag_id }}</span>
          <span class="mx-2">•</span>
          <span class="capitalize">{{ cow.breed || 'Unknown Breed' }}</span>
        </div>
        <div 
          class="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="{
            'bg-green-100 text-green-800': cow.status === 'active',
            'bg-red-100 text-red-800': cow.status === 'deceased',
            'bg-yellow-100 text-yellow-800': cow.status === 'sold',
            'bg-gray-100 text-gray-800': cow.status === 'dry'
          }">
          {{ cow.status }}
        </div>
        <div 
          v-if="cow.genetic_line === 'Pedigree'"
          class="mt-3 ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"
        >
          <Icon name="lucide:award" class="w-3 h-3 mr-1" />
          Pedigree
        </div>
      </div>

      <!-- Key Stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wider">Age</div>
          <div class="font-semibold text-gray-900 mt-1">{{ cow.age ? `${cow.age} yrs` : '-' }}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wider">Weight</div>
          <div class="font-semibold text-gray-900 mt-1">{{ cow.weight ? `${cow.weight} kg` : '-' }}</div>
        </div>
      </div>

      <!-- Parents -->
      <div>
        <h3 class="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2 mb-3">Lineage</h3>
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="w-8 flex-shrink-0 pt-1">
              <div class="w-2 h-2 rounded-full bg-blue-400 mx-auto"/>
            </div>
            <div>
              <div class="text-xs text-gray-500">Sire (Father)</div>
              <div v-if="sire" class="font-medium text-blue-900 cursor-pointer hover:underline" @click="$emit('select-cow', sire.id)">
                {{ sire.name }} <span class="text-gray-400 text-xs">({{ sire.tag_id }})</span>
              </div>
              <div v-else class="text-sm text-gray-400 italic">Unknown</div>
            </div>
          </div>
          <div class="flex items-start">
             <div class="w-8 flex-shrink-0 pt-1">
              <div class="w-2 h-2 rounded-full bg-pink-400 mx-auto"/>
            </div>
            <div>
              <div class="text-xs text-gray-500">Dam (Mother)</div>
               <div v-if="dam" class="font-medium text-pink-900 cursor-pointer hover:underline" @click="$emit('select-cow', dam.id)">
                {{ dam.name }} <span class="text-gray-400 text-xs">({{ dam.tag_id }})</span>
              </div>
              <div v-else class="text-sm text-gray-400 italic">Unknown</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-4 border-t border-gray-100">
        <NuxtLink 
          :to="`/cow-records/${cow.id}`"
          class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          View Full Profile
        </NuxtLink>
        <button 
          v-if="cow.id !== rootId"
          class="mt-3 block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          @click="$emit('set-root', cow.id)"
        >
          View Tree from Here
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="h-full flex flex-col justify-center items-center text-center text-gray-500">
      <Icon name="lucide:mouse-pointer-click" class="w-12 h-12 mb-3 text-gray-300" />
      <p>Select a cow from the tree to view details</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Cow } from '~/types'

const props = defineProps<{
  cowId?: string
  rootId?: string
}>()

defineEmits<{
  'select-cow': [id: string]
  'set-root': [id: string]
}>()

const { getCowById } = useCows()

const loading = ref(false)
const cow = ref<Cow | null>(null)
const sire = ref<Cow | null>(null)
const dam = ref<Cow | null>(null)

watch(() => props.cowId, async (newId) => {
  if (!newId) {
    cow.value = null
    return
  }

  try {
    loading.value = true
    const data = await getCowById(newId)
    cow.value = data
    
    // Fetch parents details if IDs exist
    if (data?.sire_id) {
        sire.value = await getCowById(data.sire_id)
    } else {
        sire.value = null
    }

    if (data?.dam_id) {
        dam.value = await getCowById(data.dam_id)
    } else {
        dam.value = null
    }

  } catch (e) {
    console.error('Error fetching cow details for sidebar:', e)
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>
