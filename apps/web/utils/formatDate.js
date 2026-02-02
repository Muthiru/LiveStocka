export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A'
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const getRelativeDate = (date) => {
  if (!date) return 'N/A'
  const now = new Date()
  const recordDate = new Date(date)
  const diffTime = Math.abs(now - recordDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
