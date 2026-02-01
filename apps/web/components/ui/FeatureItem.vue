<template>
  <div class="flex items-center gap-4 w-full">
    <div 
      class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
      :class="iconBgClass"
    >
      <svg v-if="icon === 'health'" class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="icon === 'milk'" class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <svg v-else-if="icon === 'reproduction'" class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
    <p class="text-gray-800 text-left text-lg font-medium">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true,
    validator: (value) => ['health', 'milk', 'reproduction'].includes(value)
  },
  text: {
    type: String,
    required: true
  }
})

const iconBgClass = computed(() => {
  const classes = {
    health: 'bg-green-100',
    milk: 'bg-blue-100',
    reproduction: 'bg-purple-100'
  }
  return classes[props.icon]
})

const iconColorClass = computed(() => {
  const classes = {
    health: 'text-green-600',
    milk: 'text-blue-600',
    reproduction: 'text-purple-600'
  }
  return classes[props.icon]
})
</script>