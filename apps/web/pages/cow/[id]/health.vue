<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Health Records</h1>
          <p v-if="cow" class="mt-2 text-sm text-gray-600">for {{ cow.name }}</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink
            :to="`/cow/${route.params.id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Icon name="lucide:arrow-left" class="mr-2 h-5 w-5" />
            Back to Cow
          </NuxtLink>
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            type="button"
@click="() => { console.log('BUTTON CLICKED!!!'); openAddModal(); }"
          >
            <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
            Add Record
          </button>
        </div>
      </div>

      <!-- Health Records List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Health History</h3>
        </div>
        <div v-if="loading" class="text-center py-8">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p class="mt-2 text-sm text-gray-500">Loading records...</p>
        </div>
        <div v-else-if="healthRecords.length === 0" class="text-center py-12">
          <Icon name="lucide:heart-pulse" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No health records</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a health record.</p>
          <button
            class="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            @click="openAddModal"
          >
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Add First Record
          </button>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="record in healthRecords" :key="record.id" class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-start justify-between">
              <div class="flex items-start flex-1">
                <div class="flex-shrink-0">
                  <div :class="getTypeColor(record.record_type).split(' ')[0]" class="h-10 w-10 rounded-full flex items-center justify-center">
                    <Icon :name="getTypeIcon(record.record_type)" class="w-5 h-5" :class="getTypeColor(record.record_type).split(' ')[1]" />
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="getTypeColor(record.record_type)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1) }}
                    </span>
                    <span class="text-sm font-semibold text-gray-900">{{ record.title }}</span>
                  </div>
                  <p v-if="record.description" class="text-sm text-gray-600 mb-2">{{ record.description }}</p>
                  
                  <!-- Additional details -->
                  <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span v-if="record.vaccine_name" class="flex items-center gap-1">
                      <Icon name="lucide:syringe" class="w-3 h-3" />
                      {{ record.vaccine_name }}
                    </span>
                    <span v-if="record.medication_name" class="flex items-center gap-1">
                      <Icon name="lucide:pill" class="w-3 h-3" />
                      {{ record.medication_name }}
                    </span>
                    <span v-if="record.dosage" class="flex items-center gap-1">
                      <Icon name="lucide:droplet" class="w-3 h-3" />
                      {{ record.dosage }}
                    </span>
                    <span v-if="record.vet_name" class="flex items-center gap-1">
                      <Icon name="lucide:user-check" class="w-3 h-3" />
                      {{ record.vet_name }}
                    </span>
                    <span v-if="record.cost" class="flex items-center gap-1">
                      <Icon name="lucide:dollar-sign" class="w-3 h-3" />
                      ${{ record.cost }}
                    </span>
                  </div>
                  
                  <div v-if="record.next_checkup_date" class="mt-2 flex items-center gap-2 text-xs">
                    <Icon name="lucide:bell" class="w-3 h-3" :class="isOverdue(record.next_checkup_date) ? 'text-red-600' : 'text-blue-600'" />
                    <span :class="isOverdue(record.next_checkup_date) ? 'text-red-600 font-medium' : 'text-blue-600'">
                      Next checkup: {{ formatDate(record.next_checkup_date) }}
                      {{ isOverdue(record.next_checkup_date) ? '(Overdue)' : '' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end ml-4">
                <div class="text-sm font-medium text-gray-900">{{ formatDate(record.record_date) }}</div>
                <div class="text-xs text-gray-500 mb-2">{{ getRelativeDate(record.record_date) }}</div>
                <div class="flex gap-2">
                  <button
                    class="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit"
                    @click="editRecord(record)"
                  >
                    <Icon name="lucide:edit" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                    @click="confirmDelete(record)"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <HealthRecordModal
      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cow ? [cow] : []"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import { formatDate, getRelativeDate } from '~/utils/formatDate'
import { getHealthRecordTypeColor as getTypeColor, getHealthRecordTypeIcon as getTypeIcon, isOverdue } from '~/utils/statusHelpers'

definePageMeta({
  middleware: 'auth'
})

interface Cow {
  id: string
  name: string
  tag_id: string
  breed?: string
}

interface HealthRecord {
  id: string
  cow_id: string
  record_type: string
  title: string
  record_date: string
  description?: string
  vaccine_name?: string
  medication_name?: string
  dosage?: string
  vet_name?: string
  cost?: number
  next_checkup_date?: string
  disease_name?: string
  symptoms?: string
  diagnosis?: string
  treatment_plan?: string
  recovery_status?: string
  vet_contact?: string
  appointment_date?: string
  attachments?: any[]
  notes?: string
}

const route = useRoute()
const { fetchHealthRecords, deleteHealthRecord } = useHealthRecords()
const { getCowById } = useCows()

const cow: Ref<Cow | null> = ref(null)
const healthRecords: Ref<HealthRecord[]> = ref([])
const showAddModal = ref(false)
const selectedRecord: Ref<Record<string, any> | null> = ref(null)
const loading = ref(true)

const openAddModal = (): void => {
  // Pre-fill cow_id when adding a new record
  selectedRecord.value = {
    cow_id: Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  }
  showAddModal.value = true
}

const editRecord = (record: HealthRecord): void => {
  selectedRecord.value = { ...record }
  showAddModal.value = true
}

const confirmDelete = async (record: HealthRecord): Promise<void> => {
  if (confirm(`Are you sure you want to delete this health record?`)) {
    await deleteHealthRecord(record.id)
    await loadData()
  }
}

const handleSave = (): void => {
  showAddModal.value = false
  selectedRecord.value = null
  loadData()
}

const loadData = async (): Promise<void> => {
  loading.value = true
  try {
    const cowId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    
    // Fetch cow details
    cow.value = await getCowById(cowId as string)
    
    // Fetch health records for this cow
    const records = await fetchHealthRecords(cowId as string)
    healthRecords.value = records || []
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

</script>
