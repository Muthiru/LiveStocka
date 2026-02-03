import type { Ref } from 'vue'

/**
 * Status color mappings for consistent styling across the application
 */
export const statusColors = {
  cow: {
    active: 'bg-green-100 text-green-800',
    pregnant: 'bg-purple-100 text-purple-800',
    dry: 'bg-yellow-100 text-yellow-800',
    calf: 'bg-blue-100 text-blue-800',
    bull: 'bg-indigo-100 text-indigo-800',
    sold: 'bg-orange-100 text-orange-800',
    deceased: 'bg-red-100 text-red-800'
  },
  healthRecord: {
    vaccination: 'bg-blue-100 text-blue-800',
    medication: 'bg-purple-100 text-purple-800',
    disease: 'bg-red-100 text-red-800',
    treatment: 'bg-yellow-100 text-yellow-800',
    checkup: 'bg-green-100 text-green-800',
    injury: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800'
  },
  recovery: {
    recovering: 'text-yellow-600',
    recovered: 'text-green-600',
    ongoing: 'text-blue-600',
    critical: 'text-red-600'
  }
} as const

type StatusType = keyof typeof statusColors
export type CowStatus = keyof typeof statusColors.cow
export type HealthRecordStatus = keyof typeof statusColors.healthRecord
export type RecoveryStatus = keyof typeof statusColors.recovery

/**
 * Get color class for a given status type and value
 */
export const getStatusColor = (type: StatusType, status: string): string => {
  const colorMap = statusColors[type]
  return (colorMap as Record<string, string>)[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

/**
 * Get cow status color
 */
export const getCowStatusColor = (status: string): string => {
  return getStatusColor('cow', status)
}

/**
 * Get health record type color
 */
export const getHealthRecordTypeColor = (type: string): string => {
  return getStatusColor('healthRecord', type)
}

/**
 * Get icon for health record type
 */
export const getHealthRecordTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    vaccination: 'lucide:syringe',
    medication: 'lucide:pill',
    disease: 'lucide:alert-circle',
    treatment: 'lucide:stethoscope',
    checkup: 'lucide:clipboard-check',
    injury: 'lucide:bandage',
    other: 'lucide:file-text'
  }
  return icons[type?.toLowerCase()] || icons.other
}

/**
 * Format record type for display
 */
export const formatRecordType = (type: string): string => {
  if (!type) return ''
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Check if a date is overdue (before today)
 */
export const isOverdue = (date: string | Date): boolean => {
  return new Date(date) < new Date()
}

/**
 * Get recovery status color
 */
export const getRecoveryStatusColor = (status: string): string => {
  return getStatusColor('recovery', status)
}

/**
 * Update array state for CRUD operations
 */
export const updateArrayState = <T extends { id: string }>(
  array: Ref<T[]>,
  operation: 'add' | 'update' | 'delete',
  item: T
): void => {
  if (operation === 'add') {
    array.value = [item, ...array.value]
  } else if (operation === 'update') {
    const idx = array.value.findIndex(x => x.id === item.id)
    if (idx !== -1) {
      array.value = [...array.value.slice(0, idx), item, ...array.value.slice(idx + 1)]
    }
  } else if (operation === 'delete') {
    array.value = array.value.filter(x => x.id !== item.id)
  }
}

// Note: isOverdue and isToday are available from formatDate.ts