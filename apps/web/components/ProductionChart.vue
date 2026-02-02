<template>
  <div class="relative w-full">
    <canvas ref="chartCanvas"/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
Chart.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'bar'
  }
})

const chartCanvas = ref(null)
let chartInstance = null

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: props.type,
      data: props.data,
      options: props.options
    })
  }
})

watch(() => props.data, (newData) => {
  if (chartInstance) {
    chartInstance.data = newData
    chartInstance.update()
  }
}, { deep: true })
</script>
