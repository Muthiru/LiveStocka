<template>
  <div v-if="modelValue" class="fixed inset-0 z-40 overflow-y-auto">
    <div class="flex items-start justify-center min-h-screen px-4 pt-12 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-30" @click="close"/>

      <dialog class="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-lg" open aria-labelledby="cow-records-title" @keydown.escape="close">
        <div class="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 id="cow-records-title" class="text-lg font-semibold text-gray-900">Health Records for {{ cow?.name }}</h3>
            <p class="text-sm text-gray-600">Tag: {{ cow?.tag_id }}</p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="solid"
              icon="i-lucide-plus"
              class="bg-green-600 text-white hover:bg-green-700"
              @click="$emit('add', cow)"
            >
              Add record
            </UButton>
            <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg" aria-label="Close" @click="close">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="px-6 py-3 border-b border-gray-100 bg-white">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input v-model="localSearch" type="text" placeholder="Search title or description" aria-label="Search records" class="form-input">
            <select v-model="typeFilter" class="form-select">
              <option value="">All types</option>
              <option value="vaccination">Vaccination</option>
              <option value="medication">Medication</option>
              <option value="disease">Disease/Illness</option>
              <option value="treatment">Treatment</option>
              <option value="checkup">Checkup</option>
              <option value="injury">Injury</option>
              <option value="other">Other</option>
            </select>
            <div class="flex items-center gap-2">
              <label for="cow-records-date-from" class="text-sm text-gray-600">From</label>
              <input id="cow-records-date-from" v-model="dateFrom" type="date" class="form-input">
              <label for="cow-records-date-to" class="text-sm text-gray-600">To</label>
              <input id="cow-records-date-to" v-model="dateTo" type="date" class="form-input">
            </div>
          </div>
        </div>

        <div class="p-4 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
          <div v-if="filteredRecords.length === 0" class="text-center py-6">
            <Icon name="lucide:heart-pulse" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-600">No records for this selection</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="record in filteredRecords" :key="record.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span :class="getTypeColor(record.record_type)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ formatRecordType(record.record_type) }}
                    </span>
                    <div class="text-xs text-slate-500">
                      {{ formatDateOnly(record.record_date, record.record_time) }}
                      <template v-if="record.record_time"> · {{ formatTimeOnly(record.record_date, record.record_time) }}</template>
                    </div>
                  </div>

                  <div class="mt-2 truncate text-base font-semibold text-slate-900">{{ record.title }}</div>
                  <div v-if="record.description" class="mt-1 text-sm text-slate-600 line-clamp-2">{{ record.description }}</div>
                </div>

                <div class="flex items-center gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    title="Edit"
                    aria-label="Edit record"
                    @click="$emit('edit', record)"
                  />
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    title="Delete"
                    aria-label="Delete record"
                    @click="$emit('delete', record)"
                  />
                </div>
              </div>

              <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <div v-if="record.vet_name" class="flex items-center gap-2">
                  <Icon name="lucide:stethoscope" class="h-4 w-4 text-slate-400" />
                  <span class="truncate">{{ record.vet_name }}</span>
                </div>
                <div v-if="record.cost !== null && record.cost !== undefined && String(record.cost).trim() !== ''" class="flex items-center gap-2">
                  <Icon name="lucide:coins" class="h-4 w-4 text-slate-400" />
                  <span>${{ record.cost }}</span>
                </div>
                <div v-if="record.vaccine_name" class="sm:col-span-2 text-slate-600">
                  Vaccine: <span class="text-slate-800">{{ record.vaccine_name }}</span>
                </div>
                <div v-if="record.medication_name" class="sm:col-span-2 text-slate-600">
                  Medication: <span class="text-slate-800">{{ record.medication_name }}</span>
                </div>
                <div v-if="record.notes" class="sm:col-span-2 text-slate-600">
                  Notes: <span class="text-slate-800">{{ record.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </div>
</template>

<script setup>
import { formatDateOnly, formatTimeOnly } from '~/utils/formatDate'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cow: { type: Object, default: null },
  records: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'add', 'edit', 'delete'])

const localSearch = ref('')
const typeFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const close = () => emit('update:modelValue', false)

const getTypeColor = (type) => {
  if (type === 'vaccination') return 'px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'
  if (type === 'medication') return 'px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700'
  if (type === 'disease') return 'px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
  return 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'
}

const formatRecordType = (t) => {
  if (!t) return 'Unknown'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const filteredRecords = computed(() => {
  let r = props.records || []
  if (localSearch.value) {
    const q = localSearch.value.toLowerCase()
    r = r.filter(rec => (rec.title || '').toLowerCase().includes(q) || (rec.description || '').toLowerCase().includes(q))
  }
  if (typeFilter.value) r = r.filter(rec => rec.record_type === typeFilter.value)
  if (dateFrom.value) r = r.filter(rec => new Date(rec.record_date) >= new Date(dateFrom.value))
  if (dateTo.value) r = r.filter(rec => new Date(rec.record_date) <= new Date(dateTo.value))
  return r.sort((a,b) => new Date(b.record_date) - new Date(a.record_date))
})

// Removed unused openInPage
</script>
