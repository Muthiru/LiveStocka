import { ref, readonly } from 'vue'
import type { Ref } from 'vue'
import type { ToastMessage } from '~/types'

let toastIdCounter = 0

// Global shared state - defined outside the composable
const toasts: Ref<ToastMessage[]> = ref([])

export const useToast = () => {
  const addToast = (message: string, type: ToastMessage['type'], timeout: number = 5000): void => {
    const id = `toast-${++toastIdCounter}`
    
    const toast: ToastMessage = {
      id,
      message,
      type,
      timeout
    }

    toasts.value.push(toast)

    // Auto remove toast after timeout
    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
  }

  const success = (message: string, timeout?: number): void => {
    addToast(message, 'success', timeout)
  }

  const error = (message: string, timeout?: number): void => {
    addToast(message, 'error', timeout)
  }

  const warning = (message: string, timeout?: number): void => {
    addToast(message, 'warning', timeout)
  }

  const info = (message: string, timeout?: number): void => {
    addToast(message, 'info', timeout)
  }

  const remove = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = (): void => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}