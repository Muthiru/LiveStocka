import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  const createMissingEnvProxy = (): SupabaseClient<Database> => {
    const missingEnvErrorMessage = 'Supabase is not configured. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_ANON_KEY`) in your deployment environment.'

    const proxyTarget = () => undefined

    const createProxy = (): SupabaseClient<Database> =>
      new Proxy(proxyTarget, {
        get(_target, _property) {
          return createProxy()
        },
        apply() {
          throw new Error(missingEnvErrorMessage)
        },
        construct(): object {
          throw new Error(missingEnvErrorMessage)
        }
      }) as unknown as SupabaseClient<Database>

    return createProxy()
  }

  const supabase =
    supabaseUrl && supabaseAnonKey
      ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
      : createMissingEnvProxy()

  return {
    provide: {
      supabase
    }
  }
})
