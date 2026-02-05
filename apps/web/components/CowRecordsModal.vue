<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-start justify-center min-h-screen px-4 pt-12 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-30" @click="close"/>

      <div class="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-lg">
        <div class="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Health Records for {{ cow?.name }}</h3>
            <p class="text-sm text-gray-600">Tag: {{ cow?.tag_id }}</p>
          </div>

          <div class="flex items-center gap-2">
            <button class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" @click="$emit('add', cow)">
              <Icon name="lucide:plus" class="w-4 h-4" />
              Add Health Record
            </button>
            <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg" @click="close">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="px-6 py-3 border-b border-gray-100 bg-white">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input v-model="localSearch" type="text" placeholder="Search records..." class="w-full px-3 py-2 border border-gray-200 rounded-md">
            <select v-model="typeFilter" class="w-full px-3 py-2 border border-gray-200 rounded-md">
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
              <input id="cow-records-date-from" v-model="dateFrom" type="date" class="px-3 py-2 border border-gray-200 rounded-md">
              <label for="cow-records-date-to" class="text-sm text-gray-600">To</label>
              <input id="cow-records-date-to" v-model="dateTo" type="date" class="px-3 py-2 border border-gray-200 rounded-md">
            </div>
          </div>
        </div>

        <div class="p-4 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
          <div v-if="filteredRecords.length === 0" class="text-center py-6">
            <Icon name="lucide:heart-pulse" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-600">No records for this selection</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="record in filteredRecords" :key="record.id" class="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow bg-white">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span :class="getTypeColor(record.record_type)" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ formatRecordType(record.record_type) }}
                    </span>
                    <h4 class="font-semibold text-gray-900">{{ record.title }}</h4>
                    <span class="text-sm text-gray-500">{{ formatDate(record.record_date) }}</span>
                  </div>
                  <p v-if="record.description" class="text-gray-700 text-sm mb-2">{{ record.description }}</p>
                  <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span v-if="record.vaccine_name">{{ record.vaccine_name }}</span>
                    <span v-if="record.medication_name">{{ record.medication_name }}</span>
                    <span v-if="record.vet_name">{{ record.vet_name }}</span>
                    <span v-if="record.cost">${{ record.cost }}</span>
                  </div>
                </div>

                <div class="flex gap-1">
                  <button class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" @click="$emit('edit', record)">
                    <Icon name="lucide:edit" class="w-4 h-4" />
                  </button>
                  <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" @click="$emit('delete', record)">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const formatDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
