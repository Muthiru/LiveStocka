<template>
  <div
    class="fixed inset-x-4 top-4 z-50 flex w-auto flex-col gap-3 pointer-events-none sm:inset-x-auto sm:right-4 sm:w-96"
    aria-live="polite"
    aria-relevant="additions text"
  >
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
        class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg shadow-slate-950/10 backdrop-blur"
        :class="typeClasses[toast.type]"
        role="status"
      >
        <div class="flex-shrink-0 pt-0.5">
          <Icon v-if="toast.type === 'success'" name="lucide:check-circle" class="h-5 w-5 text-emerald-600" />
          <Icon v-else-if="toast.type === 'error'" name="lucide:alert-circle" class="h-5 w-5 text-rose-600" />
          <Icon v-else-if="toast.type === 'warning'" name="lucide:alert-triangle" class="h-5 w-5 text-amber-600" />
          <Icon v-else name="lucide:info" class="h-5 w-5 text-sky-600" />
        </div>
        <div class="min-w-0 flex-1">
          <p v-if="toast.title" class="text-sm font-semibold text-slate-900">
            {{ toast.title }}
          </p>
          <p class="mt-0.5 text-sm leading-5 text-slate-600">
            {{ toast.message }}
          </p>
          <div v-if="toast.action" class="mt-3">
            <button
              type="button"
              class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              @click="() => { toast.action?.onClick(); remove(toast.id) }"
            >
              {{ toast.action.label }}
            </button>
          </div>
        </div>
        <button
          v-if="toast.dismissible !== false"
          type="button"
          class="ml-1 inline-flex flex-shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          @click="remove(toast.id)"
        >
          <span class="sr-only">Close</span>
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, remove } = useAppToast()

const typeClasses = {
  success: 'border-emerald-200',
  error: 'border-rose-200',
  warning: 'border-amber-200',
  info: 'border-sky-200'
}
</script>
