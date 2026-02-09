<template>
  <div class="min-h-screen flex flex-row">
    <!-- Left side - Brand & Features  -->
    <div class="w-1/2 flex items-center justify-center px-8 py-12 bg-white border-r-2 border-black">
      <div class="flex flex-col justify-center items-center w-full max-w-lg">
        <div class="text-center w-full">
          <!-- Brand -->
          <h1 class="text-6xl font-bold text-gray-900 mb-4">LiveStocka</h1>
          <p class="text-lg text-gray-600 mb-16">Comprehensive Cattle Tracking & Management</p>

          <!-- Features -->
          <div class="space-y-8 mb-16 flex flex-col items-start">
            <!-- Health Feature -->
            <div class="flex items-center gap-4 w-full">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-gray-800 text-left text-lg font-medium">Track your cattle health records</p>
            </div>

            <!-- Milk Feature -->
            <div class="flex items-center gap-4 w-full">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p class="text-gray-800 text-left text-lg font-medium">Monitor milk production</p>
            </div>

            <!-- Breeding Feature -->
            <div class="flex items-center gap-4 w-full">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p class="text-gray-800 text-left text-lg font-medium">Manage breeding cycles</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form  -->
    <div class="w-1/2 flex items-center justify-center px-8 py-12 bg-white">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <h2 class="text-3xl font-extrabold text-gray-900">Sign in to LiveStocka</h2>
          <p class="mt-2 text-sm text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        <div class="space-y-6">
          <!-- Google Sign In Button -->
          <button
            type="button"
            :disabled="loading"
            class="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 disabled:opacity-50"
            @click="handleGoogleLogin"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"/>
            <Icon v-else name="logos:google-icon" class="h-5 w-5 mr-3" />
            {{ loading ? 'Signing in...' : 'Continue with Google' }}
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"/>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <!-- Email/Password Form -->
          <form class="space-y-4" @submit.prevent="handleLogin">
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
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
            </div>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" class="rounded" >
                <span class="text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex items-center justify-center px-4 py-3 text-base font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"/>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <!-- Sign Up Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <NuxtLink to="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</NuxtLink>
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

// Local state for form fields
const email = ref('')
const password = ref('')

const toast = useToast()
// Centralised auth logic (Supabase + redirects) lives in useAuth
const { loading, signInWithPassword, signInWithOAuth } = useAuth()

const handleLogin = async () => {
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
