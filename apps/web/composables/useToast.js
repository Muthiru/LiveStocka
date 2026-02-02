export const useToast = () => {
  const toasts = useState('toasts', () => [])

  const add = ({ title, message, type = 'success', duration = 3000 }) => {
    const id = Date.now().toString() + Math.random().toString()
    toasts.value.push({ id, title, message, type, duration })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const remove = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message) => {
    add({ title: 'Success', message, type: 'success' })
  }

  const error = (message) => {
    add({ title: 'Error', message, type: 'error' })
  }

  const info = (message) => {
    add({ title: 'Info', message, type: 'info' })
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    info
  }
}
