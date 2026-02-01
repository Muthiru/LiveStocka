<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Health Records</h1>
        <p class="mt-2 text-sm text-gray-600">View and manage health records across all your cattle</p>
      </div>

      <div class="bg-white shadow rounded-lg">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">All Health Records</h3>
        </div>
        <div class="p-5">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Health Records Overview</h3>
            <p class="mt-1 text-sm text-gray-500">This page will show all health records across your herd.</p>
            <div class="mt-6">
              <NuxtLink
                to="/cows"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Cows
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
