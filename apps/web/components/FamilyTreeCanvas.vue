<template>
  <div class="family-tree-container overflow-auto border rounded-lg bg-slate-50 relative" style="height: 600px;">


    <div v-if="loading" class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"/>
    </div>
    
    <div v-else-if="error" class="flex justify-center items-center h-full text-red-500">
      {{ error }}
    </div>

    <svg v-else ref="svgRef" :width="width" :height="height" class="min-w-full">
      <!-- Defines for Filters/Gradients -->
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <linearGradient id="maleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#eff6ff" />
          <stop offset="100%" style="stop-color:#dbeafe" />
        </linearGradient>

        <linearGradient id="femaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fff1f2" />
          <stop offset="100%" style="stop-color:#ffe4e6" />
        </linearGradient>
      </defs>

      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <!-- Connecting Lines -->
        <path 
          v-for="(link, i) in links" 
          :key="`link-${i}`" 
          :d="linkPath(link)" 
          class="stroke-slate-300 fill-none transition-all duration-500" 
          stroke-width="2.5" 
          stroke-linecap="round"
        />
        
        <!-- Nodes -->
        <g 
          v-for="node in nodes" 
          :key="node.data.id" 
          :transform="`translate(${node.y}, ${node.x})`"
          class="cursor-pointer transition-all duration-300"
          @click="$emit('node-click', node.data)"
        >
          <!-- Node Card Shadow/Glow -->
          <rect 
            v-if="selectedId === node.data.id"
            :x="-2" 
            :y="-nodeHeight / 2 - 2" 
            :width="nodeWidth + 4" 
            :height="nodeHeight + 4" 
            rx="10" 
            filter="url(#glow)"
            class="fill-indigo-200 opacity-50"
          />

          <!-- Node Card Body -->
          <rect 
            :x="0" 
            :y="-nodeHeight / 2" 
            :width="nodeWidth" 
            :height="nodeHeight" 
            rx="10" 
            class="transition-all duration-200"
            :class="[
              selectedId === node.data.id ? 'stroke-indigo-600 stroke-[3px]' : 'stroke-gray-200 hover:stroke-indigo-400 stroke-[1.5px]'
            ]"
            :fill="node.data.gender === 'female' ? 'url(#femaleGradient)' : 'url(#maleGradient)'"
          />
          
          <!-- Text Labels -->
          <text 
            :x="margin.left / 2" 
            :y="-3" 
            class="text-[14px] font-bold pointer-events-none fill-slate-800 tracking-tight"
          >
            {{ truncate(node.data.name, 12) }}
          </text>
           <text 
            :x="margin.left / 2" 
            :y="14" 
            class="text-[11px] pointer-events-none fill-slate-500 font-medium tracking-wide"
          >
            #{{ node.data.tag_id }}
          </text>

          <!-- Gender Indicator Badge (Small dot) -->
          <circle 
            :cx="nodeWidth - 12" 
            :cy="0" 
            r="3.5" 
            :class="node.data.gender === 'female' ? 'fill-pink-400' : 'fill-blue-400'"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { hierarchy, tree } from 'd3-hierarchy'
import type { Ancestor, Cow } from '../types' // Updated path
import { useGeneticsService } from '../composables/useGeneticsService'
import { useCows } from '../composables/useCows'

import type { HierarchyPointNode, HierarchyPointLink } from 'd3-hierarchy'

const props = defineProps<{
  cowId: string
  selectedId?: string
  depth?: number
}>()

defineEmits<(e: 'node-click', node: { id: string; name: string; tag_id: string; gender: 'male' | 'female' }) => void>()

const { fetchAncestors, loading, error } = useGeneticsService()
const { getCowById } = useCows()

// Config
const nodeWidth = 160
const nodeHeight = 60
const margin = { top: 40, left: 40, bottom: 40, right: 40 }
const levelWidth = 240 // space between generations

const width = ref(1200)
const height = ref(800)

// Define specific interface for D3 node data to avoid 'any'
interface D3NodeData {
  id: string
  name: string
  tag_id: string
  gender: 'male' | 'female'
}

// ... existing code ...

const nodes = ref<HierarchyPointNode<D3NodeData>[]>([])
const links = ref<HierarchyPointLink<D3NodeData>[]>([])

// Recursive type for building tree
interface TreeNode {
  id: string
  name: string
  tag_id: string
  gender: 'male' | 'female'
  children?: TreeNode[]
}

const buildTreeData = async (rootId: string, ancestors: Ancestor[]): Promise<TreeNode | null> => {
    // 1. Fetch full cow data for valid ancestors including root
    // To minimize requests, we might implement a bulk fetch. 
    // For now, let's fetch individually or rely on cache if useCows has one, 
    // but ideally we need the name/tag for display.
    // The Ancestor object only has id/relation.
    
    // Helper to get cached or fetched details
    const cowDetails = new Map<string, Cow>()
    
    const getDetails = async (id: string) => {
        if (cowDetails.has(id)) return cowDetails.get(id)
        const c = await getCowById(id)
        if (c) cowDetails.set(id, c)
        return c
    }

    const rootCow = await getDetails(rootId)
    if (!rootCow) return null

    // Map children to parents
    // ancestors array has { id, relation, child_id }
    // We want to go Root -> Parents -> Grandparents (Left to Right expansion)
    // D3 Tree expects Root -> Children.
    // To display Ancestry (Left=Root, Right=Ancestors), we can interpret "children" in D3 logic as "parents" in biological logic.
    
    const parentMap = new Map<string, Ancestor[]>()
    ancestors.forEach(a => {
        if (!parentMap.has(a.child_id)) parentMap.set(a.child_id, [])
        parentMap.get(a.child_id)?.push(a)
    })

    const genderMap = new Map<string, 'male' | 'female'>()
    ancestors.forEach(a => {
      // If a is a sire, its ID is male
      if (a.relation === 'sire') genderMap.set(a.id, 'male')
      if (a.relation === 'dam') genderMap.set(a.id, 'female')
    })

    const buildNode = async (id: string): Promise<TreeNode> => {
        const details = await getDetails(id)
        
        let gender: 'male' | 'female' = 'female' // Default
        
        // 1. Check strict relation map
        if (genderMap.has(id)) {
           gender = genderMap.get(id)!
        } else if (details) {
           // 2. Check status or explicit gender if available
           if (details.status === 'bull') gender = 'male'
           // Check if tag_id or name implies male (common for bulls)
           if (details.name?.toLowerCase().includes('bull') || details.tag_id?.toLowerCase().includes('bull')) {
             gender = 'male'
           }
        }

        const node: TreeNode = {
            id,
            name: details?.name || 'Unknown',
            tag_id: details?.tag_id || '?',
            gender, 
            children: []
        }

        const parents = parentMap.get(id) || []
        
        // Sort: Sire (top), Dam (bottom) or vice versa
        // Standard Pedigree: Sire top, Dam bottom
        const sire = parents.find(p => p.relation === 'sire')
        const dam = parents.find(p => p.relation === 'dam')

        if (sire) node.children?.push(await buildNode(sire.id))
        if (dam) node.children?.push(await buildNode(dam.id))
        
        return node
    }

    return await buildNode(rootId)
}

const refreshTree = async () => {
  if (!props.cowId) return
  
  const d = props.depth || 3
  const ancestors = await fetchAncestors(props.cowId, d) // Depth 3-4 fits screen
  const rootData = await buildTreeData(props.cowId, ancestors)
  
  if (!rootData) return

  // Layout with D3
  // Size based on depth
  const root = hierarchy<TreeNode>(rootData)
  
  // Calculate dynamic height
  const leaves = root.leaves().length
  height.value = Math.max(600, leaves * (nodeHeight + 20))
  width.value = Math.max(1000, root.height * levelWidth + 400)

  const treeLayout = tree<TreeNode>().size([height.value - margin.top - margin.bottom, width.value - margin.right])
  
  const treeData = treeLayout(root)
  
  // Cast to specific D3 types via unknown to satisfy linter
  nodes.value = treeData.descendants() as unknown as HierarchyPointNode<D3NodeData>[]
  links.value = treeData.links() as unknown as HierarchyPointLink<D3NodeData>[]
}

// Path generator for curved links (horizontal)
const linkPath = (link: HierarchyPointLink<D3NodeData>) => {
  return `
    M${link.source.y + nodeWidth},${link.source.x}
    C${link.source.y + nodeWidth + levelWidth / 2},${link.source.x}
     ${link.target.y - levelWidth / 2},${link.target.x}
     ${link.target.y},${link.target.x}
  `
}

const truncate = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

watch(() => props.cowId, refreshTree)

onMounted(() => {
  refreshTree()
})
</script>

<style scoped>
/* No specific styles */
</style>
