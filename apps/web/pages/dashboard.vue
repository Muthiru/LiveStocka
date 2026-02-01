<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-sm text-gray-600">Overview of your cattle management</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Cows</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ cowsCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/cows" class="font-medium text-indigo-700 hover:text-indigo-900">View all →</NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Cows</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ activeCowsCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm text-gray-500">Healthy and active</div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Health Alerts</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ healthAlertsCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/health" class="font-medium text-indigo-700 hover:text-indigo-900">View alerts →</NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Milk Production</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ totalMilkProduction }}L</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/milk-production" class="font-medium text-indigo-700 hover:text-indigo-900">View details →</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-2 gap-4">
              <NuxtLink
                to="/add-cow"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Cow
              </NuxtLink>
              <NuxtLink
                to="/cows"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Cows
              </NuxtLink>
              <NuxtLink
                to="/health"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Health Records
              </NuxtLink>
              <NuxtLink
                to="/reproduction"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reproduction
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Cows</h3>
          </div>
          <div class="p-5">
            <div v-if="loading" class="text-center py-4">
              <p class="text-sm text-gray-500">Loading...</p>
            </div>
            <div v-else-if="recentCows.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-500">No cows added yet.</p>
              <NuxtLink
                to="/add-cow"
                class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Your First Cow
              </NuxtLink>
            </div>
            <ul v-else class="divide-y divide-gray-200">
              <li v-for="cow in recentCows" :key="cow.id" class="py-3">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-600">{{ cow.name.charAt(0) }}</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ cow.name }}</p>
                    <p class="text-sm text-gray-500">{{ cow.breed }} • Tag: {{ cow.tag_id }}</p>
                  </div>
                  <div>
                    <NuxtLink
                      :to="`/cow/${cow.id}`"
                      class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View →
                    </NuxtLink>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Upcoming Events & Alerts</h3>
        </div>
        <div class="p-5">
          <div v-if="upcomingEvents.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">No upcoming events</p>
          </div>
          <ul v-else class="divide-y divide-gray-200">
            <li v-for="event in upcomingEvents" :key="event.id" class="py-3">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div :class="getEventIconClass(event.type)" class="h-8 w-8 rounded-full flex items-center justify-center">
                    <svg class="h-5 w-5" :class="getEventIconColor(event.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                  <p class="text-sm text-gray-500">{{ event.description }}</p>
                </div>
                <div class="text-sm text-gray-500">{{ formatDate(event.date) }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '~/utils/formatDate.js'

const { $supabase } = useNuxtApp()
const cowsCount = ref(0)
const activeCowsCount = ref(0)
const healthAlertsCount = ref(0)
const totalMilkProduction = ref(0)
const recentCows = ref([])
const upcomingEvents = ref([])
const loading = ref(true)

const getEventIconClass = (type) => {
  const classes = {
    vaccination: 'bg-yellow-100',
    calving: 'bg-green-100',
    checkup: 'bg-blue-100',
    medication: 'bg-red-100'
  }
  return classes[type] || 'bg-gray-100'
}

const getEventIconColor = (type) => {
  const colors = {
    vaccination: 'text-yellow-600',
    calving: 'text-green-600',
    checkup: 'text-blue-600',
    medication: 'text-red-600'
  }
  return colors[type] || 'text-gray-600'
}

onMounted(async () => {
  // Fetch total cows count
  const { count: totalCount } = await $supabase
    .from('cows')
    .select('*', { count: 'exact', head: true })
  cowsCount.value = totalCount || 0

  // Fetch active cows count
  const { count: activeCount } = await $supabase
    .from('cows')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  activeCowsCount.value = activeCount || 0

  // Fetch recent cows for display
  const { data: cows } = await $supabase
    .from('cows')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  recentCows.value = cows || []

  // Fetch health records for alerts (records from last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: healthCount } = await $supabase
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
  healthAlertsCount.value = healthCount || 0

  // Milk production tracking will be implemented in Phase 2
  // Requires milk_production table with columns: cow_id, production_date, quantity_liters
  totalMilkProduction.value = 0

  // Mock upcoming events (replace with actual reproduction/health tracking data)
  upcomingEvents.value = []

  loading.value = false
})
</script>
