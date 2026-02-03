<template>
  <div class="container mx-auto p-4 md:p-6">
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Milk Production Tracking</h1>
        <p class="text-gray-600 text-sm md:text-base">Record and monitor daily milk yields for your herd</p>
      </div>
      <NuxtLink
        to="/bulk-milk-entry"
        class="inline-flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm md:text-base"
      >
        <Icon name="lucide:clipboard-list" class="w-5 h-5 mr-2" />
        Bulk Entry
      </NuxtLink>
    </div>

    <!-- Add New Entry Form -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Record Milk Production</h2>
      
      <form class="space-y-4" @submit.prevent="addProduction">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Cow Selection -->
          <div>
            <label for="cow_id" class="block text-sm font-medium text-gray-700 mb-2">
              Select Cow *
            </label>
            <select
              id="cow_id"
              v-model="formData.cow_id"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a cow</option>
              <option v-for="cow in cows" :key="cow.id" :value="cow.id">
                {{ cow.name }} ({{ cow.tag_id }})
              </option>
            </select>
          </div>

          <!-- Production Date -->
          <div>
            <label for="production_date" class="block text-sm font-medium text-gray-700 mb-2">
              Production Date *
            </label>
            <input
              id="production_date"
              v-model="formData.production_date"
              type="date"
              required
              :max="todayDate"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Morning Yield -->
          <div>
            <label for="morning_yield" class="block text-sm font-medium text-gray-700 mb-2">
              Morning Yield (liters)
            </label>
            <input
              id="morning_yield"
              v-model="formData.morning_yield"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 12.50"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Morning Time -->
          <div>
            <label for="morning_time" class="block text-sm font-medium text-gray-700 mb-2">
              Morning Time
            </label>
            <input
              id="morning_time"
              v-model="formData.morning_time"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Evening Yield -->
          <div>
            <label for="evening_yield" class="block text-sm font-medium text-gray-700 mb-2">
              Evening Yield (liters)
            </label>
            <input
              id="evening_yield"
              v-model="formData.evening_yield"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 11.80"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Evening Time -->
          <div>
            <label for="evening_time" class="block text-sm font-medium text-gray-700 mb-2">
              Evening Time
            </label>
            <input
              id="evening_time"
              v-model="formData.evening_time"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Midday Yield (for 3x daily milking) -->
          <div>
            <label for="midday_yield" class="block text-sm font-medium text-gray-700 mb-2">
              Midday Yield (liters)
              <span class="text-gray-400 font-normal text-xs ml-1">(optional - for 3x milking)</span>
            </label>
            <input
              id="midday_yield"
              v-model="formData.midday_yield"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 8.00"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Midday Time -->
          <div>
            <label for="midday_time" class="block text-sm font-medium text-gray-700 mb-2">
              Midday Time
            </label>
            <input
              id="midday_time"
              v-model="formData.midday_time"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
          </div>

          <!-- Total (Calculated) -->
          <div>
            <span class="block text-sm font-medium text-gray-700 mb-2">
              Total Daily Yield
            </span>
            <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium">
              {{ calculatedTotal }} liters
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            placeholder="Any observations about milk quality, cow health, etc."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-600">{{ success }}</p>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {{ loading ? 'Saving...' : 'Record Production' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Today's Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayTotal }} L</p>
          </div>
          <Icon name="lucide:droplets" class="w-10 h-10 text-gray-600" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">This Week</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.weekTotal }} L</p>
          </div>
          <Icon name="lucide:calendar-days" class="w-10 h-10 text-gray-600" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">This Month</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.monthTotal }} L</p>
          </div>
          <Icon name="lucide:calendar" class="w-10 h-10 text-gray-600" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Avg. per Cow</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.avgPerCow }} L</p>
          </div>
          <Icon name="lucide:trending-up" class="w-10 h-10 text-gray-600" />
        </div>
      </div>
    </div>

    <!-- Daily Totals Summary (All Cows) -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Today's Herd Production Summary</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <Icon name="lucide:sunrise" class="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-1">Morning Total</p>
          <p class="text-xl font-bold text-amber-700">{{ dailyTotals.morning }} L</p>
          <p class="text-xs text-gray-500 mt-1">{{ dailyTotals.morningCount }} cows</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Icon name="lucide:sun" class="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-1">Midday Total</p>
          <p class="text-xl font-bold text-yellow-700">{{ dailyTotals.midday }} L</p>
          <p class="text-xs text-gray-500 mt-1">{{ dailyTotals.middayCount }} cows</p>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <Icon name="lucide:sunset" class="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-1">Evening Total</p>
          <p class="text-xl font-bold text-orange-700">{{ dailyTotals.evening }} L</p>
          <p class="text-xs text-gray-500 mt-1">{{ dailyTotals.eveningCount }} cows</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Icon name="lucide:milk" class="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-1">Grand Total</p>
          <p class="text-xl font-bold text-green-700">{{ dailyTotals.total }} L</p>
          <p class="text-xs text-gray-500 mt-1">All sessions</p>
        </div>
      </div>
    </div>

    <!-- Production Alerts -->
    <div v-if="alerts.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex items-start">
        <Icon name="lucide:alert-triangle" class="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div class="flex-1">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">Production Alerts</h3>
          <ul class="space-y-1">
            <li v-for="alert in alerts" :key="alert.cow_id" class="text-sm text-yellow-700">
              <strong>{{ alert.cow_name }}</strong>: {{ alert.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Edit Production Record</h2>
            <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
              <Icon name="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="updateProduction">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Cow (Read-only) -->
              <div>
                <label for="edit_cow_display" class="block text-sm font-medium text-gray-700 mb-2">
                  Cow
                </label>
                <input
                  id="edit_cow_display"
                  type="text"
                  :value="`${editData.cow_name} (${editData.cow_tag_id})`"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                >
              </div>

              <!-- Date (Read-only) -->
              <div>
                <label for="edit_date_display" class="block text-sm font-medium text-gray-700 mb-2">
                  Production Date
                </label>
                <input
                  id="edit_date_display"
                  type="text"
                  :value="formatDate(editData.production_date)"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                >
              </div>

              <!-- Morning Yield -->
              <div>
                <label for="edit_morning_yield" class="block text-sm font-medium text-gray-700 mb-2">
                  Morning Yield (liters)
                </label>
                <input
                  id="edit_morning_yield"
                  v-model="editData.morning_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 12.50"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Morning Time -->
              <div>
                <label for="edit_morning_time" class="block text-sm font-medium text-gray-700 mb-2">
                  Morning Time
                </label>
                <input
                  id="edit_morning_time"
                  v-model="editData.morning_time"
                  type="time"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Evening Yield -->
              <div>
                <label for="edit_evening_yield" class="block text-sm font-medium text-gray-700 mb-2">
                  Evening Yield (liters)
                </label>
                <input
                  id="edit_evening_yield"
                  v-model="editData.evening_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 11.80"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Evening Time -->
              <div>
                <label for="edit_evening_time" class="block text-sm font-medium text-gray-700 mb-2">
                  Evening Time
                </label>
                <input
                  id="edit_evening_time"
                  v-model="editData.evening_time"
                  type="time"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Midday Yield -->
              <div>
                <label for="edit_midday_yield" class="block text-sm font-medium text-gray-700 mb-2">
                  Midday Yield (liters)
                  <span class="text-gray-400 font-normal text-xs ml-1">(optional)</span>
                </label>
                <input
                  id="edit_midday_yield"
                  v-model="editData.midday_yield"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 8.00"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Midday Time -->
              <div>
                <label for="edit_midday_time" class="block text-sm font-medium text-gray-700 mb-2">
                  Midday Time
                </label>
                <input
                  id="edit_midday_time"
                  v-model="editData.midday_time"
                  type="time"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
              </div>

              <!-- Total (Calculated) -->
              <div>
                <span class="block text-sm font-medium text-gray-700 mb-2">
                  Total Daily Yield
                </span>
                <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium">
                  {{ calculatedEditTotal }} liters
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label for="edit_notes" class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="edit_notes"
                v-model="editData.notes"
                rows="3"
                placeholder="Any observations about milk quality, cow health, etc."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <!-- Modal Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                @click="closeEditModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loadingEdit"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {{ loadingEdit ? 'Updating...' : 'Update Record' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Export Production Data</h2>
            <button class="text-gray-400 hover:text-gray-600" @click="showExportModal = false">
              <Icon name="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="generateExport">
            <!-- Cow Selection -->
            <div>
              <label for="export-cow" class="block text-sm font-medium text-gray-700 mb-2">Select Cow</label>
              <select
                id="export-cow"
                v-model="exportConfig.cowId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cows</option>
                <option v-for="cow in cows" :key="cow.id" :value="cow.id">
                  {{ cow.name }} ({{ cow.tag_id }})
                </option>
              </select>
            </div>

            <!-- Time Period Type -->
            <div>
              <label for="export-period" class="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                id="export-period"
                v-model="exportConfig.periodType"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 365 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <!-- Custom Date Range -->
            <div v-if="exportConfig.periodType === 'custom'" class="grid grid-cols-2 gap-4">
              <div>
                <label for="export-start-date" class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  id="export-start-date"
                  v-model="exportConfig.startDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label for="export-end-date" class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  id="export-end-date"
                  v-model="exportConfig.endDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                @click="showExportModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
              >
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Production History -->
    <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-lg md:text-xl font-semibold">Production History</h2>
        
        <!-- Filters and Export -->
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <button
            v-if="filteredProduction.length > 0"
            class="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-xs sm:text-sm font-medium inline-flex items-center"
            @click="showExportModal = true"
          >
            <Icon name="lucide:download" class="w-4 h-4 mr-1 sm:mr-2" />
            Export
          </button>
          <select
            v-model="filterCow"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          >
            <option value="">All Cows</option>
            <option v-for="cow in cows" :key="cow.id" :value="cow.id">
              {{ cow.name }}
            </option>
          </select>

          <select
            v-model="filterPeriod"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="365">Last 365 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingHistory" class="text-center py-8">
        <p class="text-gray-600">Loading production records...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProduction.length === 0" class="text-center py-8">
        <Icon name="lucide:milk-off" class="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-600">No production records found</p>
        <p class="text-sm text-gray-500 mt-1">Start by adding your first milk production entry above</p>
      </div>

      <!-- Production Table -->
      <div v-else class="overflow-x-auto -mx-4 md:mx-0">
        <table class="w-full min-w-[640px]">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cow</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Morning</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">Midday</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Evening</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
              <th class="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in filteredProduction" :key="record.id" class="hover:bg-gray-50">
              <td class="px-3 md:px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-900">
                {{ formatDate(record.production_date) }}
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap">
                <div class="text-xs md:text-sm font-medium text-gray-900">{{ record.cow_name }}</div>
                <div class="text-xs text-gray-500">{{ record.cow_tag_id }}</div>
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap">
                <div class="text-xs md:text-sm text-gray-900">{{ record.morning_yield || 0 }} L</div>
                <div v-if="record.morning_time" class="text-xs text-gray-500 hidden md:block">{{ record.morning_time }}</div>
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                <div class="text-xs md:text-sm text-gray-900">{{ record.midday_yield || 0 }} L</div>
                <div v-if="record.midday_time && record.midday_yield" class="text-xs text-gray-500 hidden md:block">{{ record.midday_time }}</div>
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap">
                <div class="text-xs md:text-sm text-gray-900">{{ record.evening_yield || 0 }} L</div>
                <div v-if="record.evening_time" class="text-xs text-gray-500 hidden md:block">{{ record.evening_time }}</div>
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap text-xs md:text-sm font-bold text-gray-900">
                {{ record.total_yield }} L
              </td>
              <td class="px-3 md:px-4 py-3 whitespace-nowrap text-xs md:text-sm space-x-1 md:space-x-2">
                <button
                  class="text-gray-700 hover:text-gray-900 font-medium"
                  @click="editRecord(record)"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-800 font-medium"
                  @click="deleteRecord(record.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { $supabase } = useNuxtApp()
const toast = useToast()
const { fetchCows } = useCows()

// Form data
const formData = ref({
  cow_id: '',
  production_date: new Date().toISOString().split('T')[0],
  morning_yield: '',
  morning_time: '06:00',
  midday_yield: '',
  midday_time: '12:00',
  evening_yield: '',
  evening_time: '17:00',
  notes: ''
})

// State
const cows = ref([])
const productionRecords = ref([])
const loading = ref(false)
const loadingHistory = ref(false)
const error = ref('')
const success = ref('')
const filterCow = ref('')
const filterPeriod = ref('30')
const alerts = ref([])

// Expert Modal State
const showExportModal = ref(false)
const exportConfig = ref({
  cowId: '',
  periodType: 'month', // today, week, month, year, custom, all
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

// Edit modal state
const showEditModal = ref(false)
const loadingEdit = ref(false)
const editData = ref({
  id: '',
  cow_id: '',
  cow_name: '',
  cow_tag_id: '',
  production_date: '',
  morning_yield: '',
  morning_time: '06:00',
  midday_yield: '',
  midday_time: '12:00',
  evening_yield: '',
  evening_time: '17:00',
  notes: ''
})

// Stats
const stats = ref({
  todayTotal: 0,
  weekTotal: 0,
  monthTotal: 0,
  avgPerCow: 0
})

// Computed
const todayDate = computed(() => new Date().toISOString().split('T')[0])

const calculatedTotal = computed(() => {
  const morning = Number.parseFloat(formData.value.morning_yield) || 0
  const midday = Number.parseFloat(formData.value.midday_yield) || 0
  const evening = Number.parseFloat(formData.value.evening_yield) || 0
  return (morning + midday + evening).toFixed(2)
})

const calculatedEditTotal = computed(() => {
  const morning = Number.parseFloat(editData.value.morning_yield) || 0
  const midday = Number.parseFloat(editData.value.midday_yield) || 0
  const evening = Number.parseFloat(editData.value.evening_yield) || 0
  return (morning + midday + evening).toFixed(2)
})

const filteredProduction = computed(() => {
  let filtered = productionRecords.value

  // Filter by cow
  if (filterCow.value) {
    filtered = filtered.filter(r => r.cow_id === filterCow.value)
  }

  // Filter by period
  if (filterPeriod.value !== 'all') {
    const days = Number.parseInt(filterPeriod.value)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(r => new Date(r.production_date) >= cutoffDate)
  }

  return filtered
})

// Daily totals for all cows (herd summary)
const dailyTotals = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = productionRecords.value.filter(r => r.production_date === today)
  
  let morningTotal = 0
  let middayTotal = 0
  let eveningTotal = 0
  let morningCount = 0
  let middayCount = 0
  let eveningCount = 0
  
  todayRecords.forEach(record => {
    const morning = Number.parseFloat(record.morning_yield) || 0
    const midday = Number.parseFloat(record.midday_yield) || 0
    const evening = Number.parseFloat(record.evening_yield) || 0
    
    if (morning > 0) {
      morningTotal += morning
      morningCount++
    }
    if (midday > 0) {
      middayTotal += midday
      middayCount++
    }
    if (evening > 0) {
      eveningTotal += evening
      eveningCount++
    }
  })
  
  return {
    morning: morningTotal.toFixed(2),
    midday: middayTotal.toFixed(2),
    evening: eveningTotal.toFixed(2),
    total: (morningTotal + middayTotal + eveningTotal).toFixed(2),
    morningCount,
    middayCount,
    eveningCount
  }
})

// Methods

async function loadProductionRecords() {
  try {
    loadingHistory.value = true
    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) return

    const { data, error: fetchError } = await $supabase
      .from('milk_production')
      .select(`
        id,
        cow_id,
        production_date,
        morning_yield,
        morning_time,
        midday_yield,
        midday_time,
        evening_yield,
        evening_time,
        total_yield,
        quality,
        notes,
        cows (name, tag_id)
      `)
      .eq('farm_id', user.user.id)
      .order('production_date', { ascending: false })

    if (fetchError) throw fetchError

    // Flatten the data
    productionRecords.value = (data || []).map(record => ({
      ...record,
      cow_name: record.cows?.name || 'Unknown',
      cow_tag_id: record.cows?.tag_id || 'N/A',
      morning_time: record.morning_time || null,
      midday_yield: record.midday_yield || 0,
      midday_time: record.midday_time || null,
      evening_time: record.evening_time || null
    }))
  } catch (err) {
    console.error('Error loading production records:', err)
  } finally {
    loadingHistory.value = false
  }
}

async function loadStats() {
  try {
    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) return

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    // Today's total
    const { data: todayData } = await $supabase
      .from('milk_production')
      .select('total_yield')
      .eq('farm_id', user.user.id)
      .eq('production_date', today)

    stats.value.todayTotal = (todayData || [])
      .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      .toFixed(2)

    // This week
    const { data: weekData } = await $supabase
      .from('milk_production')
      .select('total_yield')
      .eq('farm_id', user.user.id)
      .gte('production_date', weekAgo.toISOString().split('T')[0])

    stats.value.weekTotal = (weekData || [])
      .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      .toFixed(2)

    // This month
    const { data: monthData } = await $supabase
      .from('milk_production')
      .select('total_yield')
      .eq('farm_id', user.user.id)
      .gte('production_date', monthAgo.toISOString().split('T')[0])

    stats.value.monthTotal = (monthData || [])
      .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || 0), 0)
      .toFixed(2)

    // Average per cow (last 30 days)
    const activeCowCount = cows.value.length
    if (activeCowCount > 0) {
      stats.value.avgPerCow = (Number.parseFloat(stats.value.monthTotal) / activeCowCount).toFixed(2)
    }

    // Check for alerts
    await checkProductionAlerts()
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

async function checkProductionAlerts() {
  try {
    alerts.value = []
    
    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) return

    // Get last 30 days of production for each cow
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentProduction } = await $supabase
      .from('milk_production')
      .select('cow_id, total_yield, production_date, cows(name)')
      .eq('farm_id', user.user.id)
      .gte('production_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('production_date', { ascending: false })

    if (!recentProduction || recentProduction.length === 0) return

    // Group by cow and calculate averages
    const cowData = {}
    recentProduction.forEach(record => {
      if (!cowData[record.cow_id]) {
        cowData[record.cow_id] = {
          name: record.cows?.name || 'Unknown',
          yields: [],
          recent: []
        }
      }
      const yield_val = Number.parseFloat(record.total_yield) || 0
      cowData[record.cow_id].yields.push(yield_val)
      
      // Last 3 days
      if (cowData[record.cow_id].recent.length < 3) {
        cowData[record.cow_id].recent.push(yield_val)
      }
    })

    // Check for significant drops
    Object.keys(cowData).forEach(cowId => {
      const data = cowData[cowId]
      
      if (data.yields.length < 5) return // Need enough data
      
      // Calculate 30-day average
      const avg = data.yields.reduce((sum, val) => sum + val, 0) / data.yields.length
      
      // Calculate recent average (last 3 days)
      const recentAvg = data.recent.reduce((sum, val) => sum + val, 0) / data.recent.length
      
      // Alert if recent average is 20% or more below overall average
      const dropPercentage = ((avg - recentAvg) / avg) * 100
      
      if (dropPercentage >= 20 && avg > 5) { // Only alert for significant producers
        alerts.value.push({
          cow_id: cowId,
          cow_name: data.name,
          message: `Recent production (${recentAvg.toFixed(1)}L) is ${dropPercentage.toFixed(0)}% below average (${avg.toFixed(1)}L)`
        })
      }
      
      // Alert for very low recent production
      if (recentAvg < 3 && avg > 8) {
        alerts.value.push({
          cow_id: cowId,
          cow_name: data.name,
          message: `Very low recent production (${recentAvg.toFixed(1)}L) - check cow health`
        })
      }
    })
  } catch (err) {
    console.error('Error checking alerts:', err)
  }
}

async function handleProductionUpdate(existingRecord, morningInput, middayInput, eveningInput) {
  const newMorning = (morningInput !== '' && morningInput !== null) 
    ? Number.parseFloat(morningInput) 
    : existingRecord.morning_yield

  const newMidday = (middayInput !== '' && middayInput !== null)
    ? Number.parseFloat(middayInput)
    : existingRecord.midday_yield || 0

  const newEvening = (eveningInput !== '' && eveningInput !== null)
    ? Number.parseFloat(eveningInput)
    : existingRecord.evening_yield

  const { error } = await $supabase
    .from('milk_production')
    .update({
      morning_yield: newMorning,
      midday_yield: newMidday,
      evening_yield: newEvening,
      morning_time: formData.value.morning_time || existingRecord.morning_time,
      midday_time: formData.value.midday_time || existingRecord.midday_time,
      evening_time: formData.value.evening_time || existingRecord.evening_time,
      notes: formData.value.notes ? formData.value.notes : existingRecord.notes
    })
    .eq('id', existingRecord.id)

  if (error) throw error
}

async function handleProductionInsert(user, morningInput, middayInput, eveningInput) {
  const morningYield = morningInput ? Number.parseFloat(morningInput) : 0
  const middayYield = middayInput ? Number.parseFloat(middayInput) : 0
  const eveningYield = eveningInput ? Number.parseFloat(eveningInput) : 0

  const { error } = await $supabase
    .from('milk_production')
    .insert({
      cow_id: formData.value.cow_id,
      farm_id: user.user.id,
      production_date: formData.value.production_date,
      morning_yield: morningYield,
      midday_yield: middayYield,
      evening_yield: eveningYield,
      morning_time: formData.value.morning_time || null,
      midday_time: formData.value.midday_time || null,
      evening_time: formData.value.evening_time || null,
      notes: formData.value.notes || null
    })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Production record already exists for this cow on this date')
    }
    throw error
  }
}

async function addProduction() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const { data: user } = await $supabase.auth.getUser()
    if (!user?.user?.id) {
      error.value = 'User not authenticated'
      return
    }

    // Validate at least one yield value is provided
    const morningInput = formData.value.morning_yield
    const middayInput = formData.value.midday_yield
    const eveningInput = formData.value.evening_yield
    
    // Check if anything was entered
    if ((morningInput === '' || morningInput === null) && 
        (middayInput === '' || middayInput === null) && 
        (eveningInput === '' || eveningInput === null)) {
      error.value = 'Please enter at least one yield value (morning, midday, or evening)'
      return
    }

    // Check for existing record
    const { data: existingRecord } = await $supabase
      .from('milk_production')
      .select('*')
      .eq('cow_id', formData.value.cow_id)
      .eq('production_date', formData.value.production_date)
      .single()

    if (existingRecord) {
      await handleProductionUpdate(existingRecord, morningInput, middayInput, eveningInput)
      success.value = 'Milk production updated successfully!'
      toast.success('Milk production updated successfully!')
    } else {
      try {
        await handleProductionInsert(user, morningInput, middayInput, eveningInput)
        success.value = 'Milk production recorded successfully!'
        toast.success('Milk production recorded successfully!')
      } catch (e) {
        if (e.message === 'Production record already exists for this cow on this date') {
          error.value = e.message
          return
        }
        throw e
      }
    }
    
    // Reset form
    formData.value = {
      cow_id: '',
      production_date: new Date().toISOString().split('T')[0],
      morning_yield: '',
      morning_time: '06:00',
      midday_yield: '',
      midday_time: '12:00',
      evening_yield: '',
      evening_time: '17:00',
      notes: ''
    }

    // Reload data
    await Promise.all([loadProductionRecords(), loadStats()])

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error adding production:', err)
    error.value = 'Failed to record milk production. Please try again.'
    toast.error('Failed to record milk production')
  } finally {
    loading.value = false
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this production record?')) return

  try {
    const { error: deleteError } = await $supabase
      .from('milk_production')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    success.value = 'Production record deleted successfully!'
    toast.success('Production record deleted successfully!')
    await Promise.all([loadProductionRecords(), loadStats()])

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error deleting record:', err)
    error.value = 'Failed to delete record. Please try again.'
    toast.error('Failed to delete record')
  }
}

function generateExport() {
  try {
    let records = productionRecords.value

    // Filter by cow
    if (exportConfig.value.cowId) {
      records = records.filter(r => r.cow_id === exportConfig.value.cowId)
    }

    // Filter by date
    if (exportConfig.value.periodType !== 'all') {
      const today = new Date()
      let startDate = new Date()
      let endDate = new Date()

      switch (exportConfig.value.periodType) {
        case 'today':
          startDate = today
          endDate = today
          break
        case 'week':
          startDate.setDate(today.getDate() - 7)
          break
        case 'month':
          startDate.setDate(today.getDate() - 30)
          break
        case 'year':
          startDate.setDate(today.getDate() - 365)
          break
        case 'custom':
          startDate = new Date(exportConfig.value.startDate)
          endDate = new Date(exportConfig.value.endDate)
          break
      }

      // Reset hours to compare dates only
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      records = records.filter(r => {
        const recordDate = new Date(r.production_date)
        return recordDate >= startDate && recordDate <= endDate
      })
    }

    if (records.length === 0) {
      toast.error('No records found for the selected criteria')
      return
    }

    // Prepare CSV headers
    const headers = ['Date', 'Cow Name', 'Tag ID', 'Morning Yield (L)', 'Morning Time', 'Midday Yield (L)', 'Midday Time', 'Evening Yield (L)', 'Evening Time', 'Total Yield (L)', 'Notes']
    
    // Prepare CSV rows
    const rows = records.map(record => [
      record.production_date,
      record.cow_name,
      record.cow_tag_id,
      record.morning_yield || '0',
      record.morning_time || '',
      record.midday_yield || '0',
      record.midday_time || '',
      record.evening_yield || '0',
      record.evening_time || '',
      record.total_yield,
      record.notes || ''
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    let filename = 'milk-production'
    if (exportConfig.value.cowId) {
      const cow = cows.value.find(c => c.id === exportConfig.value.cowId)
      if (cow) {
        filename += `-${cow.name.replaceAll(/[^a-z0-9]/gi, '_').toLowerCase()}`
      }
    }
    
    // Add date range to filename
    const dateStr = new Date().toISOString().split('T')[0]
    filename += `-${exportConfig.value.periodType}-${dateStr}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast.success(`Exported ${records.length} records successfully!`)
    showExportModal.value = false
  } catch (err) {
    console.error('Error exporting CSV:', err)
    toast.error('Failed to export data')
  }
}

function editRecord(record) {
  editData.value = {
    id: record.id,
    cow_id: record.cow_id,
    cow_name: record.cow_name,
    cow_tag_id: record.cow_tag_id,
    production_date: record.production_date,
    morning_yield: record.morning_yield || '',
    morning_time: record.morning_time || '06:00',
    midday_yield: record.midday_yield || '',
    midday_time: record.midday_time || '12:00',
    evening_yield: record.evening_yield || '',
    evening_time: record.evening_time || '17:00',
    notes: record.notes || ''
  }
  showEditModal.value = true
}

async function updateProduction() {
  try {
    loadingEdit.value = true
    error.value = ''
    success.value = ''

    // Validate at least one yield value is provided
    const morningYield = editData.value.morning_yield ? Number.parseFloat(editData.value.morning_yield) : 0
    const middayYield = editData.value.midday_yield ? Number.parseFloat(editData.value.midday_yield) : 0
    const eveningYield = editData.value.evening_yield ? Number.parseFloat(editData.value.evening_yield) : 0
    
    if (morningYield === 0 && middayYield === 0 && eveningYield === 0) {
      error.value = 'Please enter at least one yield value'
      return
    }

    const { error: updateError } = await $supabase
      .from('milk_production')
      .update({
        morning_yield: morningYield,
        midday_yield: middayYield,
        evening_yield: eveningYield,
        morning_time: editData.value.morning_time || null,
        midday_time: editData.value.midday_time || null,
        evening_time: editData.value.evening_time || null,
        notes: editData.value.notes
      })
      .eq('id', editData.value.id)

    if (updateError) throw updateError

    success.value = 'Production record updated successfully!'
    toast.success('Production record updated successfully!')
    closeEditModal()
    await Promise.all([loadProductionRecords(), loadStats()])

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error updating production:', err)
    error.value = 'Failed to update production record. Please try again.'
    toast.error('Failed to update production record')
  } finally {
    loadingEdit.value = false
  }
}

function closeEditModal() {
  showEditModal.value = false
  editData.value = {
    id: '',
    cow_id: '',
    cow_name: '',
    cow_tag_id: '',
    production_date: '',
    morning_yield: '',
    morning_time: '06:00',
    midday_yield: '',
    midday_time: '12:00',
    evening_yield: '',
    evening_time: '17:00',
    notes: ''
  }
}



// Lifecycle
onMounted(async () => {
  // Load active cows for dropdown
  cows.value = await fetchCows({ status: 'active', orderBy: 'name' })
  await loadProductionRecords()
  await loadStats()
})
</script>
