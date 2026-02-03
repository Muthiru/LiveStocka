<template>
  <div class="min-h-screen flex">
    <!-- Left side - Simple white -->
    <div class="hidden lg:flex lg:w-1/2 bg-white border-r border-gray-200">
      <div class="flex flex-col justify-center items-center px-12 w-full">
        <div class="text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">LiveStocka</h1>
          <p class="text-xl text-gray-600">Start managing your cattle today</p>
        </div>
      </div>
    </div>

    <!-- Right side - Register Form -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="w-full max-w-md space-y-8">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p class="mt-2 text-sm text-gray-600">Get started with LiveStocka today.</p>
        </div>

        <div class="space-y-6">
          <!-- Google Sign Up Button -->
          <button
            type="button"
            :disabled="loading"
            class="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:opacity-50"
            @click="handleGoogleSignup"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"/>
            <Icon v-else name="logos:google-icon" class="h-5 w-5 mr-3" />
            {{ loading ? 'Signing up...' : 'Continue with Google' }}
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"/>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <!-- Email/Password Form -->
          <form class="space-y-6" @submit.prevent="handleRegister">
            <div class="space-y-4">
              <!-- Email Input -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
              </div>

              <!-- Password Input -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="6"
                  placeholder="At least 6 characters"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                <p class="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
              </div>
            </div>

            <!-- Terms Checkbox -->
            <div class="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                class="h-4 w-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              >
              <label for="terms" class="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" class="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"/>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <!-- Sign In Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">Sign in</NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const toast = useToast()
const { loading, signUpWithPassword, signInWithOAuth } = useAuth()

const email = ref('')
const password = ref('')

const handleRegister = async () => {
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
