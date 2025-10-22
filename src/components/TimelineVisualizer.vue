<template>
  <div class="timeline-container">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Timeline Visualizer</h3>
    
    <div class="timeline-wrapper">
      <!-- Timeline Header -->
      <div class="timeline-header">
        <div class="timeline-title">Schengen Stay Timeline</div>
        <div class="timeline-subtitle">Rolling 180-day window visualization</div>
      </div>
      
      <!-- Timeline Graph -->
      <div class="timeline-graph">
        <!-- Y-axis labels -->
        <div class="y-axis">
          <div class="y-label">Past Stays</div>
          <div class="y-label">Planned Trip</div>
          <div class="y-label">Rolling Window</div>
        </div>
        
        <!-- Timeline content -->
        <div class="timeline-content">
          <!-- Timeline grid -->
          <div class="timeline-grid">
            <div v-for="month in timelineMonths" :key="month" class="grid-line">
              <div class="grid-label">{{ month }}</div>
            </div>
          </div>
          
          <!-- Past stays timeline -->
          <div class="timeline-row">
            <div v-for="(stay, index) in pastStays" :key="`past-${index}`" 
                 class="stay-bar" 
                 :style="getStayBarStyle(stay, index)">
              <div class="stay-tooltip">
                <div class="stay-dates">{{ formatDateRange(stay.entry, stay.exit) }}</div>
                <div class="stay-duration">{{ getDuration(stay.entry, stay.exit) }} days</div>
              </div>
            </div>
          </div>
          
          <!-- Planned trip timeline -->
          <div class="timeline-row">
            <div v-if="plannedTrip" 
                 class="stay-bar planned-bar" 
                 :style="getStayBarStyle(plannedTrip, -1)">
              <div class="stay-tooltip">
                <div class="stay-dates">{{ formatDateRange(plannedTrip.entry, plannedTrip.exit) }}</div>
                <div class="stay-duration">{{ getDuration(plannedTrip.entry, plannedTrip.exit) }} days</div>
                <div class="stay-label">PLANNED</div>
              </div>
            </div>
          </div>
          
          <!-- Rolling window indicator -->
          <div class="timeline-row">
            <div class="rolling-window-bar" :style="getRollingWindowStyle()">
              <div class="window-tooltip">
                <div class="window-label">180-day rolling window</div>
                <div class="window-days">{{ daysUsedInWindow }} / 90 days used</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="timeline-legend">
        <div class="legend-item">
          <div class="legend-color past-color"></div>
          <span>Past Stays</span>
        </div>
        <div class="legend-item">
          <div class="legend-color planned-color"></div>
          <span>Planned Trip</span>
        </div>
        <div class="legend-item">
          <div class="legend-color window-color"></div>
          <span>Rolling Window</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../utils/schengen'

interface Stay {
  entry: Date | null
  exit: Date | null
}

interface Props {
  pastStays: Stay[]
  plannedTrip?: { entry: Date; exit: Date } | null
  daysUsedInWindow: number
}

const props = defineProps<Props>()

// Calculate timeline range
const timelineRange = computed(() => {
  const allDates: Date[] = []
  
  // Add all past stay dates
  props.pastStays.forEach(stay => {
    if (stay.entry) allDates.push(stay.entry)
    if (stay.exit) allDates.push(stay.exit)
  })
  
  // Add planned trip dates
  if (props.plannedTrip) {
    allDates.push(props.plannedTrip.entry)
    allDates.push(props.plannedTrip.exit)
  }
  
  if (allDates.length === 0) {
    const today = new Date()
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 6, 1),
      end: new Date(today.getFullYear(), today.getMonth() + 6, 1)
    }
  }
  
  const start = new Date(Math.min(...allDates.map(d => d.getTime())))
  const end = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  // Add some padding
  start.setMonth(start.getMonth() - 1)
  end.setMonth(end.getMonth() + 1)
  
  return { start, end }
})

const timelineMonths = computed(() => {
  const months = []
  const start = timelineRange.value.start
  const end = timelineRange.value.end
  
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    months.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
  }
  
  return months
})

const getStayColor = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ]
  return colors[index % colors.length]
}

const getStayBarStyle = (stay: Stay | { entry: Date; exit: Date }, index: number) => {
  if (!stay.entry || !stay.exit) return {}
  
  const start = timelineRange.value.start
  const end = timelineRange.value.end
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const stayStart = (stay.entry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const stayDuration = (stay.exit.getTime() - stay.entry.getTime()) / (1000 * 60 * 60 * 24) + 1
  
  const leftPercent = (stayStart / totalDays) * 100
  const widthPercent = (stayDuration / totalDays) * 100
  
  const color = index === -1 ? '#8B5CF6' : getStayColor(index)
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: color,
    minWidth: '20px'
  }
}

const getRollingWindowStyle = () => {
  const start = timelineRange.value.start
  const end = timelineRange.value.end
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  
  // Use planned trip entry date as reference, or today if no planned trip
  let referenceDate = new Date()
  if (props.plannedTrip) {
    referenceDate = props.plannedTrip.entry
  }
  
  // Show rolling window: 179 days before reference date to reference date (180 days inclusive)
  const windowStartDate = new Date(referenceDate)
  windowStartDate.setDate(windowStartDate.getDate() - 179)
  
  const windowStart = (windowStartDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const windowEnd = (referenceDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  
  const leftPercent = Math.max(0, (windowStart / totalDays) * 100)
  const rightPercent = Math.min(100, (windowEnd / totalDays) * 100)
  const widthPercent = rightPercent - leftPercent
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: '#3B82F6',
    opacity: 0.2
  }
}

const formatDateRange = (entry: Date | null, exit: Date | null): string => {
  if (!entry || !exit) return ''
  return `${formatDate(entry)} - ${formatDate(exit)}`
}

const getDuration = (entry: Date | null, exit: Date | null): number => {
  if (!entry || !exit) return 0
  const timeDiff = exit.getTime() - entry.getTime()
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1
}
</script>

<style scoped>
.timeline-container {
  @apply bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-8 border border-gray-100;
}

.timeline-wrapper {
  @apply space-y-6;
}

.timeline-header {
  @apply text-center pb-6 border-b-2 border-gray-200;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.timeline-title {
  @apply text-2xl font-bold mb-2;
}

.timeline-subtitle {
  @apply text-sm text-gray-600;
}

.timeline-graph {
  @apply flex bg-white rounded-lg shadow-inner p-4;
  min-height: 220px;
  border: 1px solid #e5e7eb;
}

.y-axis {
  @apply flex flex-col justify-between py-4 pr-6;
  min-width: 120px;
  border-right: 2px solid #f3f4f6;
}

.y-label {
  @apply text-sm font-semibold text-gray-700 px-3 py-2 rounded-lg;
  height: 44px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
}

.timeline-content {
  @apply flex-1 relative;
  min-height: 220px;
  background: linear-gradient(90deg, #fafbfc 0%, #ffffff 50%, #fafbfc 100%);
  border-radius: 8px;
}

.timeline-grid {
  @apply absolute inset-0 flex;
}

.grid-line {
  @apply flex-1 border-l border-gray-300 relative;
}

.grid-line:first-child {
  @apply border-l-0;
}

.grid-label {
  @apply absolute -top-8 text-xs text-gray-600 font-medium;
  transform: translateX(-50%);
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.timeline-row {
  @apply relative h-14 mb-3;
}

.stay-bar {
  @apply absolute h-10 rounded-lg shadow-md cursor-pointer transition-all duration-300;
  top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
}

.stay-bar:hover {
  @apply shadow-xl;
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.6);
}

.planned-bar {
  @apply border-2 border-purple-400;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
}

.planned-bar:hover {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.rolling-window-bar {
  @apply absolute h-10 rounded-lg;
  top: 2px;
  border: 2px dashed #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  box-shadow: inset 0 2px 4px rgba(59, 130, 246, 0.1);
}

.stay-tooltip {
  @apply bg-white rounded-lg shadow-xl p-3 text-xs;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(10px);
}

.stay-bar:hover .stay-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.window-tooltip {
  @apply bg-white rounded-lg shadow-xl p-3 text-xs;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(10px);
}

.rolling-window-bar:hover .window-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.stay-dates {
  @apply font-bold text-gray-800 text-sm;
}

.stay-duration {
  @apply text-gray-600 font-medium;
}

.stay-label {
  @apply font-bold text-purple-600 uppercase text-xs tracking-wide;
}

.window-label {
  @apply font-bold text-blue-800 text-sm;
}

.window-days {
  @apply text-blue-600 font-semibold;
}

.timeline-legend {
  @apply flex flex-wrap gap-6 justify-center mt-8 pt-6 border-t border-gray-200;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 20px;
}

.legend-item {
  @apply flex items-center space-x-3 text-sm font-medium;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.legend-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.legend-color {
  @apply w-5 h-5 rounded-full shadow-sm;
}

.past-color {
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}

.planned-color {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
}

.window-color {
  background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .timeline-graph {
    @apply flex-col;
  }
  
  .y-axis {
    @apply flex-row justify-between py-2 pr-0 pb-2;
    min-width: auto;
  }
  
  .y-label {
    @apply text-xs;
    height: auto;
  }
  
  .timeline-content {
    min-height: 150px;
  }
  
  .timeline-row {
    @apply h-8;
  }
  
  .stay-bar {
    @apply h-6;
  }
  
  .rolling-window-bar {
    @apply h-6;
  }
}
</style>
