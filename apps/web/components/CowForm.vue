<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Basic Information Section -->
    <div class="rounded-lg bg-white shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3 sm:py-4">
        <h3 class="text-sm font-semibold text-gray-900 sm:text-base">Basic Information</h3>
      </div>
      <div class="p-4 sm:p-5">
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <!-- Name -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="name" class="text-xs font-medium uppercase tracking-wide text-gray-500">Name *</label>
            <input
              id="name"
              :value="form.name"
              type="text"
              required
              class="form-input mt-2"
              :aria-invalid="Boolean(errors.name)"
              :placeholder="isEdit ? '' : 'e.g., Bella'"
              @input="updateField('name', ($event.target as HTMLInputElement).value)"
            >
            <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Birth Date -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="birth_date" class="text-xs font-medium uppercase tracking-wide text-gray-500">Birth Date</label>
            <input
              id="birth_date"
              :value="form.birth_date"
              type="date"
              class="form-input mt-2"
              @input="updateField('birth_date', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Tag ID -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="tag_id" class="text-xs font-medium uppercase tracking-wide text-gray-500">Tag ID / RFID *</label>
            <input
              id="tag_id"
              :value="form.tag_id"
              type="text"
              required
              class="form-input mt-2"
              :aria-invalid="Boolean(errors.tag_id)"
              :placeholder="isEdit ? '' : 'e.g., TAG-001'"
              @input="updateField('tag_id', ($event.target as HTMLInputElement).value)"
            >
            <p v-if="errors.tag_id" class="mt-2 text-sm text-red-600">{{ errors.tag_id }}</p>
          </div>

          <!-- Status -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="status" class="text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
            <select
              id="status"
              :value="form.status"
              class="form-select mt-2"
              @change="updateField('status', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="status in cowStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Breed -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="breed" class="text-xs font-medium uppercase tracking-wide text-gray-500">Breed</label>
            <input
              id="breed"
              :value="form.breed"
              type="text"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'e.g., Holstein, Angus'"
              @input="updateField('breed', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Genetic Line -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="genetic_line" class="text-xs font-medium uppercase tracking-wide text-gray-500">Genetic Line</label>
            <select
              id="genetic_line"
              :value="form.genetic_line"
              class="form-select mt-2"
              @change="updateField('genetic_line', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Select Line...</option>
              <option value="Foundation">Foundation</option>
              <option value="Grade">Grade</option>
              <option value="Appendix">Appendix</option>
              <option value="Pedigree">Pedigree</option>
              <option value="Cross">Cross</option>
            </select>
          </div>

          <!-- Color -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="color" class="text-xs font-medium uppercase tracking-wide text-gray-500">Color</label>
            <input
              id="color"
              :value="form.color"
              type="text"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'e.g., Black, Brown'"
              @input="updateField('color', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Age -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="age" class="text-xs font-medium uppercase tracking-wide text-gray-500">Age (years)</label>
            <input
              id="age"
              :value="form.age"
              type="number"
              min="0"
              step="0.1"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'e.g., 3.5'"
              @input="updateField('age', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Sire -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="sire" class="text-xs font-medium uppercase tracking-wide text-gray-500">Sire (Father)</label>
            <input
              id="sire"
              :value="form.sire"
              type="text"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'Sire name or ID'"
              @input="updateField('sire', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Weight -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="weight" class="text-xs font-medium uppercase tracking-wide text-gray-500">Weight (kg)</label>
            <input
              id="weight"
              :value="form.weight"
              type="number"
              min="0"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'e.g., 450'"
              @input="updateField('weight', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <!-- Dam -->
          <div class="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-4">
            <label for="dam" class="text-xs font-medium uppercase tracking-wide text-gray-500">Dam (Mother)</label>
            <input
              id="dam"
              :value="form.dam"
              type="text"
              class="form-input mt-2"
              :placeholder="isEdit ? '' : 'Dam name or ID'"
              @input="updateField('dam', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div class="rounded-lg bg-white shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3 sm:py-4">
        <h3 class="text-sm font-semibold text-gray-900 sm:text-base">Additional Notes</h3>
      </div>
      <div class="p-4 sm:p-5">
        <label for="notes" class="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</label>
        <textarea
          id="notes"
          :value="form.notes"
          rows="4"
          class="form-textarea mt-2"
          :placeholder="isEdit ? 'Any additional information...' : 'Any additional information about this cow...'"
          @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>

    <!-- Actions Slot -->
    <slot name="actions" />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CowFormData } from '~/types'
import { validateSchema } from '~/utils/schemaValidation'
import { cowFormSchema } from '~/utils/schemas'

const props = defineProps<{
  form: CowFormData
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: []
  'update:form': [value: CowFormData]
}>()

const errors = ref<Partial<Record<keyof CowFormData, string>>>({})

const { cowStatuses } = useCows()

const updateField = (field: keyof CowFormData, value: string) => {
  errors.value[field] = undefined
  emit('update:form', { ...props.form, [field]: value })
}

const handleSubmit = () => {
  const result = validateSchema(cowFormSchema, props.form)
  errors.value = result.errors
  if (!result.valid) return
  emit('submit')
}
</script>
