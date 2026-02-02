<template>
  <div>
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: undefined
  },
  max: {
    type: [String, Number],
    default: undefined
  },
  step: {
    type: [String, Number],
    default: undefined
  }
})

defineEmits(['update:modelValue'])

const inputClasses = computed(() => {
  const baseClasses = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition'
  const stateClasses = props.error 
    ? 'border-red-300 focus:ring-red-500' 
    : 'border-gray-300 focus:ring-indigo-500'
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
  
  return `${baseClasses} ${stateClasses} ${disabledClasses}`
})
</script>
