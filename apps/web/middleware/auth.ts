export default defineNuxtRouteMiddleware(async (_to) => {
  // Skip middleware on server-side rendering
  if (import.meta.server) return
  
  const { $supabase } = useNuxtApp()
  
  try {
    const { data: { session }, error } = await $supabase.auth.getSession()
    
    if (error) {
      console.error('Auth middleware error:', error)
      return navigateTo('/login')
    }
    
    if (!session) {
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('Auth middleware catch:', error)
    return navigateTo('/login')
  }
})