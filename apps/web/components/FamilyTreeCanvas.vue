<template>
  <div class="p-4 bg-white rounded shadow">
    <h3 class="text-lg font-medium mb-2">Family Tree</h3>
    <div class="h-96 bg-gray-50 rounded overflow-auto relative">
      <canvas ref="canvasRef" class="w-full h-full" />
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">Loading...</div>
      <div v-if="error" class="absolute top-2 left-2 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const props = defineProps<{ cowId: string, depth?: number }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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

const { data: ancestorsData, pending: _aPending, error: aError } = await useAsyncData('ancestors-' + props.cowId, async () => {
  const base = useRuntimeConfig().public.supabaseUrl
  const depth = props.depth || 4
  const aRes = await $fetch(`${base}/functions/v1/geneticsService/get_ancestors?cow_id=${props.cowId}&depth=${depth}`)
  return (aRes?.ancestors || []) as Ancestor[]
})

const { data: descendantsData, pending: _dPending, error: dError } = await useAsyncData('descendants-' + props.cowId, async () => {
  const base = useRuntimeConfig().public.supabaseUrl
  const depth = props.depth || 4
  const dRes = await $fetch(`${base}/functions/v1/geneticsService/get_descendants?cow_id=${props.cowId}&depth=${depth}`)
  return (dRes?.descendants || []) as Descendant[]
})

onMounted(() => {
  // ensure canvas pixel size matches displayed size
  const c = canvasRef.value
  if (c) {
    const rect = c.getBoundingClientRect()
    c.width = Math.max(800, rect.width)
    c.height = Math.max(400, rect.height)
  }
  const a = ancestorsData.value || []
  const d = descendantsData.value || []
  drawTree(a, d)
})

if (aError.value) error.value = String(aError.value)
if (dError.value) error.value = (error.value ? error.value + '; ' : '') + String(dError.value)
</script>
