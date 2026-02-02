<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80 max-w-full pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="bg-white rounded-lg shadow-lg border-l-4 pointer-events-auto p-4 flex items-start"
        :class="[
          toast.type === 'success' ? 'border-green-500' : 
          toast.type === 'error' ? 'border-red-500' : 
          'border-blue-500'
        ]"
      >
        <div class="flex-shrink-0 mr-3">
          <Icon v-if="toast.type === 'success'" name="lucide:check-circle" class="w-6 h-6 text-green-500" />
          <Icon v-else-if="toast.type === 'error'" name="lucide:alert-circle" class="w-6 h-6 text-red-500" />
          <Icon v-else name="lucide:info" class="w-6 h-6 text-blue-500" />
        </div>
        <div class="flex-1 w-0">
          <p v-if="toast.title" class="text-sm font-medium text-gray-900">
            {{ toast.title }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ toast.message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none" @click="remove(toast.id)">
            <span class="sr-only">Close</span>
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, remove } = useToast()
</script>
