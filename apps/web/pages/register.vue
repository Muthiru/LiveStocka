<template>
  <div class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6f2_100%)]">
    <div class="pointer-events-none absolute left-[-5rem] top-[-6rem] h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
    <div class="pointer-events-none absolute bottom-[-5rem] right-[-3rem] h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />

    <div class="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
      <section class="relative hidden overflow-hidden border-r border-white/40 bg-[linear-gradient(160deg,#0b1220_0%,#0f766e_60%,#14b8a6_100%)] px-10 py-12 text-white lg:flex">
        <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-300/15 blur-3xl" />

        <div class="relative flex w-full flex-col justify-between rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/90">
              LiveStocka
            </div>
            <p class="mt-10 max-w-md text-3xl font-extrabold tracking-tight text-white">
              Start with the basics.
            </p>
            <p class="mt-4 max-w-md text-sm leading-6 text-emerald-50/80">
              Create your account and begin tracking cows, treatments, breeding, and milk in one simple place.
            </p>

            <ul class="mt-8 space-y-3 text-sm text-emerald-50/85">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:check" class="h-4 w-4 text-emerald-100" />
                </span>
                <span>Set up in minutes</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:check" class="h-4 w-4 text-emerald-100" />
                </span>
                <span>Works on phone, iPad, and desktop</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:check" class="h-4 w-4 text-emerald-100" />
                </span>
                <span>Secure by default</span>
              </li>
            </ul>
          </div>

          <p class="text-xs text-emerald-50/60">
            You can update your farm data any time.
          </p>
        </div>
      </section>

      <section class="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div class="w-full max-w-xl">
          <div class="mb-8 lg:hidden">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm backdrop-blur">
              LiveStocka
            </div>
            <h1 class="mt-4 text-4xl font-black tracking-tight text-slate-950">Set up LiveStocka for your herd</h1>
            <p class="mt-3 text-sm leading-6 text-slate-600">A focused sign-up flow for teams who manage cows, breeding, milk, and health records.</p>
          </div>

          <div class="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
            <div class="mb-8">
              <p class="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-700">Create access</p>
              <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Create your account</h2>
              <p class="mt-2 max-w-md text-sm leading-6 text-slate-600">Get started with LiveStocka and keep your cattle operations in one place.</p>
            </div>

            <div class="space-y-6">
              <button
                type="button"
                :disabled="loading"
                class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                @click="handleGoogleSignup"
              >
                <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                <Icon v-else name="logos:google-icon" class="mr-3 h-5 w-5" />
                {{ loading ? 'Signing up...' : 'Continue with Google' }}
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-3 text-slate-500">Or sign up with email</span>
                </div>
              </div>

              <form class="space-y-5" @submit.prevent="handleRegister">
                <div class="space-y-4">
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
                        minlength="6"
                        placeholder="At least 6 characters"
                        autocomplete="new-password"
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
                    <p class="mt-2 text-xs text-slate-500">Password must be at least 6 characters.</p>
                    <p v-if="errors.password" class="mt-2 text-xs font-medium text-red-600">
                      {{ errors.password }}
                    </p>
                  </div>
                </div>

                <div class="flex items-start rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <input
                    id="terms"
                    type="checkbox"
                    class="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  >
                  <label for="terms" class="ml-3 block text-sm leading-6 text-slate-700">
                    I agree to the <a href="#" class="font-medium text-emerald-700 transition hover:text-emerald-600">Terms of Service</a> and <a href="#" class="font-medium text-emerald-700 transition hover:text-emerald-600">Privacy Policy</a>.
                  </label>
                </div>

                <button
                  type="submit"
                  class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                  {{ loading ? 'Creating account...' : 'Create account' }}
                </button>
              </form>

              <div class="pt-2 text-center">
                <p class="text-sm text-slate-600">
                  Already have an account?
                  <NuxtLink to="/login" class="font-semibold text-emerald-700 transition hover:text-emerald-600">Sign in</NuxtLink>
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
import { registerSchema } from '~/utils/schemas'

definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const toast = useAppToast()
const { loading, signUpWithPassword, signInWithOAuth } = useAuth()
const errors = ref<{ email?: string; password?: string }>({})

const handleRegister = async () => {
  const validation = validateSchema(registerSchema, { email: email.value, password: password.value })
  errors.value = validation.errors
  if (!validation.valid) return

  const { success, error } = await signUpWithPassword(email.value, password.value)

  if (!success) {
    toast.error(error)
    return
  }

  // Keep UX consistent with email confirmation flow
  toast.success('Check your email for the confirmation link!')
  await navigateTo('/login')
}

const handleGoogleSignup = async () => {
  const { success, error } = await signInWithOAuth('google')

  if (!success) {
    toast.error(error)
  }
}
</script>
