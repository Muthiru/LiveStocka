import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  const createMissingEnvProxy = () =>
    new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase is not configured. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_ANON_KEY`) in your deployment environment.'
          )
        }
      }
    )

  const supabase =
    supabaseUrl && supabaseAnonKey
      ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
      : (createMissingEnvProxy() as SupabaseClient<Database>)

  return {
    provide: {
      supabase
    }
  }
})
