<template>
  <div class="timeline-container">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">{{ t('timelineVisualizer') }}</h3>
    
    <div class="timeline-wrapper">
      <!-- Timeline Header -->
      <div class="timeline-header">
        <div class="timeline-title">{{ t('schengenStayTimeline') }}</div>
        <div class="timeline-subtitle">{{ t('rollingWindowVisualization') }}</div>
      </div>
      
      <!-- Timeline Graph -->
      <div class="timeline-graph">
        <!-- Y-axis labels -->
        <div class="y-axis">
          <div class="y-label">{{ t('pastStays') }}</div>
          <div class="y-label">{{ t('plannedTrip') }}</div>
          <div class="y-label">{{ t('rollingWindow') }}</div>
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
                <div class="stay-duration">{{ getDuration(stay.entry, stay.exit) }} {{ t('days') }}</div>
              </div>
            </div>
          </div>
          
          <!-- Planned trip timeline -->
          <div class="timeline-row">
            <div v-if="plannedTrip" 
                 class="stay-bar" 
                 :class="plannedTrip.hasExitDate !== false ? 'planned-bar' : 'planned-bar-estimated'"
                 :style="getStayBarStyle(plannedTrip, -1)">
              <div class="stay-tooltip">
                <div class="stay-dates">{{ formatDateRange(plannedTrip.entry, plannedTrip.exit) }}</div>
                <div class="stay-duration">{{ getDuration(plannedTrip.entry, plannedTrip.exit) }} {{ t('days') }}</div>
                <div class="stay-label" :class="plannedTrip.hasExitDate !== false ? '' : 'estimated-label'">
                  {{ plannedTrip.hasExitDate !== false ? t('planned') : t('estimated') }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Rolling window indicator -->
          <div class="timeline-row">
            <div class="rolling-window-bar" :style="getRollingWindowStyle()">
              <div class="window-tooltip">
                <div class="window-label">{{ t('rollingWindowLabel') }}</div>
                <div class="window-days">{{ daysUsedInWindow }} {{ t('daysUsedInWindow') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="timeline-legend">
        <div class="legend-item">
          <div class="legend-color past-color"></div>
          <span>{{ t('pastStays') }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-color planned-color"></div>
          <span>{{ t('plannedTrip') }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-color estimated-color"></div>
          <span>{{ t('estimatedTripNoExit') }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-color window-color"></div>
          <span>{{ t('rollingWindow') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '../utils/schengen'
import { useTranslations } from '../utils/translations'

const { language, t } = useTranslations()

interface Stay {
  entry: Date | null
  exit: Date | null
}

interface Props {
  pastStays: Stay[]
  plannedTrip?: { entry: Date; exit: Date; hasExitDate?: boolean } | null
  daysUsedInWindow: number
}

const props = defineProps<Props>()

const timelineRange = computed(() => {
  const allDates: Date[] = []
  
  props.pastStays.forEach(stay => {
    if (stay.entry) allDates.push(stay.entry)
    if (stay.exit) allDates.push(stay.exit)
  })
  
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
  
  start.setMonth(start.getMonth() - 1)
  end.setMonth(end.getMonth() + 1)
  
  return { start, end }
})

const timelineMonths = computed(() => {
  const months = []
  const start = timelineRange.value.start
  const end = timelineRange.value.end
  const locale = language.value === 'sq' ? 'sq-AL' : 'en-US'
  
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    months.push(d.toLocaleDateString(locale, { month: 'short', year: '2-digit' }))
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

const getStayBarStyle = (stay: Stay | { entry: Date; exit: Date; hasExitDate?: boolean }, index: number) => {
  if (!stay.entry || !stay.exit) return {}
  
  const start = timelineRange.value.start
  const end = timelineRange.value.end
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const stayStart = (stay.entry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const stayDuration = (stay.exit.getTime() - stay.entry.getTime()) / (1000 * 60 * 60 * 24) + 1
  
  const leftPercent = (stayStart / totalDays) * 100
  const widthPercent = (stayDuration / totalDays) * 100
  
  let color = '#8B5CF6'
  if (index === -1) {
    const hasExitDate = 'hasExitDate' in stay ? stay.hasExitDate !== false : true
    color = hasExitDate ? '#8B5CF6' : '#F49E4C'
  } else {
    color = getStayColor(index)
  }
  
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
  
  let referenceDate = new Date()
  if (props.plannedTrip) {
    referenceDate = props.plannedTrip.entry
  }
  
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
  return `${formatDate(entry, language.value)} - ${formatDate(exit, language.value)}`
}

const getDuration = (entry: Date | null, exit: Date | null): number => {
  if (!entry || !exit) return 0
  const timeDiff = exit.getTime() - entry.getTime()
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1
}
</script>

<style scoped>
.timeline-container {
  @apply rounded-xl shadow-2xl p-8 border-2 border-white/30 transition-all duration-300;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.timeline-container:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.timeline-wrapper {
  @apply space-y-6;
}

.timeline-header {
  @apply text-center pb-6 border-b-2 border-white/40;
  color: #2d728f;
}

.timeline-title {
  @apply text-2xl font-bold mb-2;
}

.timeline-subtitle {
  @apply text-sm text-gray-600;
}

.timeline-graph {
  @apply flex rounded-lg p-4 transition-all duration-300;
  min-height: 220px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.y-axis {
  @apply flex flex-col justify-between py-4 pr-6;
  min-width: 120px;
  border-right: 2px solid #f3f4f6;
}

.y-label {
  @apply text-sm font-semibold text-gray-700 px-3 py-2 rounded-lg transition-all duration-300;
  height: 44px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.timeline-content {
  @apply flex-1 relative;
  min-height: 220px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.planned-bar-estimated {
  @apply border-2 border-sandy-brown-400;
  border-style: dashed;
  box-shadow: 0 4px 12px rgba(244, 158, 76, 0.3);
  background: linear-gradient(135deg, #f49e4c 0%, #f5ee9e 100%);
  opacity: 0.85;
}

.planned-bar-estimated:hover {
  box-shadow: 0 6px 20px rgba(244, 158, 76, 0.4);
  opacity: 1;
}

.rolling-window-bar {
  @apply absolute h-10 rounded-lg;
  top: 2px;
  border: 2px dashed #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  box-shadow: inset 0 2px 4px rgba(59, 130, 246, 0.1);
}

.stay-tooltip {
  @apply rounded-lg shadow-xl p-3 text-xs transition-all duration-300;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.4);
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
  @apply flex flex-wrap gap-6 justify-center mt-8 pt-6 border-t-2 border-white/40;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 20px;
}

.legend-item {
  @apply flex items-center space-x-3 text-sm font-medium transition-all duration-300;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.estimated-color {
  background: linear-gradient(135deg, #f49e4c 0%, #f5ee9e 100%);
  border: 2px dashed #f49e4c;
}

.estimated-label {
  @apply font-bold text-sandy-brown-600 uppercase text-xs tracking-wide;
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
