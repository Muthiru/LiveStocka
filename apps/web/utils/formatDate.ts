type DateFormatOptions = Intl.DateTimeFormatOptions

type DateInput = string | Date | null | undefined

type AgeParts = {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
} | null

export const formatDate = (date: DateInput, options: DateFormatOptions = {}): string => {
  if (!date) return 'N/A'
  
  const defaultOptions: DateFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const getRelativeDate = (date: DateInput): string => {
  if (!date) return 'N/A'
  
  const now = new Date()
  const recordDate = new Date(date)
  const diffTime = Math.abs(now.getTime() - recordDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export const formatDateTime = (date: DateInput): string => {
  if (!date) return 'N/A'
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (date: DateInput): string => {
  if (!date) return 'N/A'
  
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getAgeParts = (birth: DateInput): AgeParts => {
  if (!birth) return null
  const b = new Date(birth)
  const now = new Date()
  const diff = now.getTime() - b.getTime()
  if (Number.isNaN(b.getTime()) || diff < 0) return null

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  return { years, months, days, hours, minutes, seconds }
}

export const isToday = (date: string | Date): boolean => {
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}