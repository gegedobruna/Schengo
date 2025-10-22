<template>
  <div class="w-full">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
      <p class="text-sm text-gray-600">
        Rolling 180-day window ending on {{ formatDate(refDate) }}
      </p>
    </div>
    
    <div class="relative overflow-x-auto">
      <svg 
        :width="timelineWidth" 
        :height="timelineHeight" 
        class="border border-gray-200 rounded-lg bg-white"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- Month ticks -->
        <g v-for="(tick, index) in monthTicks" :key="index">
          <line 
            :x1="tick.x" 
            :y1="0" 
            :x2="tick.x" 
            :y2="timelineHeight" 
            stroke="#e5e7eb" 
            stroke-width="1"
          />
          <text 
            :x="tick.x" 
            :y="15" 
            text-anchor="middle" 
            class="text-xs fill-gray-500"
          >
            {{ tick.label }}
          </text>
        </g>
        
        <!-- 180-day window background -->
        <rect 
          :x="windowStartX" 
          :y="20" 
          :width="windowWidth" 
          :height="timelineHeight - 40" 
          fill="#dbeafe" 
          opacity="0.3"
        />
        
        <!-- Stay bars -->
        <g v-for="(stay, index) in normalizedStays" :key="`stay-${index}`">
          <rect 
            :x="getStayX(stay.entry)" 
            :y="25" 
            :width="getStayWidth(stay.entry, stay.exit)" 
            :height="20" 
            :fill="getStayColor(stay)"
            stroke="#374151"
            stroke-width="1"
            class="cursor-pointer hover:opacity-80"
            @click="selectStay(stay)"
          />
          <text 
            :x="getStayX(stay.entry) + getStayWidth(stay.entry, stay.exit) / 2" 
            :y="37" 
            text-anchor="middle" 
            class="text-xs fill-white font-medium"
          >
            {{ getStayLabel(stay) }}
          </text>
        </g>
        
        <!-- Proposed stay overlay -->
        <g v-if="proposed">
          <rect 
            :x="getStayX(proposed.entry)" 
            :y="50" 
            :width="getStayWidth(proposed.entry, proposed.exit || proposed.entry)" 
            :height="15" 
            fill="#10b981" 
            opacity="0.7"
            stroke="#059669"
            stroke-width="1"
            stroke-dasharray="3,3"
          />
          <text 
            :x="getStayX(proposed.entry) + getStayWidth(proposed.entry, proposed.exit || proposed.entry) / 2" 
            :y="60" 
            text-anchor="middle" 
            class="text-xs fill-white font-medium"
          >
            Proposed
          </text>
        </g>
        
        <!-- Reference date line -->
        <line 
          :x1="refDateX" 
          :y1="20" 
          :x2="refDateX" 
          :y2="timelineHeight - 20" 
          stroke="#dc2626" 
          stroke-width="2"
        />
        <text 
          :x="refDateX" 
          :y="15" 
          text-anchor="middle" 
          class="text-xs fill-red-600 font-medium"
        >
          {{ formatDate(refDate) }}
        </text>
      </svg>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.visible" 
        class="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        {{ tooltip.content }}
      </div>
    </div>
    
    <!-- Legend -->
    <div class="mt-4 flex flex-wrap gap-4 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-4 h-3 bg-blue-500 rounded"></div>
        <span>Past stays</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-3 bg-green-500 rounded" style="opacity: 0.7; border: 1px dashed #059669;"></div>
        <span>Proposed stay</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-3 bg-blue-200 rounded"></div>
        <span>180-day window</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-1 bg-red-600"></div>
        <span>Reference date</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DateTime } from 'luxon'
import { normalizeStays } from '../lib/schengen'
import { formatDate, calculateStayDuration } from '../utils/stays'
import type { Stay } from '../types'

interface Props {
  stays: Stay[]
  refDate: string
  proposed?: {
    entry: string
    exit?: string
  }
}

const props = defineProps<Props>()

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  content: ''
})

const timelineWidth = 800
const timelineHeight = 80
const daysSpan = 240 // refDate - 210 to refDate + 30
const pixelsPerDay = timelineWidth / daysSpan

const normalizedStays = computed(() => {
  const result = normalizeStays(props.stays)
  return result.stays
})

const startDate = computed(() => {
  return DateTime.fromISO(props.refDate, { zone: 'utc' }).minus({ days: 210 })
})

const endDate = computed(() => {
  return DateTime.fromISO(props.refDate, { zone: 'utc' }).plus({ days: 30 })
})

const windowStartX = computed(() => {
  const daysFromStart = 30 // 210 - 180
  return daysFromStart * pixelsPerDay
})

const windowWidth = computed(() => {
  return 180 * pixelsPerDay
})

const refDateX = computed(() => {
  const daysFromStart = 210
  return daysFromStart * pixelsPerDay
})

const monthTicks = computed(() => {
  const ticks = []
  let current = startDate.value.startOf('month')
  
  while (current <= endDate.value) {
    const daysFromStart = current.diff(startDate.value, 'days').days
    ticks.push({
      x: daysFromStart * pixelsPerDay,
      label: current.toFormat('MMM')
    })
    current = current.plus({ months: 1 })
  }
  
  return ticks
})

const getStayX = (entryISO: string): number => {
  const entry = DateTime.fromISO(entryISO, { zone: 'utc' })
  const daysFromStart = entry.diff(startDate.value, 'days').days
  return Math.max(0, daysFromStart * pixelsPerDay)
}

const getStayWidth = (entryISO: string, exitISO: string): number => {
  const duration = calculateStayDuration(entryISO, exitISO)
  return Math.max(1, duration * pixelsPerDay)
}

const getStayColor = (stay: Stay): string => {
  const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
  const refDate = DateTime.fromISO(props.refDate, { zone: 'utc' })
  
  if (entry < refDate) {
    return '#3b82f6' // Blue for past stays
  } else {
    return '#10b981' // Green for future stays
  }
}

const getStayLabel = (stay: Stay): string => {
  const duration = calculateStayDuration(stay.entry, stay.exit)
  return `${duration}d`
}

const selectStay = (stay: Stay) => {
  // Emit event or handle stay selection
  console.log('Selected stay:', stay)
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = (event.target as SVGElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  
  const daysFromStart = x / pixelsPerDay
  const hoverDate = startDate.value.plus({ days: Math.floor(daysFromStart) })
  
  if (hoverDate >= startDate.value && hoverDate <= endDate.value) {
    tooltip.value = {
      visible: true,
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 10,
      content: `${formatDate(hoverDate.toISODate()!)} - Used: ${getUsedOnDate(hoverDate.toISODate()!)}/90`
    }
  }
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

const getUsedOnDate = (_dateISO: string): number => {
  // This would need to be passed as a prop or calculated
  // For now, return a placeholder
  return 0
}
</script>
