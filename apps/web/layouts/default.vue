<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <NuxtLink to="/dashboard" class="text-2xl font-bold text-gray-900 hover:text-gray-700">
              LiveStocka
            </NuxtLink>
          </div>
          <nav class="mt-5 flex-1 px-2 space-y-1">
            <NuxtLink
              to="/dashboard"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/dashboard') ? 'bg-indigo-100 text-indigo-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/cows"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/cows') ? 'bg-indigo-100 text-indigo-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              My Cows
            </NuxtLink>
            <NuxtLink
              to="/add-cow"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/add-cow') ? 'bg-indigo-100 text-indigo-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Cow
            </NuxtLink>
            <div class="pt-4 mt-4 border-t border-gray-200">
              <p class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Features</p>
              <NuxtLink
                to="/health"
                class="group flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Health Records
              </NuxtLink>
              <NuxtLink
                to="/reproduction"
                class="group flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reproduction
              </NuxtLink>
              <NuxtLink
                to="/milk-production"
                class="group flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Milk Production
              </NuxtLink>
              <NuxtLink
                to="/reports"
                class="group flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </NuxtLink>
            </div>
          </nav>
        </div>
        <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div class="flex items-center w-full">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700">{{ userEmail }}</p>
            </div>
            <button
              class="ml-3 flex-shrink-0 bg-white p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="handleLogout"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar -->
    <div class="md:hidden">
      <div class="bg-white shadow">
        <div class="flex items-center justify-between px-4 py-3">
          <h1 class="text-xl font-bold text-indigo-600">LiveStocka</h1>
          <button class="text-gray-500" @click="mobileMenuOpen = !mobileMenuOpen">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div v-if="mobileMenuOpen" class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink to="/dashboard" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</NuxtLink>
          <NuxtLink to="/cows" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">My Cows</NuxtLink>
          <NuxtLink to="/add-cow" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Add Cow</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="md:pl-64 flex flex-col flex-1">
      <main class="flex-1">
  <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { $supabase } = useNuxtApp()
const route = useRoute()
const userEmail = ref('')
const mobileMenuOpen = ref(false)

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = async () => {
  await $supabase.auth.signOut()
  await navigateTo('/login')
}

onMounted(async () => {
  const { data: { user } } = await $supabase.auth.getUser()
  userEmail.value = user?.email || 'User'
})
</script>
