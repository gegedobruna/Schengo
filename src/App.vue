<template>
  <div class="min-h-screen p-6 md:p-8 relative">
    <!-- Language Toggle Button -->
    <button
      @click="setLanguage(language === 'en' ? 'sq' : 'en')"
      class="fixed top-4 right-4 px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2 bg-white/75 border-white/30 shadow-md text-gray-700 hover:bg-white/85 z-50"
      style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
      :title="language === 'en' ? 'Switch to Albanian' : 'Kalo në Anglisht'"
    >
      {{ language === 'en' ? 'SQ' : 'EN' }}
    </button>
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center mb-4">
        <img 
          :src="logoImage" 
          alt="Schengen Planner" 
          class="mx-auto max-w-[200px] md:max-w-[250px] h-auto drop-shadow-lg brightness-0 invert mb-4"
        />
        
        <!-- Mode Toggle Buttons -->
        <div class="flex justify-center gap-4">
          <button
            @click="mode = 'planning'"
            :class="[
              'px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2',
              mode === 'planning'
                ? 'bg-white/85 border-white/50 shadow-lg text-primary-600'
                : 'bg-white/50 border-white/20 shadow-sm text-gray-500 opacity-60 hover:bg-white/60 hover:opacity-80'
            ]"
            style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
          >
            {{ t('planningTrip') }}
          </button>
          <button
            @click="mode = 'inside'"
            :class="[
              'px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2',
              mode === 'inside'
                ? 'bg-white/85 border-white/50 shadow-lg text-primary-600'
                : 'bg-white/50 border-white/20 shadow-sm text-gray-500 opacity-60 hover:bg-white/60 hover:opacity-80'
            ]"
            style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
          >
            {{ t('alreadyInside') }}
          </button>
        </div>
      </div>
      
      <!-- Planning Mode -->
      <div v-if="mode === 'planning'">
      <!-- Past Entries -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ t('pastSchengenEntries') }}</h2>
        </div>
        
        <div v-for="(entry, index) in pastEntries" :key="index" class="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div class="flex-1">
            <label class="label">{{ t('entryDate') }}</label>
            <VueDatePicker 
              v-model="entry.entry" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
              :teleport="true"
              :auto-position="true"
            />
          </div>
          <div class="flex-1">
            <label class="label">{{ t('exitDate') }}</label>
            <VueDatePicker 
              v-model="entry.exit" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
              :teleport="true"
              :auto-position="true"
            />
          </div>
          <div class="flex items-center">
            <button 
              @click="removeEntry(index)" 
              class="btn-transparent-danger w-10 h-10 flex items-center justify-center p-0"
              :disabled="pastEntries.length <= 1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <button 
          @click="addEntry" 
          class="btn-transparent-primary w-full md:w-auto"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('addEntry') }}
        </button>
      </div>
      
      <!-- Trip Planning -->
      <div class="card mt-8">
        <div class="card-header">
          <h2 class="card-title">{{ t('tripPlanning') }}</h2>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="label">{{ t('plannedEntryDate') }}</label>
            <VueDatePicker 
              v-model="plannedEntry" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
              :teleport="true"
              :auto-position="true"
            />
          </div>
          <div>
            <label class="label">{{ t('plannedExitDate') }}</label>
            <VueDatePicker 
              v-model="plannedExit" 
              :format="'dd-MM-yyyy'"
              :enable-time-picker="false"
              :time-picker="false"
              :teleport="true"
              :auto-position="true"
            />
          </div>
        </div>
        
        <button 
          @click="calculate" 
          class="btn-transparent-success w-full md:w-auto"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ t('calculate') }}
        </button>
      </div>
      
      <!-- Results -->
      <div v-if="results" class="card mt-8">
        <div class="card-header">
          <h2 class="card-title">{{ t('results') }}</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
            <h3 class="font-semibold text-gray-700 mb-2">{{ t('daysLeftInEU') }}</h3>
            <p class="text-4xl font-bold" :class="results.daysLeft > 0 ? 'text-green-600' : 'text-fire-brick-600'">
              {{ results.daysLeft }}
            </p>
          </div>
          <div class="p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
            <h3 class="font-semibold text-gray-700 mb-2">{{ t('tripStatus') }}</h3>
            <p class="text-4xl font-bold" :class="results.tripValid ? 'text-green-600' : 'text-fire-brick-600'">
              {{ results.tripValid ? t('valid') : t('invalid') }}
            </p>
          </div>
        </div>
        
        <div class="mt-6 p-4 glass-effect rounded-xl space-y-2 text-sm transition-all duration-300 hover:bg-white/80">
          <p class="text-gray-700"><span class="font-semibold text-cerulean-600">{{ t('daysUsedOnEntry') }}</span> {{ results.daysUsedOnEntry }}</p>
          <p class="text-gray-700"><span class="font-semibold text-blue-munsell-600">{{ t('daysRemainingOnEntry') }}</span> {{ results.daysRemainingOnEntry }}</p>
          <p class="text-gray-700"><span class="font-semibold text-gray-800">{{ t('latestSafeExit') }}</span> {{ formatDate(new Date(results.latestSafeExit)) }}</p>
          <p v-if="results.requiredExitDate" class="font-semibold text-cerulean-600">
            {{ t('requiredExitDate') }} {{ formatDate(new Date(results.requiredExitDate)) }}
          </p>
          <p v-if="results.daysRemainingAfterTrip !== undefined" class="font-semibold text-green-600">
            {{ t('daysRemainingAfterTrip') }} {{ results.daysRemainingAfterTrip }}
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
      
      <!-- Inside Mode -->
      <div v-if="mode === 'inside'">
        <!-- Past Entries for Inside Mode -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">{{ t('pastSchengenEntries') }}</h2>
          </div>
          
          <div v-for="(entry, index) in insidePastEntries" :key="index" class="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div class="flex-1">
              <label class="label">{{ t('entryDate') }}</label>
              <VueDatePicker 
                v-model="entry.entry" 
                :format="'dd-MM-yyyy'"
                :enable-time-picker="false"
                :time-picker="false"
                :teleport="true"
                :auto-position="true"
              />
            </div>
            <div class="flex-1">
              <label class="label">{{ t('exitDate') }}</label>
              <VueDatePicker 
                v-model="entry.exit" 
                :format="'dd-MM-yyyy'"
                :enable-time-picker="false"
                :time-picker="false"
                :teleport="true"
                :auto-position="true"
              />
            </div>
            <div class="flex items-center">
              <button 
                @click="removeInsideEntry(index)" 
                class="btn-transparent-danger w-10 h-10 flex items-center justify-center p-0"
                :disabled="insidePastEntries.length <= 1"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <button 
            @click="addInsideEntry" 
            class="btn-transparent-primary w-full md:w-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ t('addEntry') }}
          </button>
        </div>
        
        <!-- Last Entry Date -->
        <div class="card mt-8">
          <div class="card-header">
            <h2 class="card-title">{{ t('currentStay') }}</h2>
          </div>
          
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="label">{{ t('lastEntryDate') }}</label>
              <VueDatePicker 
                v-model="lastEntryDate" 
                :format="'dd-MM-yyyy'"
                :enable-time-picker="false"
                :time-picker="false"
                :teleport="true"
                :auto-position="true"
              />
            </div>
          </div>
          
          <button 
            @click="calculateInside" 
            class="btn-transparent-success w-full md:w-auto"
          >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ t('calculate') }}
        </button>
      </div>
      
      <!-- Inside Mode Results -->
      <div v-if="insideResults" class="card mt-8">
        <div class="card-header">
          <h2 class="card-title">{{ t('results') }}</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
            <h3 class="font-semibold text-gray-700 mb-2">{{ t('daysLeftInEU') }}</h3>
              <p class="text-4xl font-bold" :class="insideResults.daysLeft > 0 ? 'text-green-600' : 'text-fire-brick-600'">
                {{ insideResults.daysLeft }}
              </p>
            </div>
          <div class="p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85 hover:scale-105">
            <h3 class="font-semibold text-gray-700 mb-2">{{ t('daysUsed') }}</h3>
            <p class="text-4xl font-bold text-gray-700">
              {{ insideResults.daysUsed }}
            </p>
          </div>
        </div>
        
        <div class="mt-6 p-4 glass-effect rounded-xl space-y-2 text-sm transition-all duration-300 hover:bg-white/80">
          <p class="text-gray-700"><span class="font-semibold text-cerulean-600">{{ t('latestSafeExit') }}</span> {{ formatDate(new Date(insideResults.latestSafeExit)) }}</p>
        </div>
        </div>
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
import logoImage from './utils/background/logo.webp'
import { useTranslations } from './utils/translations'

const { language, t, setLanguage } = useTranslations()
const mode = ref<'planning' | 'inside'>('planning')

// Planning mode state
const pastEntries = ref<Stay[]>([
  { entry: null, exit: null }
])

const plannedEntry = ref<Date | null>(null)
const plannedExit = ref<Date | null>(null)
const results = ref<CalculationResult | null>(null)

// Inside mode state
const insidePastEntries = ref<Stay[]>([
  { entry: null, exit: null }
])

const lastEntryDate = ref<Date | null>(null)
const insideResults = ref<{
  daysLeft: number
  daysUsed: number
  latestSafeExit: string
} | null>(null)

const addEntry = () => {
  pastEntries.value.push({ entry: null, exit: null })
}

const removeEntry = (index: number) => {
  if (pastEntries.value.length > 1) {
    pastEntries.value.splice(index, 1)
  }
}

const addInsideEntry = () => {
  insidePastEntries.value.push({ entry: null, exit: null })
}

const removeInsideEntry = (index: number) => {
  if (insidePastEntries.value.length > 1) {
    insidePastEntries.value.splice(index, 1)
  }
}

const calculate = () => {
  if (!plannedEntry.value) {
    alert(t('pleaseEnterPlannedEntry'))
    return
  }
  
  // Prevent calculation if any past entry or exit date is missing
  for (const [i, stay] of pastEntries.value.entries()) {
    if ((stay.entry && !stay.exit) || (!stay.entry && stay.exit)) {
      alert(`${t('completeBothDates')}${i + 1}.`)
      return
    }
  }

  // Filter out completely empty rows - only include stays with both dates
  const validStays = pastEntries.value.filter((stay: Stay) => stay.entry !== null && stay.exit !== null) as Stay[]

  results.value = calculateSchengenStatus(validStays, plannedEntry.value, plannedExit.value)
}

// Computed properties for timeline
const validPastStays = computed(() => {
  return pastEntries.value.filter((stay: Stay) => stay.entry !== null && stay.exit !== null)
})

const plannedTripData = computed(() => {
  if (plannedEntry.value) {
    if (plannedExit.value) {
      // Exit date provided
      return {
        entry: plannedEntry.value,
        exit: plannedExit.value,
        hasExitDate: true
      }
    } else if (results.value) {
      // No exit date, use latest safe exit
      return {
        entry: plannedEntry.value,
        exit: new Date(results.value.latestSafeExit),
        hasExitDate: false
      }
    }
  }
  return null
})

const calculateInside = () => {
  if (!lastEntryDate.value) {
    alert(t('pleaseEnterLastEntry'))
    return
  }
  
  // Prevent calculation if any past entry or exit date is missing
  for (const [i, stay] of insidePastEntries.value.entries()) {
    if ((stay.entry && !stay.exit) || (!stay.entry && stay.exit)) {
      alert(`${t('completeBothDates')}${i + 1}.`)
      return
    }
  }

  // Filter out completely empty rows - only include stays with both dates
  const validStays = insidePastEntries.value.filter((stay: Stay) => stay.entry !== null && stay.exit !== null) as Stay[]

  // Add current stay (from last entry date to today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const normalizedLastEntry = new Date(lastEntryDate.value)
  normalizedLastEntry.setHours(0, 0, 0, 0)
  
  // Include current stay in calculation
  const staysWithCurrent = [
    ...validStays,
    { entry: normalizedLastEntry, exit: today }
  ]
  
  // Calculate using today as reference (since they're already inside)
  const result = calculateSchengenStatus(staysWithCurrent, today, null)
  
  // Calculate latest safe exit based on last entry date (without current stay for exit calculation)
  const exitResult = calculateSchengenStatus(validStays, normalizedLastEntry, null)
  
  insideResults.value = {
    daysLeft: result.daysLeft,
    daysUsed: 90 - result.daysLeft,
    latestSafeExit: exitResult.latestSafeExit
  }
}
</script>