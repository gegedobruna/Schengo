<template>
  <div class="space-y-6">
    <!-- Input Section -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Plan Your Trip</h2>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="label">Planned Entry Date *</label>
          <input 
            type="text" 
            v-model="plannedEntry"
            placeholder="YYYY-MM-DD (e.g., 2024-06-15)"
            class="input"
            :class="{ 'input-error': !plannedEntry || !isValidDate(plannedEntry) }"
            required
          />
          <p v-if="!plannedEntry" class="error-message">Entry date is required</p>
          <p v-else-if="!isValidDate(plannedEntry)" class="error-message">Please enter a valid date in YYYY-MM-DD format</p>
        </div>
        
        <div>
          <label class="label">Proposed Exit Date (Optional)</label>
          <input 
            type="text" 
            v-model="proposedExit"
            placeholder="YYYY-MM-DD (e.g., 2024-06-25)"
            class="input"
            :class="{ 'input-error': proposedExit && !isValidDate(proposedExit) }"
          />
          <p v-if="proposedExit && !isValidDate(proposedExit)" class="error-message">Please enter a valid date in YYYY-MM-DD format</p>
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          @click="calculatePlanResult"
          class="btn btn-primary"
          :disabled="!plannedEntry || !isValidDate(plannedEntry)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculate Results
        </button>
        <p class="text-sm text-gray-600 mt-2">
          Click "Calculate Results" to see your planning data
        </p>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="plannedEntry && planResult.usedOnEntry > 0" class="card">
      <div class="card-header">
        <h2 class="card-title">Planning Results</h2>
      </div>
      
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <div class="text-center p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
          <div class="text-4xl font-bold text-cerulean-600 mb-2">
            {{ planResult.usedOnEntry }}
          </div>
          <div class="text-sm font-semibold text-gray-700">Used on Entry</div>
        </div>
        
        <div class="text-center p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
          <div class="text-4xl font-bold text-blue-munsell-600 mb-2">
            {{ planResult.remainingOnEntry }}
          </div>
          <div class="text-sm font-semibold text-gray-700">Remaining on Entry</div>
        </div>
        
        <div class="text-center p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ formatDate(planResult.latestExit) }}
          </div>
          <div class="text-sm font-semibold text-gray-700">Latest Safe Exit</div>
        </div>
      </div>

      <!-- Proposed Exit Validation -->
      <div v-if="proposedExit" class="mb-6 glass-effect rounded-xl p-4 transition-all duration-300 hover:bg-white/85" :class="planResult.proposed?.ok ? 'border-green-300/50' : 'border-fire-brick-300/50'">
        <div class="flex items-center gap-2 mb-2">
          <svg 
            class="w-5 h-5" 
            :class="planResult.proposed?.ok ? 'text-green-500' : 'text-red-500'"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              v-if="planResult.proposed?.ok"
              fill-rule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clip-rule="evenodd" 
            />
            <path 
              v-else
              fill-rule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clip-rule="evenodd" 
            />
          </svg>
          <span 
            class="font-medium"
            :class="planResult.proposed?.ok ? 'text-green-700' : 'text-red-700'"
          >
            {{ planResult.proposed?.ok ? 'OK - Trip is legal' : 'Exceeds 90 days' }}
          </span>
        </div>
        
        <p v-if="planResult.proposed?.firstIllegal" class="text-sm text-red-600">
          First illegal day: {{ formatDate(planResult.proposed.firstIllegal) }}
        </p>
      </div>

      <!-- Aging Out Schedule -->
      <div v-if="planResult.agingOut.length > 0">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Aging Out Schedule</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600 mb-3">
            Days that will drop out of your 180-day window:
          </div>
          <div class="space-y-2">
            <div 
              v-for="(event, index) in planResult.agingOut.slice(0, 10)" 
              :key="index"
              class="flex justify-between items-center py-1"
            >
              <span class="text-sm">{{ formatDate(event.date) }}</span>
              <span class="badge badge-info">+{{ event.days }} days regained</span>
            </div>
          </div>
          <div v-if="planResult.agingOut.length > 10" class="text-sm text-gray-500 mt-2">
            ... and {{ planResult.agingOut.length - 10 }} more events
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="plannedEntry && planResult.usedOnEntry > 0" class="card">
      <WindowTimeline 
        :stays="currentStays"
        :refDate="plannedEntry"
        :proposed="proposedExit ? { entry: plannedEntry, exit: proposedExit } : undefined"
      />
    </div>

    <!-- Info Note -->
    <div class="glass-effect rounded-xl p-6 border-blue-munsell-300/50 transition-all duration-300 hover:bg-white/85">
      <div class="flex">
        <div class="w-10 h-10 bg-blue-munsell-500/80 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 backdrop-blur-sm border-2 border-white/30">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-blue-munsell-800 mb-2">Important Notes</h3>
          <ul class="text-sm text-blue-munsell-700 list-disc list-inside space-y-1.5 font-medium">
            <li>Entry and exit days count in full (inclusive counting)</li>
            <li>All calculations use UTC timezone</li>
            <li>The 180-day window is rolling - it moves forward each day</li>
            <li>You can stay up to 90 days in any 180-day period</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlanner } from '../composables/usePlanner'
import { planTrip } from '../lib/schengen'
import { formatDate } from '../utils/stays'
import WindowTimeline from './WindowTimeline.vue'
import type { PlanResult } from '../types'

const { currentStays } = usePlanner()

const plannedEntry = ref('')
const proposedExit = ref('')

const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
}

const planResult = ref<PlanResult>({
  usedOnEntry: 0,
  remainingOnEntry: 90,
  latestExit: '',
  agingOut: [],
  proposed: undefined
})

const calculatePlanResult = () => {
  if (!plannedEntry.value || !isValidDate(plannedEntry.value)) {
    planResult.value = {
      usedOnEntry: 0,
      remainingOnEntry: 90,
      latestExit: '',
      agingOut: [],
      proposed: undefined
    }
    return
  }
  
  try {
    planResult.value = planTrip(currentStays.value, plannedEntry.value, proposedExit.value || undefined)
  } catch (error) {
    console.error('Error calculating plan result:', error)
    planResult.value = {
      usedOnEntry: 0,
      remainingOnEntry: 90,
      latestExit: plannedEntry.value,
      agingOut: [],
      proposed: undefined
    }
  }
}

// No automatic calculations - only when user clicks Calculate button
</script>