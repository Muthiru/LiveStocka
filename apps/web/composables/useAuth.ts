import { ref } from 'vue'
import type { Ref } from 'vue'
import { getErrorMessage } from '~/composables/useAsyncOperation'

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
    const normalizeOrigin = (value: string): string => {
      const trimmed = value.trim().replace(/\/+$/, '')
      try {
        return new URL(trimmed).origin
      } catch {
        return trimmed
      }
    }

    if (import.meta.client) {
      // In the browser, prefer the current origin (prevents env/config drift on hosting providers).
      const currentOrigin = normalizeOrigin(globalThis.location.origin)
      const configured = typeof config.public.appUrl === 'string' ? config.public.appUrl.trim() : ''
      const configuredOrigin = configured ? normalizeOrigin(configured) : ''

      // In local dev, always prefer the configured app URL when present.
      // This prevents OAuth from redirecting to an unexpected origin (for example when you open
      // the dev server via a LAN IP, or when Supabase "Site URL" is set to production).
      if (import.meta.dev && configuredOrigin) {
        return configuredOrigin
      }

      return currentOrigin
    }

    const configured = typeof config.public.appUrl === 'string' ? config.public.appUrl.trim() : ''
    return configured ? normalizeOrigin(configured) : ''
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
      let redirectTo = `${getAppUrl()}/auth/callback?next=/dashboard`
      // Safety net for local dev: never bounce users into production during OAuth.
      // If local env vars are misconfigured (or not loaded), force localhost.
      if (import.meta.dev && /livestocka\.vercel\.app/i.test(redirectTo)) {
        redirectTo = 'http://localhost:3000/auth/callback?next=/dashboard'
        console.warn('[auth] OAuth redirectTo was production; forced localhost for dev:', redirectTo)
      }
      const { error: authError } = await $supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
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
