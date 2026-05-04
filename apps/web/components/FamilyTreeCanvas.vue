<template>
  <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-base font-semibold text-slate-900">Family Tree</h3>
      <p v-if="loading" class="text-xs font-medium text-slate-500">Loading…</p>
    </div>

    <div class="relative h-96 overflow-auto rounded-xl bg-slate-50">
      <canvas ref="canvasRef" class="h-full w-full" />
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
      <div v-if="error" class="absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded-lg bg-white px-3 py-2 text-sm text-red-700 shadow ring-1 ring-red-200">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ cowId: string; depth?: number }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const depth = computed(() => props.depth || 4)

const ancestors = ref<Ancestor[]>([])
const descendants = ref<Descendant[]>([])

const genetics = useGeneticsService()
const loading = computed(() => genetics.loading.value)
const error = computed(() => genetics.error.value)

interface Ancestor { id: string; relation: string; depth: number }
interface Descendant { id: string; via: string; depth: number }

const drawTree = (ancestors: Ancestor[], descendants: Descendant[]) => {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  // clear
  ctx.clearRect(0,0,c.width,c.height)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0,0,c.width,c.height)

  ctx.fillStyle = '#111827'
  ctx.font = '12px sans-serif'
  ctx.fillText('Ancestors (left) / Descendants (right)', 10, 20)

  ancestors.slice(0,10).forEach((a: Ancestor, i) => {
    ctx.fillText(`${a.relation} ${a.id}`, 10, 40 + i * 18)
  })
  descendants.slice(0,10).forEach((d: Descendant, i) => {
    ctx.fillText(`${d.via} ${d.id}`, (c.width || 800) - 200, 40 + i * 18)
  })
}

const ensureCanvasSize = async () => {
  await nextTick()
  const c = canvasRef.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  c.width = Math.max(800, Math.floor(rect.width))
  c.height = Math.max(400, Math.floor(rect.height))
}

const loadTree = async () => {
  if (!props.cowId) return
  await ensureCanvasSize()
  ancestors.value = await genetics.fetchAncestors(props.cowId, depth.value)
  descendants.value = await genetics.fetchDescendants(props.cowId, depth.value)
  drawTree(ancestors.value, descendants.value)
}

onMounted(() => {
  loadTree()
})

watch(() => [props.cowId, depth.value], () => {
  loadTree()
})
</script>
