import { ref } from 'vue'
import type { Ref } from 'vue'

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return JSON.stringify(err)
}

interface AuthResponse {
  success: boolean
  error?: string
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const getAppUrl = (): string => {
    const appUrl = config.public.appUrl
    if (typeof appUrl === 'string' && appUrl.trim()) return appUrl
    return import.meta.client ? globalThis.location.origin : ''
  }

  const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      await navigateTo('/dashboard')
      return { success: true }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const signUpWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError
      
      // (e.g. show "check your email" message, stay on page, or redirect)
      return { success: true }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'apple' = 'google'): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getAppUrl()}/auth/callback?next=/dashboard`
        }
      })
      if (authError) throw authError
      return { success: true }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      error.value = message
      loading.value = false
      return { success: false, error: message }
    }
  }

  const signOut = async (): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signOut()
      if (authError) throw authError
      await navigateTo('/login')
      return { success: true }
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    signOut
  }
}