<template>
  <div class="py-6">
    <!-- Add/Edit Health Record Modal (opened by Quick Report) -->
    <HealthRecordModal
      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cows"
      :preselected-cow-id="preselectedCowId"
      @save="handleSave"
    />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-2 text-sm text-gray-600">Overview of your cattle management</p>
        </div>

    <!-- Add/Edit Health Record Modal (opened by Quick Report) -->
    <HealthRecordModal
      v-model="showAddModal"
      :record="selectedRecord"
      :cows="cows"
      :preselected-cow-id="preselectedCowId"
      @save="handleSave"
    />
        <div class="flex items-center gap-3">
          <button class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow hover:bg-green-700" @click="showAddModal = true">
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Quick Report
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow-sm rounded-xl relative">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-gray-50 px-5 py-3 rounded-b-xl">
            <div class="text-sm">
              <NuxtLink to="/cows" class="font-medium text-gray-700 hover:text-gray-900">View all →</NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-xl relative">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-gray-50 px-5 py-3 rounded-b-xl">
            <div class="text-sm text-gray-500">Healthy and Productive</div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-xl relative">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-gray-50 px-5 py-3 rounded-b-xl">
            <div class="text-sm">
              <NuxtLink to="/health-records" class="font-medium text-gray-700 hover:text-gray-900">View alerts →</NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-xl relative">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="bg-gray-50 px-5 py-3 rounded-b-xl">
            <div class="text-sm">
              <NuxtLink to="/milk-production" class="font-medium text-gray-700 hover:text-gray-900">View details →</NuxtLink>
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
                to="/milk-production"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Milk Production
              </NuxtLink>
              <NuxtLink
                to="/health-records"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Health Records
              </NuxtLink>
              <NuxtLink
                to="/breeding"
                class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Breeding
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Today's Herd Production Summary -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Today's Herd Production</h3>
            <span class="text-xs text-gray-500">Auto-updated</span>
          </div>
          <div class="p-5">
            <div v-if="loadingProduction" class="text-center py-4">
              <p class="text-sm text-gray-500">Loading production data...</p>
            </div>
            <div v-else-if="todayProduction.totalCows === 0" class="text-center py-4">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No milk production recorded today.</p>
              <NuxtLink
                to="/milk-production"
                class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Record Production
              </NuxtLink>
            </div>
            <div v-else class="space-y-4">
              <!-- Summary Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-lg p-3 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ todayProduction.totalYield }}L</p>
                  <p class="text-xs text-green-600">Total Yield</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 text-center">
                  <p class="text-2xl font-bold text-blue-700">{{ todayProduction.totalCows }} / {{ activeCowsCount }}</p>
                  <p class="text-xs text-blue-600">Cows Milked</p>
                </div>
              </div>
              
              <!-- Session Breakdown -->
              <div class="border-t border-gray-100 pt-3">
                <p class="text-xs font-medium text-gray-500 uppercase mb-2">By Session</p>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="bg-amber-50 rounded p-2">
                    <p class="text-sm font-semibold text-amber-700">{{ todayProduction.morning }}L</p>
                    <p class="text-xs text-amber-600">Morning</p>
                  </div>
                  <div class="bg-yellow-50 rounded p-2">
                    <p class="text-sm font-semibold text-yellow-700">{{ todayProduction.midday }}L</p>
                    <p class="text-xs text-yellow-600">Midday</p>
                  </div>
                  <div class="bg-orange-50 rounded p-2">
                    <p class="text-sm font-semibold text-orange-700">{{ todayProduction.evening }}L</p>
                    <p class="text-xs text-orange-600">Evening</p>
                  </div>
                </div>
              </div>
              
              <!-- Average -->
              <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span class="text-sm text-gray-600">Avg per cow:</span>
                <span class="text-sm font-semibold text-gray-900">{{ todayProduction.avgPerCow }}L</span>
              </div>
              
              <NuxtLink
                to="/milk-production"
                class="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Full Details →
              </NuxtLink>
            </div>
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
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-500">{{ formatDate(event.date) }}</span>
                  <button
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    title="Mark as completed"
                    @click="markEventComplete(event)"
                  >
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $supabase } = useNuxtApp()
const { cows, fetchCows, isMilkable } = useCows()
const toast = useToast()

const cowsCount = ref(0)
const activeCowsCount = ref(0)
const healthAlertsCount = ref(0)
const totalMilkProduction = ref(0)
const upcomingEvents = ref([])
const loading = ref(true)
const loadingProduction = ref(true)

// Add Health Record modal state (Quick Report)
const showAddModal = ref(false)
const selectedRecord = ref(null)
const preselectedCowId = ref(null)

// Today's production data
const todayProduction = ref({
  totalYield: 0,
  totalCows: 0,
  morning: 0,
  midday: 0,
  evening: 0,
  avgPerCow: 0
})



const getEventIconClass = (type) => {
  const classes = {
    vaccination: 'bg-yellow-100',
    calving: 'bg-green-100',
    checkup: 'bg-blue-100',
    medication: 'bg-red-100',
    overdue: 'bg-red-100',
    due_today: 'bg-orange-100',
    due_tomorrow: 'bg-yellow-100'
  }
  return classes[type] || 'bg-gray-100'
}

const getEventIconColor = (type) => {
  const colors = {
    vaccination: 'text-yellow-600',
    calving: 'text-green-600',
    checkup: 'text-blue-600',
    medication: 'text-red-600',
    overdue: 'text-red-600',
    due_today: 'text-orange-600',
    due_tomorrow: 'text-yellow-600'
  }
  return colors[type] || 'text-gray-600'
}

// Mark an event as complete
async function markEventComplete(event) {
  // Extract the actual record ID (remove the suffix like '-due-overdue', '-checkup-today', etc.)
  const recordId = event.id.replace(/-due-.*$/, '').replace(/-checkup-.*$/, '')
  
  // Determine which date field to clear based on event ID
  const isCheckup = event.id.includes('-checkup-')
  
  // Record completion timestamp and clear the due date
  const completedAt = new Date().toISOString()
  const updateData = isCheckup 
    ? { 
        next_checkup_date: null,
        is_completed: true,
        completed_at: completedAt
      }
    : { 
        next_due_date: null,
        is_completed: true,
        completed_at: completedAt
      }
  
  try {
    const { error } = await $supabase
      .from('health_records')
      .update(updateData)
      .eq('id', recordId)
    
    if (error) throw error
    
    // Remove from local state immediately
    upcomingEvents.value = upcomingEvents.value.filter(e => e.id !== event.id)
    
    // Update health alerts count
    healthAlertsCount.value = upcomingEvents.value.filter(e => e.type === 'overdue' || e.type === 'due_today').length
    
    toast.success(`"${event.title}" marked as complete!`)
  } catch (err) {
    console.error('Failed to mark event complete:', err)
    toast.error('Failed to mark event as complete. Please try again.')
  }
}

// Fetch health alerts for upcoming checkups and vaccinations
async function fetchHealthAlerts() {
  const events = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const twoDaysFromNow = new Date(today)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  // Fetch health records with next_due_date or next_checkup_date
  const { data: healthRecords } = await $supabase
    .from('health_records')
    .select(`
      id,
      title,
      record_type,
      next_due_date,
      next_checkup_date,
      cow_id,
      cows (name, tag_id)
    `)
    .or('next_due_date.not.is.null,next_checkup_date.not.is.null')

  if (healthRecords) {
    healthRecords.forEach(record => {
      const cowName = record.cows?.name || 'Unknown'
      const cowTag = record.cows?.tag_id || ''
      
      // Check next_due_date (vaccinations, medications)
      if (record.next_due_date) {
        const dueDate = new Date(record.next_due_date)
        dueDate.setHours(0, 0, 0, 0)
        
        if (dueDate < today) {
          // Overdue
          events.push({
            id: `${record.id}-due-overdue`,
            type: 'overdue',
            title: `OVERDUE: ${record.title}`,
            description: `${cowName} (${cowTag}) - ${record.record_type}`,
            date: record.next_due_date,
            priority: 1
          })
        } else if (dueDate.getTime() === today.getTime()) {
          // Due today
          events.push({
            id: `${record.id}-due-today`,
            type: 'due_today',
            title: `Due Today: ${record.title}`,
            description: `${cowName} (${cowTag}) - ${record.record_type}`,
            date: record.next_due_date,
            priority: 2
          })
        } else if (dueDate.getTime() === tomorrow.getTime()) {
          // Due tomorrow (24 hours notice)
          events.push({
            id: `${record.id}-due-tomorrow`,
            type: 'due_tomorrow',
            title: `Due Tomorrow: ${record.title}`,
            description: `${cowName} (${cowTag}) - Prepare for ${record.record_type}`,
            date: record.next_due_date,
            priority: 3
          })
        }
      }
      
      // Check next_checkup_date
      if (record.next_checkup_date) {
        const checkupDate = new Date(record.next_checkup_date)
        checkupDate.setHours(0, 0, 0, 0)
        
        if (checkupDate < today) {
          // Overdue checkup
          events.push({
            id: `${record.id}-checkup-overdue`,
            type: 'overdue',
            title: `OVERDUE Checkup: ${record.title}`,
            description: `${cowName} (${cowTag}) - Follow-up required`,
            date: record.next_checkup_date,
            priority: 1
          })
        } else if (checkupDate.getTime() === today.getTime()) {
          // Checkup today
          events.push({
            id: `${record.id}-checkup-today`,
            type: 'due_today',
            title: `Checkup Today: ${record.title}`,
            description: `${cowName} (${cowTag}) - Scheduled follow-up`,
            date: record.next_checkup_date,
            priority: 2
          })
        } else if (checkupDate.getTime() === tomorrow.getTime()) {
          // Checkup tomorrow (24 hours notice)
          events.push({
            id: `${record.id}-checkup-tomorrow`,
            type: 'due_tomorrow',
            title: `Checkup Tomorrow: ${record.title}`,
            description: `${cowName} (${cowTag}) - Prepare for follow-up`,
            date: record.next_checkup_date,
            priority: 3
          })
        }
      }
    })
  }

  // Sort by priority (overdue first, then today, then tomorrow)
  events.sort((a, b) => a.priority - b.priority)
  
  return events
}

// Fetch today's herd production summary
async function fetchTodayProduction() {
  loadingProduction.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data: milkData } = await $supabase
      .from('milk_production')
      .select('morning_yield, midday_yield, evening_yield, total_yield')
      .eq('production_date', today)
    
    if (milkData && milkData.length > 0) {
      const morning = milkData.reduce((sum, r) => sum + Number.parseFloat(r.morning_yield || 0), 0)
      const midday = milkData.reduce((sum, r) => sum + Number.parseFloat(r.midday_yield || 0), 0)
      const evening = milkData.reduce((sum, r) => sum + Number.parseFloat(r.evening_yield || 0), 0)
      const total = milkData.reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      const cowCount = milkData.length
      
      todayProduction.value = {
        totalYield: total.toFixed(1),
        totalCows: cowCount,
        morning: morning.toFixed(1),
        midday: midday.toFixed(1),
        evening: evening.toFixed(1),
        avgPerCow: cowCount > 0 ? (total / cowCount).toFixed(1) : '0'
      }
    }
  } catch (e) {
    console.error('Error fetching production:', e)
  } finally {
    loadingProduction.value = false
  }
}

onMounted(async () => {
  // Fetch total cows count
  const { count: totalCount } = await $supabase
    .from('cows')
    .select('*', { count: 'exact', head: true })
  cowsCount.value = totalCount || 0

  // Fetch active cows count (milkable cows - excludes bulls, calves, and dry)
  const { data: allCowsData } = await $supabase
    .from('cows')
    .select('status')
  
  if (allCowsData) {
    activeCowsCount.value = allCowsData.filter(cow => isMilkable(cow.status)).length
  }

  // Fetch health alerts (overdue, due today, due tomorrow)
  upcomingEvents.value = await fetchHealthAlerts()
  healthAlertsCount.value = upcomingEvents.value.filter(e => e.type === 'overdue' || e.type === 'due_today').length

  // Fetch today's milk production summary
  await fetchTodayProduction()
  
  // Set total for stat card
  totalMilkProduction.value = todayProduction.value.totalYield

  // Ensure cows are loaded for modal select
  try {
    await fetchCows()
  } catch (e) {
    console.error('Failed to fetch cows for Quick Report modal:', e)
    if (toast && toast.error) toast.error('Could not load cows for Quick Report')
  }

  loading.value = false
})

// handler for modal save (top-level so template can call it)
const handleSave = async () => {
  showAddModal.value = false
  selectedRecord.value = null
  preselectedCowId.value = null
  try { await fetchTodayProduction() } catch (e) { console.error('Failed to refresh production after save:', e); if (toast && toast.error) toast.error('Failed to refresh production data') }
}
</script>
