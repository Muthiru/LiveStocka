import { ref, readonly } from 'vue'
import type { Ref } from 'vue'
import type { ToastMessage } from '~/types'

let toastIdCounter = 0
const MAX_TOASTS = 3
const DEDUPE_WINDOW_MS = 1500

const defaultTimeoutByType: Record<ToastMessage['type'], number> = {
  success: 4000,
  info: 4500,
  warning: 6500,
  error: 8000
}

// Global shared state - defined outside the composable
const toasts: Ref<ToastMessage[]> = ref([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export const useAppToast = () => {
  const remove = (id: string): void => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }

  const addToast = (
    message: string,
    type: ToastMessage['type'],
    options?: {
      title?: string
      timeout?: number
      dismissible?: boolean
      action?: ToastMessage['action']
    }
  ): void => {
    const id = `toast-${++toastIdCounter}`

    const now = Date.now()
    const last = toasts.value[toasts.value.length - 1]
    if (last && last.type === type && last.message === message && last.createdAt && now - last.createdAt < DEDUPE_WINDOW_MS) {
      return
    }

    const toast: ToastMessage = {
      id,
      title: options?.title,
      message,
      type,
      timeout: options?.timeout ?? defaultTimeoutByType[type],
      createdAt: now,
      dismissible: options?.dismissible ?? true,
      action: options?.action
    }

    toasts.value.push(toast)

    while (toasts.value.length > MAX_TOASTS) {
      const oldest = toasts.value[0]
      if (oldest) remove(oldest.id)
      else break
    }

    const timeout = toast.timeout ?? 0
    if (timeout > 0) {
      const timer = setTimeout(() => remove(id), timeout)
      timers.set(id, timer)
    }
  }

  const success = (message: string, options?: Parameters<typeof addToast>[2]): void => {
    addToast(message, 'success', options)
  }

  const error = (message: string, options?: Parameters<typeof addToast>[2]): void => {
    addToast(message, 'error', options)
  }

  const warning = (message: string, options?: Parameters<typeof addToast>[2]): void => {
    addToast(message, 'warning', options)
  }

  const info = (message: string, options?: Parameters<typeof addToast>[2]): void => {
    addToast(message, 'info', options)
  }

  const clear = (): void => {
    for (const id of timers.keys()) {
      const timer = timers.get(id)
      if (timer) clearTimeout(timer)
    }
    timers.clear()
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    addToast,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}
