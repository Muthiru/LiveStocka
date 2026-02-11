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

  let remaining = Math.floor(diff / 1000)

  const totalDays = Math.floor(remaining / 86400)
  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const days = (totalDays % 365) % 30

  remaining = remaining % 86400
  const hours = Math.floor(remaining / 3600)
  remaining = remaining % 3600
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

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

export const formatRelativeStatus = (dateString: string | null): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Reset time parts for comparison
  date.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
  if (date < today) return 'Overdue'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatTimeOnly = (d: DateInput, t?: string): string => {
  if (!d) return ''
  try {
    const datePart = new Date(d)
    if (t) {
      const [hours = '00', minutes = '00'] = String(t).split(':')
      datePart.setHours(Number(hours), Number(minutes))
    }
    return datePart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch (e) {
    console.error('formatTimeOnly error', e)
    return ''
  }
}

export const formatDateOnly = (d: DateInput, t?: string): string => {
  if (!d) return 'N/A'
  try {
    const datePart = new Date(d)
    if (t) {
      const [hours = '00', minutes = '00'] = String(t).split(':')
      datePart.setHours(Number(hours), Number(minutes))
    }
    const day = String(datePart.getDate()).padStart(2, '0')
    const month = String(datePart.getMonth() + 1).padStart(2, '0')
    const year = datePart.getFullYear()
    return `${day}/${month}/${year}`
  } catch (e) {
    console.error('formatDateOnly error', e)
    return formatDate(d)
  }
}