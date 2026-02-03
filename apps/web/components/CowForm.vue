<template>
  <form class="space-y-6" @submit.prevent="$emit('submit')">
    <!-- Basic Information -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
      </div>
      <div class="px-5 py-5">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="name" class="form-label">Name *</label>
            <input
              id="name"
              :value="form.name"
              type="text"
              required
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., Bella'"
              @input="updateField('name', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="tag_id" class="form-label">Tag ID / RFID *</label>
            <input
              id="tag_id"
              :value="form.tag_id"
              type="text"
              required
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., TAG-001'"
              @input="updateField('tag_id', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="breed" class="form-label">Breed</label>
            <input
              id="breed"
              :value="form.breed"
              type="text"
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., Holstein, Angus'"
              @input="updateField('breed', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="color" class="form-label">Color</label>
            <input
              id="color"
              :value="form.color"
              type="text"
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., Black, Brown'"
              @input="updateField('color', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="age" class="form-label">Age (years)</label>
            <input
              id="age"
              :value="form.age"
              type="number"
              min="0"
              step="0.1"
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., 3.5'"
              @input="updateField('age', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="weight" class="form-label">Weight (kg)</label>
            <input
              id="weight"
              :value="form.weight"
              type="number"
              min="0"
              class="form-input"
              :placeholder="isEdit ? '' : 'e.g., 450'"
              @input="updateField('weight', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="status" class="form-label">Status</label>
            <select
              id="status"
              :value="form.status"
              class="form-select"
              @change="updateField('status', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="status in cowStatuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="birth_date" class="form-label">Birth Date</label>
            <input
              id="birth_date"
              :value="form.birth_date"
              type="date"
              class="form-input"
              @input="updateField('birth_date', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Parentage Information -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Parentage {{ isEdit ? '' : '(Optional)' }}</h3>
      </div>
      <div class="px-5 py-5">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="sire" class="form-label">Sire (Father)</label>
            <input
              id="sire"
              :value="form.sire"
              type="text"
              class="form-input"
              :placeholder="isEdit ? '' : 'Sire name or ID'"
              @input="updateField('sire', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label for="dam" class="form-label">Dam (Mother)</label>
            <input
              id="dam"
              :value="form.dam"
              type="text"
              class="form-input"
              :placeholder="isEdit ? '' : 'Dam name or ID'"
              @input="updateField('dam', ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-5 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Additional Notes</h3>
      </div>
      <div class="px-5 py-5">
        <div>
          <label for="notes" class="form-label">Notes</label>
          <textarea
            id="notes"
            :value="form.notes"
            rows="4"
            class="form-textarea"
            :placeholder="isEdit ? 'Any additional information...' : 'Any additional information about this cow...'"
            @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- Actions Slot -->
    <slot name="actions" />
  </form>
</template>

<script setup lang="ts">
import type { CowFormData } from '~/types'

const props = defineProps<{
  form: CowFormData
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: []
  'update:form': [value: CowFormData]
}>()

const { cowStatuses } = useCows()

const updateField = (field: keyof CowFormData, value: string) => {
  emit('update:form', { ...props.form, [field]: value })
}
</script>
