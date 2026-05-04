<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="close"/>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEdit ? 'Edit Health Record' : 'Add Health Record' }}
            </h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Form -->
        <form class="px-6 py-4" @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <!-- Cow Selection and Record Type -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cow_id" class="block text-sm font-medium text-gray-700 mb-2">
                  Cow <span class="text-red-500">*</span>
                </label>
                <select
                  id="cow_id"
                  v-model="formData.cow_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  :disabled="isEdit"
                >
                  <option value="">Select a cow</option>
                  <option v-for="cow in cows" :key="cow.id" :value="cow.id">
                    {{ cow.name }} ({{ cow.tag_id }})
                  </option>
                </select>
              </div>

              <div>
                <label for="record_type" class="block text-sm font-medium text-gray-700 mb-2">
                  Record Type <span class="text-red-500">*</span>
                </label>
                <select
                  id="record_type"
                  v-model="formData.record_type"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="medication">Medication</option>
                  <option value="disease">Disease/Illness</option>
                  <option value="treatment">Treatment</option>
                  <option value="checkup">Checkup</option>
                  <option value="injury">Injury</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <!-- Title and Date/Time -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  required
                  placeholder="e.g., Annual Vaccination, Mastitis Treatment"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>

              <div>
                <label for="record_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Record Date <span class="text-red-500">*</span>
                </label>
                <input
                  id="record_date"
                  v-model="formData.record_date"
                  type="date"
                  required
                  :max="todayDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>

              <div>
                <label for="record_time" class="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  id="record_time"
                  v-model="formData.record_time"
                  type="time"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Detailed description of the health record..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <!-- Type-specific fields: Vaccination -->
            <div v-if="formData.record_type === 'vaccination'" class="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h4 class="font-medium text-gray-900">Vaccination Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="vaccine_name" class="block text-sm font-medium text-gray-700 mb-2">Vaccine Name</label>
                  <input
                    id="vaccine_name"
                    v-model="formData.vaccine_name"
                    type="text"
                    placeholder="e.g., FMD Vaccine"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="dosage_vacc" class="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                  <input
                    id="dosage_vacc"
                    v-model="formData.dosage"
                    type="text"
                    placeholder="e.g., 2ml"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="administered_by_vacc" class="block text-sm font-medium text-gray-700 mb-2">Administered By</label>
                  <input
                    id="administered_by_vacc"
                    v-model="formData.administered_by"
                    type="text"
                    placeholder="e.g., Dr. Smith"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
              </div>
            </div>

            <!-- Type-specific fields: Medication -->
            <div v-if="formData.record_type === 'medication'" class="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h4 class="font-medium text-gray-900">Medication Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="medication_name" class="block text-sm font-medium text-gray-700 mb-2">Medication Name</label>
                  <input
id="medication_name"                    v-model="formData.medication_name"
                    type="text"
                    placeholder="e.g., Antibiotics"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="dosage_med" class="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                  <input
                    id="dosage_med"
                    v-model="formData.dosage"
                    type="text"
                    placeholder="e.g., 10ml twice daily"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="administered_by_med" class="block text-sm font-medium text-gray-700 mb-2">Administered By</label>
                  <input
                    id="administered_by_med"
                    v-model="formData.administered_by"
                    type="text"
                    placeholder="e.g., Farm staff"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
              </div>
            </div>

            <!-- Type-specific fields: Disease/Treatment -->
            <div v-if="['disease', 'treatment'].includes(formData.record_type)" class="space-y-4 p-4 bg-red-50 rounded-lg">
              <h4 class="font-medium text-gray-900">{{ formData.record_type === 'disease' ? 'Disease' : 'Treatment' }} Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="disease_name" class="block text-sm font-medium text-gray-700 mb-2">Disease Name</label>
                  <input
                    id="disease_name"
                    v-model="formData.disease_name"
                    type="text"
                    placeholder="e.g., Mastitis"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="recovery_status" class="block text-sm font-medium text-gray-700 mb-2">Recovery Status</label>
                  <select
                    id="recovery_status"
                    v-model="formData.recovery_status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select status</option>
                    <option value="recovering">Recovering</option>
                    <option value="recovered">Recovered</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label for="symptoms" class="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <textarea
                    id="symptoms"
                    v-model="formData.symptoms"
                    rows="2"
                    placeholder="Describe symptoms..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div class="md:col-span-2">
                  <label for="diagnosis" class="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <textarea
                    id="diagnosis"
                    v-model="formData.diagnosis"
                    rows="2"
                    placeholder="Veterinary diagnosis..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div class="md:col-span-2">
                  <label for="treatment_plan" class="block text-sm font-medium text-gray-700 mb-2">Treatment Plan</label>
                  <textarea
                    id="treatment_plan"
                    v-model="formData.treatment_plan"
                    rows="2"
                    placeholder="Treatment details..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <!-- Veterinarian Information -->
            <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-900">Veterinarian Information (Optional)</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="vet_name" class="block text-sm font-medium text-gray-700 mb-2">Vet Name</label>
                  <input
                    id="vet_name"
                    v-model="formData.vet_name"
                    type="text"
                    placeholder="e.g., Dr. Johnson"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="vet_contact" class="block text-sm font-medium text-gray-700 mb-2">Vet Contact</label>
                  <input
                    id="vet_contact"
                    v-model="formData.vet_contact"
                    type="text"
                    placeholder="Phone or email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label for="next_checkup_date" class="block text-sm font-medium text-gray-700 mb-2">
                    Next Checkup Date
                    <span class="text-gray-400 font-normal text-xs ml-1">(for follow-up alerts)</span>
                  </label>
                  <input
                    id="next_checkup_date"
                    v-model="formData.next_checkup_date"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
              </div>
            </div>

            <!-- Cost and Notes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cost" class="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                <input
                  id="cost"
                  v-model="formData.cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
              </div>
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Any additional information..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Saving...' : (isEdit ? 'Update Record' : 'Add Record') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  },
  cows: {
    type: Array,
    default: () => []
  },
  preselectedCowId: {
    type: String,
    default: null
  }
})

console.log('HealthRecordModal component initializing')

const emit = defineEmits(['update:modelValue', 'save'])

const { addHealthRecord, updateHealthRecord } = useHealthRecords()

const saving = ref(false)
const isEdit = computed(() => !!props.record?.id)

const todayDate = computed(() => new Date().toISOString().split('T')[0])

const formData = ref({
  cow_id: '',
  record_type: '',
  record_date: new Date().toISOString().split('T')[0],
  record_time: new Date().toTimeString().slice(0, 5),
  title: '',
  description: '',
  vaccine_name: '',
  medication_name: '',
  dosage: '',
  administered_by: '',
  next_checkup_date: '',
  disease_name: '',
  symptoms: '',
  diagnosis: '',
  treatment_plan: '',
  recovery_status: '',
  vet_name: '',
  vet_contact: '',
  cost: '',
  notes: ''
})

// Watch for modal opening (modelValue changes)
watch(() => props.modelValue, (isOpen) => {
  console.log('=== MODAL OPEN/CLOSE ===', isOpen)
  if (isOpen) {
    console.log('Modal is opening, record:', props.record)
    resetForm()
    // Pre-select cow if provided
    if (props.preselectedCowId) {
      formData.value.cow_id = props.preselectedCowId
    }
    if (props.record && Object.keys(props.record).length > 0) {
      console.log('Populating form with record data')
      formData.value = {
        ...formData.value,
        ...props.record
      }
    }
  }
}, { immediate: true })

// Watch for record changes while modal is open
watch(() => props.record, (newRecord) => {
  console.log('=== RECORD PROP CHANGED ===', newRecord)
  if (props.modelValue && newRecord && Object.keys(newRecord).length > 0) {
    console.log('Updating form with new record')
    formData.value = {
      ...formData.value,
      ...newRecord
    }
  }
}, { deep: true })

const resetForm = () => {
  formData.value = {
    cow_id: '',
    record_type: '',
    record_date: new Date().toISOString().split('T')[0],
    record_time: new Date().toTimeString().slice(0, 5),
    title: '',
    description: '',
    vaccine_name: '',
    medication_name: '',
    dosage: '',
    administered_by: '',
    next_checkup_date: '',
    disease_name: '',
    symptoms: '',
    diagnosis: '',
    treatment_plan: '',
    recovery_status: '',
    vet_name: '',
    vet_contact: '',
    cost: '',
    notes: ''
  }
}

const close = () => {
  emit('update:modelValue', false)
  // Don't reset immediately to avoid losing data during close animation
  setTimeout(() => {
    resetForm()
  }, 300)
}

const handleSubmit = async () => {
  console.log('=== FORM SUBMIT STARTED ===')
  console.log('formData:', formData.value)
  console.log('isEdit:', isEdit.value)
  
  saving.value = true
  
  try {
    // Clean up empty fields
    const cleanData = Object.entries(formData.value).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null) {
        acc[key] = value
      }
      return acc
    }, {})

    console.log('cleanData to submit:', cleanData)

    let result
    if (isEdit.value) {
      console.log('Updating health record with id:', props.record.id)
      result = await updateHealthRecord(props.record.id, cleanData)
    } else {
      console.log('Adding new health record')
      result = await addHealthRecord(cleanData)
    }

    console.log('Submit result:', result)

    if (result) {
      console.log('Success! Emitting save and closing')
      useAppToast().success(isEdit.value ? 'Health record updated successfully' : 'Health record added successfully')
      emit('save')
      close()
    } else {
      console.log('Result was null/falsy')
    }
  } catch (err) {
    console.error('handleSubmit error:', err)
    useAppToast().error('Failed to save health record')
  } finally {
    saving.value = false
  }
}
</script>
