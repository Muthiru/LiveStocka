<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
      <section class="hidden bg-white lg:flex lg:flex-col lg:justify-center lg:border-r lg:border-slate-200 lg:px-12 lg:py-12">
        <div class="mx-auto w-full max-w-lg">
          <div class="text-center">
            <h1 class="text-6xl font-bold tracking-tight text-slate-900">LiveStocka</h1>
            <p class="mt-4 text-base text-slate-600">Comprehensive cattle tracking &amp; management</p>
          </div>

          <div class="mt-14 grid gap-4">
            <div class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
                <Icon name="lucide:heart-pulse" class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-base font-semibold text-slate-900">Health records</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Log treatments, checkups, and alerts in seconds.</p>
              </div>
            </div>

            <div class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-600/10 text-sky-700">
                <Icon name="lucide:milk" class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-base font-semibold text-slate-900">Milk production</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Track yields and see trends over time.</p>
              </div>
            </div>

            <div class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-700">
                <Icon name="lucide:repeat-2" class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <p class="text-base font-semibold text-slate-900">Breeding</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Keep heat cycles and pregnancy checks organized.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div class="w-full max-w-xl">
          <div class="mb-8 lg:hidden">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm backdrop-blur">
              LiveStocka
            </div>
            <h1 class="mt-4 text-4xl font-black tracking-tight text-slate-950">Comprehensive cattle tracking &amp; management</h1>
            <p class="mt-3 text-sm leading-6 text-slate-600">Login takes you straight to cows, breeding, milk production, and health tracking.</p>
          </div>

          <div class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
            <div class="mb-8">
              <p class="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700">Secure access</p>
              <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Sign in to LiveStocka</h2>
              <p class="mt-2 max-w-md text-sm leading-6 text-slate-600">Welcome back. Open the tools you use for herd records, breeding, milk, and health checks.</p>
            </div>

            <div class="space-y-6">
              <button
                type="button"
                :disabled="loading"
                class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                @click="handleGoogleLogin"
              >
                <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                <Icon v-else name="logos:google-icon" class="mr-3 h-5 w-5" />
                {{ loading ? 'Signing in...' : 'Continue with Google' }}
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-3 text-slate-500">Or continue with email</span>
                </div>
              </div>

              <form class="space-y-4" @submit.prevent="handleLogin">
                <div>
                  <label for="email" class="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autocomplete="email"
                    :aria-invalid="Boolean(errors.email)"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-950 placeholder-slate-400 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    @input="errors.email = undefined"
                  >
                  <p v-if="errors.email" class="mt-2 text-xs font-medium text-red-600">
                    {{ errors.email }}
                  </p>
                </div>

                <div>
                  <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="Enter your password"
                      autocomplete="current-password"
                      :aria-invalid="Boolean(errors.password)"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 pr-12 text-slate-950 placeholder-slate-400 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      @input="errors.password = undefined"
                    >
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-slate-500 transition hover:text-slate-700"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                      @click="showPassword = !showPassword"
                    >
                      <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-5 w-5" />
                    </button>
                  </div>
                  <p v-if="errors.password" class="mt-2 text-xs font-medium text-red-600">
                    {{ errors.password }}
                  </p>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                    <span class="text-sm text-slate-700">Remember me</span>
                  </label>
                  <a href="#" class="text-sm font-medium text-emerald-700 transition hover:text-emerald-600">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                  {{ loading ? 'Signing in...' : 'Sign in' }}
                </button>
              </form>

              <div class="pt-2 text-center">
                <p class="text-sm text-slate-600">
                  Don't have an account?
                  <NuxtLink to="/register" class="font-semibold text-emerald-700 transition hover:text-emerald-600">Sign up</NuxtLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { validateSchema } from '~/utils/schemaValidation'
import { loginSchema } from '~/utils/schemas'

definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const toast = useAppToast()
const { loading, signInWithPassword, signInWithOAuth } = useAuth()
const errors = ref<{ email?: string; password?: string }>({})

const handleLogin = async () => {
  const validation = validateSchema(loginSchema, { email: email.value, password: password.value })
  errors.value = validation.errors
  if (!validation.valid) return

  const { success, error } = await signInWithPassword(email.value, password.value)

  if (success) {
    toast.success('Signed in successfully')
  } else if (error) {
    toast.error(error)
  }
}

const handleGoogleLogin = async () => {
  const { success, error } = await signInWithOAuth('google')

  if (!success && error) {
    toast.error(error)
  }
}
</script>
