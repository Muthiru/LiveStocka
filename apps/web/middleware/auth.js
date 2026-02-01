export default defineNuxtRouteMiddleware(async (to) => {
  const { $supabase } = useNuxtApp()
  
  const { data: { user } } = await $supabase.auth.getUser()
  
  if (!user && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
  
  if (user && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})