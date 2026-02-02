export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (import.meta.server) return undefined

  // Allow unauthenticated access to login and register
  const publicPaths = ['/login', '/register']
  if (publicPaths.includes(to.path)) return undefined

  // Check localStorage for Supabase session
  // Supabase stores session with key format: sb-{project-ref}-auth-token
  if (import.meta.client) {
    const hasSession = Object.keys(localStorage).some(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    )
    
    if (!hasSession) {
      return navigateTo('/login')
    }
  }
  
  return undefined
})