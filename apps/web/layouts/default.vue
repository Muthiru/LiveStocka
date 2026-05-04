<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div class="flex min-h-0 flex-1 flex-col border-r border-slate-200 bg-white">
        <div class="flex-1 overflow-y-auto px-4 py-5">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="text-2xl font-bold tracking-tight text-slate-900 hover:text-slate-700">
              LiveStocka
            </NuxtLink>
          </div>

          <nav class="mt-6 space-y-1" aria-label="Primary navigation">
            <NuxtLink
              v-for="item in primaryNav"
              :key="item.to"
              :to="item.to"
              class="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              :class="isActive(item.to) ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            >
              <Icon :name="item.icon" class="mr-3 h-5 w-5" />
              {{ item.label }}
            </NuxtLink>

            <div class="pt-4 mt-4 border-t border-slate-200">
              <p class="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Features</p>
              <NuxtLink
                v-for="item in featureNav"
                :key="item.to"
                :to="item.to"
                class="group mt-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                :class="isActive(item.to) ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
              >
                <Icon :name="item.icon" class="mr-3 h-5 w-5" />
                {{ item.label }}
              </NuxtLink>
            </div>
          </nav>
        </div>

        <div class="flex-shrink-0 border-t border-slate-200 p-4">
          <div class="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-800">{{ userEmail }}</p>
              <p class="text-xs text-slate-500">Signed in</p>
            </div>
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              @click="handleLogout"
            >
              <Icon name="lucide:log-out" class="h-5 w-5" />
              <span class="sr-only">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex min-h-screen flex-col lg:pl-72">
      <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div class="flex items-center justify-between px-4 py-3">
          <NuxtLink to="/dashboard" class="text-xl font-bold tracking-tight text-slate-900">
            LiveStocka
          </NuxtLink>
          <UDropdownMenu
            v-model:open="mobileMenuOpen"
            :items="mobileMenuItems"
            :content="{ side: 'bottom', align: 'end', sideOffset: 8 }"
            :ui="mobileMenuUi"
            arrow
            class="lg:hidden"
          >
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="ghost"
              square
              size="md"
              :aria-expanded="mobileMenuOpen"
              :aria-label="mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
              aria-haspopup="menu"
            />

            <template #content-top="{ sub }">
              <div v-if="!sub" class="border-b border-slate-200/70 px-3 py-2.5">
                <p class="truncate text-sm font-semibold text-slate-900">
                  {{ userEmail || 'User' }}
                </p>
                <p class="text-xs text-slate-500">Signed in</p>
              </div>
            </template>
          </UDropdownMenu>
        </div>
      </header>

      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const { $supabase } = useNuxtApp()
const route = useRoute()

const userEmail = ref('')
const mobileMenuOpen = ref(false)
const mobileMenuUi = {
  content: 'w-72 rounded-2xl bg-white/95 backdrop-blur p-1 shadow-xl ring-1 ring-slate-200/70',
  group: 'py-1',
  item: 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900',
  itemLeadingIcon: 'h-4 w-4 text-slate-500',
  itemLabel: 'truncate font-medium',
  separator: 'mx-2 my-1 h-px bg-slate-200/70',
  label: 'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400'
} as const

const primaryNav = [
  { label: 'Dashboard', to: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'My Cows', to: '/cows', icon: 'lucide:clipboard-list' },
  { label: 'Add Cow', to: '/add-cow', icon: 'lucide:square-plus' }
]

const featureNav = [
  { label: 'Family Tree', to: '/family-tree', icon: 'lucide:git-branch' },
  { label: 'Health Records', to: '/health-records', icon: 'lucide:heart-pulse' },
  { label: 'Reproduction', to: '/breeding', icon: 'lucide:repeat-2' },
  { label: 'Milk Production', to: '/milk-production', icon: 'lucide:milk' },
  { label: 'Reports', to: '/reports', icon: 'lucide:chart-column' }
]

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const handleLogout = async () => {
  mobileMenuOpen.value = false
  await $supabase.auth.signOut()
  await navigateTo('/login')
}

const toUiIcon = (icon: string): string | undefined => {
  if (!icon) return undefined
  if (icon.startsWith('i-')) return icon
  if (icon.startsWith('lucide:')) return `i-lucide-${icon.slice('lucide:'.length)}`
  return icon
}

const mobileMenuItems = computed(() => {
  const go = (to: string) => async () => {
    mobileMenuOpen.value = false
    await navigateTo(to)
  }

  const withLogoutClass = <T extends Record<string, unknown>>(base: T) =>
    ({
      ...base,
      class:
        'text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 focus:text-red-700'
    }) as T & { class: string }

  return [
    [
      { type: 'label', label: 'Navigate' },
      ...primaryNav.map(item => ({
        label: item.label,
        icon: toUiIcon(item.icon),
        onSelect: go(item.to)
      })),
      { type: 'separator' },
      ...featureNav.map(item => ({
        label: item.label,
        icon: toUiIcon(item.icon),
        onSelect: go(item.to)
      })),
      { type: 'separator' },
      withLogoutClass({
        label: 'Logout',
        icon: 'i-lucide-log-out',
        onSelect: handleLogout
      })
    ]
  ]
})

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

onMounted(async () => {
  const { data: { user } } = await $supabase.auth.getUser()
  userEmail.value = user?.email || 'User'
})
</script>
