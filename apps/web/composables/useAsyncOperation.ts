import { ref } from 'vue'
import type { Ref } from 'vue'

interface AsyncOperationOptions {
  showToast?: boolean
  errorMessage?: string
  onError?: (error: Error) => void
}

interface AsyncOperationResult<T> {
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: () => Promise<T | null>
}

/**
 * Shared composable for handling async operations with loading state and error handling
 * Reduces duplicate error handling patterns across composables
 */
export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> => {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)

  const execute = async (): Promise<T | null> => {
    loading.value = true
    error.value = null
    try {
      return await operation()
    } catch (e: unknown) {
      let message: string
      if (e instanceof Error) {
        message = e.message
      } else if (typeof e === 'string') {
        message = e
      } else {
        message = JSON.stringify(e)
      }
      const errorObj = new Error(message)
      error.value = message
      console.error(options.errorMessage || 'Operation failed:', message)
      
      if (options.showToast) {
        const toast = useAppToast()
        toast.error(message)
      }
      
      options.onError?.(errorObj)
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, execute }
}

/**
 * Get error message from unknown error type
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return JSON.stringify(err)
}

/**
 * Require authenticated user - throws if not authenticated
 */
export const useRequireAuth = () => {
  const { $supabase } = useNuxtApp()

  const requireUser = async (): Promise<{ id: string; email: string }> => {
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    return { id: user.id, email: user.email || '' }
  }

  const getUserId = async (): Promise<string> => {
    const user = await requireUser()
    return user.id
  }

  return { requireUser, getUserId }
}
