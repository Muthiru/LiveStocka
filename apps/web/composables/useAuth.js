import { ref } from 'vue'

export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const loading = ref(false)
  const error = ref(null)

  const signInWithPassword = async (email, password) => {
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
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const signUpWithPassword = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError
      await navigateTo('/dashboard')
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const signInWithOAuth = async (provider = 'google') => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: import.meta.client ? `${globalThis.location.origin}/dashboard` : '/dashboard'
        }
      })
      if (authError) throw authError
      return { success: true }
    } catch (err) {
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await $supabase.auth.signOut()
      if (authError) throw authError
      await navigateTo('/login')
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
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
