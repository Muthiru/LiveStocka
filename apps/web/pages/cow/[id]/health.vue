<template>
  <PageContainer size="wide">
    <HealthRecordModal
      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cowsForModal"
      :preselected-cow-id="cow?.id || null"
      @save="handleSave"
    />

    <PageHeader title="Health Records" :subtitle="cow ? `for ${cow.name}` : undefined">
      <template #actions>
        <div class="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <UButton :to="`/cow/${route.params.id}`" variant="outline" color="neutral" icon="i-lucide-arrow-left">
            Back to cow
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="solid"
            icon="i-lucide-plus"
            class="bg-green-600 text-white hover:bg-green-700"
            @click="openAddModal"
          >
            Add record
          </UButton>
        </div>
      </template>
    </PageHeader>

    <div class="mx-auto w-[calc(100%-1.5rem)] md:w-full">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 class="text-base font-semibold text-slate-900">Health History</h3>
        </div>
        <div class="p-5">
          <LoadingState v-if="loading" :boxed="false" text="Loading records..." size="sm" />
          <EmptyState
            v-else-if="healthRecords.length === 0"
            :boxed="false"
            icon="lucide:heart-pulse"
            title="No health records yet"
            description="Get started by adding the first health record for this cow."
          />
          <ul v-else class="divide-y divide-slate-200">
            <li v-for="record in healthRecords" :key="record.id" class="px-1 py-4 sm:px-2">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div :class="getTypeColor(record.record_type).split(' ')[0]" class="flex h-10 w-10 items-center justify-center rounded-2xl">
                      <Icon :name="getTypeIcon(record.record_type)" class="h-5 w-5" :class="getTypeColor(record.record_type).split(' ')[1]" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span :class="getTypeColor(record.record_type)" class="rounded-full px-2 py-1 text-xs font-medium">
                        {{ record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1) }}
                      </span>
                      <span class="text-sm font-semibold text-slate-900">{{ record.title }}</span>
                    </div>
                    <p v-if="record.description" class="mt-1 text-sm text-slate-600">{{ record.description }}</p>

                    <div class="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span v-if="record.vaccine_name" class="flex items-center gap-1">
                        <Icon name="lucide:syringe" class="h-3 w-3" />
                        {{ record.vaccine_name }}
                      </span>
                      <span v-if="record.medication_name" class="flex items-center gap-1">
                        <Icon name="lucide:pill" class="h-3 w-3" />
                        {{ record.medication_name }}
                      </span>
                      <span v-if="record.dosage" class="flex items-center gap-1">
                        <Icon name="lucide:droplet" class="h-3 w-3" />
                        {{ record.dosage }}
                      </span>
                      <span v-if="record.vet_name" class="flex items-center gap-1">
                        <Icon name="lucide:user-check" class="h-3 w-3" />
                        {{ record.vet_name }}
                      </span>
                      <span v-if="record.cost" class="flex items-center gap-1">
                        <Icon name="lucide:dollar-sign" class="h-3 w-3" />
                        ${{ record.cost }}
                      </span>
                    </div>

                    <div v-if="record.next_checkup_date" class="mt-2 flex items-center gap-2 text-xs">
                      <Icon name="lucide:bell" class="h-3 w-3" :class="isOverdue(record.next_checkup_date) ? 'text-rose-600' : 'text-sky-600'" />
                      <span :class="isOverdue(record.next_checkup_date) ? 'text-rose-600 font-medium' : 'text-sky-600'">
                        Next checkup: {{ formatDate(record.next_checkup_date) }}
                        {{ isOverdue(record.next_checkup_date) ? '(Overdue)' : '' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                  <div class="text-right">
                    <div class="text-sm font-semibold text-slate-900">{{ formatDate(record.record_date) }}</div>
                    <div class="mt-0.5 text-xs text-slate-500">{{ getRelativeDate(record.record_date) }}</div>
                  </div>
                  <div class="flex gap-1">
                    <button
                      type="button"
                      class="inline-flex rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      title="Edit"
                      @click="editRecord(record)"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                      title="Delete"
                      @click="confirmDelete(record)"
                    >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </PageContainer>
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
const router = useRouter()
const { fetchHealthRecords, deleteHealthRecord } = useHealthRecords()
const { getCowById, cows, fetchCows } = useCows()

const cow: Ref<Cow | null> = ref(null)
const healthRecords: Ref<HealthRecord[]> = ref([])
const showAddModal = ref(false)
const selectedRecord: Ref<Record<string, any> | null> = ref(null)
const loading = ref(true)
const openedFromQuery = ref(false)

const cowsForModal = computed(() => (cow.value ? [cow.value] : cows.value))

const openAddModal = (): void => {
  // Cow preselection is handled by :preselected-cow-id
  selectedRecord.value = null
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

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const loadData = async (): Promise<void> => {
  loading.value = true
  try {
    const cowKey = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

    // Fetch cow details (route param can be UUID or name)
    const decodedKey = safeDecode(String(cowKey))
    cow.value = await getCowById(decodedKey)

    // If we couldn't resolve the cow, fetch the list and try a best-effort match
    // so the Add modal can still open with a selectable cow list.
    if (!cow.value) {
      const list = await fetchCows()
      const match = list.find(c => String(c.name).toLowerCase() === decodedKey.toLowerCase() || String(c.tag_id) === decodedKey)
      cow.value = match || null
    }

    // Normalize URL to use the cow name instead of UUID when possible.
    if (cow.value?.name && uuidRegex.test(decodedKey)) {
      const desired = encodeURIComponent(cow.value.name)
      if (String(cowKey) !== desired) {
        await router.replace(`/cow/${desired}/health`)
        return
      }
    }

    // Fetch health records for this cow (requires UUID)
    const records = cow.value?.id ? await fetchHealthRecords(cow.value.id) : []
    healthRecords.value = records || []

    // Support deep-linking to open the add modal (e.g. ?action=add).
    if (!openedFromQuery.value && route.query.action === 'add') {
      openedFromQuery.value = true
      openAddModal()
      // Remove the action query param to avoid reopening on refresh/back.
      if (cow.value?.name) {
        await router.replace(`/cow/${encodeURIComponent(cow.value.name)}/health`)
      } else {
        await router.replace(`/cow/${encodeURIComponent(decodedKey)}/health`)
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    loadData()
  },
  { immediate: true }
)

</script>
