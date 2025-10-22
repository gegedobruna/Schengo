<template>
  <div class="space-y-6">
    <!-- Input Section -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Current Stay Information</h2>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="label">Actual Entry Date *</label>
          <input 
            type="text" 
            v-model="actualEntry"
            placeholder="YYYY-MM-DD (e.g., 2024-06-01)"
            class="input"
            :class="{ 'input-error': !actualEntry || !isValidDate(actualEntry) }"
            required
          />
          <p v-if="!actualEntry" class="error-message">Entry date is required</p>
          <p v-else-if="!isValidDate(actualEntry)" class="error-message">Please enter a valid date in YYYY-MM-DD format</p>
        </div>
        
        <div>
          <label class="label">Current Date</label>
          <div class="input bg-gray-50">
            {{ formatDate(today) }}
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          @click="calculateInsideResult"
          class="btn btn-primary"
          :disabled="!actualEntry || !isValidDate(actualEntry)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculate Status
        </button>
        <p class="text-sm text-gray-600 mt-2">
          Click "Calculate Status" to see your current status
        </p>
      </div>
    </div>

    <!-- Status Display -->
    <div v-if="actualEntry && insideResult.usedToday > 0" class="card">
      <div class="card-header">
        <h2 class="card-title">Current Status</h2>
      </div>
      
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600 mb-2">
            {{ insideResult.usedToday }}
          </div>
          <div class="text-sm text-gray-600">Used Today</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-schengen-600 mb-2">
            {{ insideResult.daysLeft }}
          </div>
          <div class="text-sm text-gray-600">Days Left Today</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ formatDate(insideResult.latestExit) }}
          </div>
          <div class="text-sm text-gray-600">Latest Legal Exit</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Days used in 180-day window</span>
          <span>{{ insideResult.usedToday }}/90</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="h-3 rounded-full transition-all duration-300"
            :class="progressBarClass"
            :style="{ width: `${Math.min((insideResult.usedToday / 90) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="insideResult.daysLeft <= 10 && insideResult.daysLeft > 0" class="mt-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-yellow-800">Warning</h3>
              <p class="mt-1 text-sm text-yellow-700">
                Only {{ insideResult.daysLeft }} days remaining in your 180-day window. 
                Consider planning your exit soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="insideResult.daysLeft <= 0" class="mt-6">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800">Critical</h3>
              <p class="mt-1 text-sm text-red-700">
                You have exceeded the 90-day limit! You must leave immediately to avoid overstaying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="actualEntry && insideResult.usedToday > 0" class="card">
      <WindowTimeline 
        :stays="currentStays"
        :refDate="today"
        :proposed="{ entry: actualEntry, exit: insideResult.latestExit }"
      />
    </div>


    <!-- Info Note -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800">Important Notes</h3>
          <ul class="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>All calculations are per calendar day in UTC</li>
            <li>Entry and exit days count in full (inclusive counting)</li>
            <li>The 180-day window is rolling - it moves forward each day</li>
            <li>Make sure to record all your Schengen area visits accurately</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlanner } from '../composables/usePlanner'
import { alreadyInside } from '../lib/schengen'
import { formatDate, getTodayISO } from '../utils/stays'
import WindowTimeline from './WindowTimeline.vue'

const { currentStays } = usePlanner()

const actualEntry = ref('')
const today = getTodayISO()

const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
}

const insideResult = ref({
  usedToday: 0,
  daysLeft: 90,
  latestExit: today
})

const calculateInsideResult = () => {
  if (!actualEntry.value || !isValidDate(actualEntry.value)) {
    insideResult.value = {
      usedToday: 0,
      daysLeft: 90,
      latestExit: today
    }
    return
  }
  
  try {
    insideResult.value = alreadyInside(currentStays.value, actualEntry.value)
  } catch (error) {
    console.error('Error calculating inside result:', error)
    insideResult.value = {
      usedToday: 0,
      daysLeft: 90,
      latestExit: today
    }
  }
}

// No automatic calculations - only when user clicks Calculate button

const progressBarClass = ref('bg-green-500')

// Update progress bar class when insideResult changes
watch(insideResult, (newResult) => {
  const percentage = (newResult.usedToday / 90) * 100
  if (percentage >= 90) progressBarClass.value = 'bg-red-500'
  else if (percentage >= 80) progressBarClass.value = 'bg-yellow-500'
  else progressBarClass.value = 'bg-green-500'
}, { deep: true })
</script>