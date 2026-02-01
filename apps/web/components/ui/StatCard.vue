<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div 
            class="h-12 w-12 rounded-full flex items-center justify-center"
            :class="iconBgClass"
          >
            <component 
              :is="iconComponent" 
              class="h-6 w-6" 
              :class="iconColorClass"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                :d="iconPath"
              />
            </component>
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="text-2xl font-semibold text-gray-900">{{ value }}</dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="footer" class="bg-gray-50 px-5 py-3">
      <slot name="footer">
        <div class="text-sm" :class="footerLinkClass">
          {{ footer }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconPath: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'indigo',
    validator: (value) => ['indigo', 'green', 'yellow', 'blue', 'red'].includes(value)
  },
  footer: {
    type: String,
    default: ''
  },
  footerLink: {
    type: Boolean,
    default: false
  }
})

const iconComponent = 'svg'

const colorClasses = {
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' }
}

const iconBgClass = computed(() => colorClasses[props.color].bg)
const iconColorClass = computed(() => colorClasses[props.color].text)
const footerLinkClass = computed(() => 
  props.footerLink ? 'font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer' : 'text-gray-500'
)
</script>
