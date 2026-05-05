<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon name="lucide:loader-circle" class="h-7 w-7 animate-spin" />
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-950">Signing you in</h1>
      <p class="mt-2 text-sm leading-6 text-slate-600">Finishing authentication and sending you to your dashboard.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()

const getSafeTarget = (value: unknown): string => {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/dashboard'
  return value
}

onMounted(async () => {
  const { $supabase } = useNuxtApp()
  const next = getSafeTarget(route.query.next)

  try {
    const { data: { session }, error } = await $supabase.auth.getSession()

    if (error) {
      console.error('Auth callback error:', error)
      await navigateTo('/login', { replace: true })
      return
    }

    if (!session) {
      await navigateTo('/login', { replace: true })
      return
    }

    await navigateTo(next, { replace: true })
  } catch (error) {
    console.error('Auth callback catch:', error)
    await navigateTo('/login', { replace: true })
  }
})
</script>