<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Schengen Planner</h1>
      
      <!-- Past Entries -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Past Schengen Entries</h2>
        
        <div v-for="(entry, index) in pastEntries" :key="index" class="flex gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Entry Date</label>
            <VueDatePicker 
              v-model="entry.entry" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Exit Date</label>
            <VueDatePicker 
              v-model="entry.exit" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="removeEntry(index)" 
              class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              :disabled="pastEntries.length <= 1"
            >
              Remove
            </button>
          </div>
        </div>
        
        <button 
          @click="addEntry" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Entry
        </button>
      </div>
      
      <!-- Trip Planning -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Trip Planning</h2>
        
        <div class="flex gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Planned Entry Date *</label>
            <VueDatePicker 
              v-model="plannedEntry" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Planned Exit Date (Optional)</label>
            <VueDatePicker 
              v-model="plannedExit" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
            />
          </div>
        </div>
        
        <button 
          @click="calculate" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Calculate
        </button>
      </div>
      
      <!-- Results -->
      <div v-if="results" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Results</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium">Days Left in EU</h3>
            <p class="text-2xl font-bold" :class="results.daysLeft > 0 ? 'text-green-600' : 'text-red-600'">
              {{ results.daysLeft }}
            </p>
          </div>
          <div>
            <h3 class="font-medium">Trip Status</h3>
            <p class="text-2xl font-bold" :class="results.tripValid ? 'text-green-600' : 'text-red-600'">
              {{ results.tripValid ? 'VALID' : 'INVALID' }}
            </p>
          </div>
        </div>
        
        <div class="mt-4 text-sm text-gray-600">
          <p>Days used on entry: {{ results.daysUsedOnEntry }}</p>
          <p>Days remaining on entry: {{ results.daysRemainingOnEntry }}</p>
          <p>Latest safe exit: {{ formatDate(new Date(results.latestSafeExit)) }}</p>
          <p v-if="results.requiredExitDate" class="font-semibold text-blue-600">
            Required exit date: {{ formatDate(new Date(results.requiredExitDate)) }}
          </p>
          <p v-if="results.daysRemainingAfterTrip !== undefined" class="font-semibold text-green-600">
            Days remaining after trip: {{ results.daysRemainingAfterTrip }}
          </p>
        </div>
      </div>
      
      <!-- Timeline Visualizer -->
      <div v-if="results" class="mt-8">
        <TimelineVisualizer 
          :pastStays="validPastStays"
          :plannedTrip="plannedTripData"
          :daysUsedInWindow="results.daysUsedOnEntry"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { calculateSchengenStatus, formatDate, type Stay, type CalculationResult } from './utils/schengen'
import TimelineVisualizer from './components/TimelineVisualizer.vue'

const pastEntries = ref<Stay[]>([
  { entry: null, exit: null },
  { entry: null, exit: null },
  { entry: null, exit: null },
  { entry: null, exit: null }
])

const plannedEntry = ref<Date | null>(null)
const plannedExit = ref<Date | null>(null)
const results = ref<CalculationResult | null>(null)

const addEntry = () => {
  pastEntries.value.push({ entry: null, exit: null })
}

const removeEntry = (index: number) => {
  if (pastEntries.value.length > 1) {
    pastEntries.value.splice(index, 1)
  }
}

const calculate = () => {
  if (!plannedEntry.value) {
    alert('Please enter a planned entry date')
    return
  }
  
  // Filter out entries with missing dates
  const validStays = pastEntries.value.filter(stay => stay.entry && stay.exit)
  
  results.value = calculateSchengenStatus(validStays, plannedEntry.value, plannedExit.value)
}

// Computed properties for timeline
const validPastStays = computed(() => {
  return pastEntries.value.filter(stay => stay.entry && stay.exit)
})

const plannedTripData = computed(() => {
  if (plannedEntry.value && plannedExit.value) {
    return {
      entry: plannedEntry.value,
      exit: plannedExit.value
    }
  }
  return null
})
</script>