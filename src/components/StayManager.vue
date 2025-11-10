<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">Manage Your Stays</h2>
      <div class="flex gap-2">
        <button 
          @click="addNewStay"
          class="btn btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Stay
        </button>
        <button 
          @click="showBulkImport = true"
          class="btn btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Bulk Import
        </button>
        <button 
          @click="exportData"
          class="btn btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Stays List -->
    <div v-if="stays.length === 0" class="text-center py-16 glass-effect rounded-xl">
      <div class="w-20 h-20 bg-cerulean-500/80 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border-2 border-white/30">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-gray-700 font-semibold text-lg mb-6">No stays recorded yet</p>
      <button @click="addNewStay" class="btn btn-primary">
        Add Your First Stay
      </button>
    </div>

    <div v-else class="space-y-4">
      <div v-for="(stay, index) in stays" :key="index" class="glass-effect rounded-xl p-6 transition-all duration-300 hover:bg-white/85 hover:scale-[1.01]">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Entry Date</label>
                <input 
                  type="text" 
                  :value="stay.entry"
                  @input="updateStay(index, 'entry', ($event.target as HTMLInputElement).value)"
                  placeholder="YYYY-MM-DD"
                  class="input mt-1"
                  :class="{ 'input-error': !isValidDate(stay.entry) }"
                />
                <p v-if="!isValidDate(stay.entry)" class="text-xs text-red-600 mt-1">Invalid date format</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Exit Date</label>
                <input 
                  type="text" 
                  :value="stay.exit"
                  @input="updateStay(index, 'exit', ($event.target as HTMLInputElement).value)"
                  placeholder="YYYY-MM-DD"
                  class="input mt-1"
                  :class="{ 'input-error': !isValidDate(stay.exit) }"
                />
                <p v-if="!isValidDate(stay.exit)" class="text-xs text-red-600 mt-1">Invalid date format</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Duration</label>
                <div class="input bg-gray-50 mt-1">
                  {{ calculateStayDuration(stay.entry, stay.exit) }} days
                </div>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-600">
              {{ formatDateRange(stay.entry, stay.exit) }}
            </div>
          </div>
          <div class="ml-4 flex gap-2">
            <button 
              @click="removeStayLocal(index)"
              class="btn btn-sm btn-danger"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="stays.length > 0" class="flex justify-between items-center pt-4 border-t">
      <div class="text-sm text-gray-600">
        {{ stays.length }} stay{{ stays.length === 1 ? '' : 's' }} recorded
      </div>
      <div class="flex gap-2">
        <button 
          @click="validateAndMerge"
          class="btn btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Validate & Merge
        </button>
        <button 
          @click="clearAll"
          class="btn btn-danger"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <!-- Warning Message -->
    <div v-if="warning" class="glass-effect rounded-xl p-6 border-sandy-brown-300/50 transition-all duration-300 hover:bg-white/85">
      <div class="flex">
        <div class="w-10 h-10 bg-sandy-brown-500/80 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 backdrop-blur-sm border-2 border-white/30">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-sandy-brown-800 mb-1">Warning</h3>
          <p class="text-sm text-sandy-brown-700 font-medium">{{ warning }}</p>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <div v-if="showBulkImport" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div class="glass-effect rounded-xl p-6 w-full max-w-2xl shadow-2xl transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bulk Import Stays</h3>
        <p class="text-sm text-gray-600 mb-4">
          Enter dates in format: YYYY-MM-DD → YYYY-MM-DD (one per line)
        </p>
        <textarea 
          v-model="bulkText"
          class="input w-full h-40"
          placeholder="2024-01-01 → 2024-01-10&#10;2024-02-01 → 2024-02-15&#10;2024-03-01 → 2024-03-05"
        ></textarea>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showBulkImport = false" class="btn btn-secondary">Cancel</button>
          <button @click="importBulk" class="btn btn-primary">Import</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DateTime } from 'luxon'
import { usePlanner } from '../composables/usePlanner'
import { calculateStayDuration, formatDateRange, parseBulkStays } from '../utils/stays'
import type { Stay } from '../types'

const { currentStays, addStay, removeStay: removeStayFromStore, normalizeStays, exportStays, warning } = usePlanner()

const stays = ref<Stay[]>([...currentStays.value])
const showBulkImport = ref(false)
const bulkText = ref('')

const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
}

const updateStay = (index: number, field: 'entry' | 'exit', value: string) => {
  if (stays.value[index]) {
    stays.value[index][field] = value
  }
}

const addNewStay = () => {
  const today = DateTime.now().toUTC().toISODate()!
  const tomorrow = DateTime.now().toUTC().plus({ days: 1 }).toISODate()!
  stays.value.push({ entry: today, exit: tomorrow })
}

const removeStayLocal = (index: number) => {
  stays.value.splice(index, 1)
}

const validateAndMerge = () => {
  // Clear current stays and add all local stays
  currentStays.value.forEach((_, index) => {
    removeStayFromStore(index)
  })
  
  // Add all local stays
  stays.value.forEach(stay => {
    addStay(stay)
  })
  
  // Normalize stays
  normalizeStays()
  
  // Update local stays with normalized result
  stays.value = [...currentStays.value]
}

const exportData = () => {
  const json = exportStays()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'schengen-stays.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importBulk = () => {
  if (bulkText.value.trim()) {
    const importedStays = parseBulkStays(bulkText.value)
    stays.value = [...stays.value, ...importedStays]
    showBulkImport.value = false
    bulkText.value = ''
  }
}

const clearAll = () => {
  if (confirm('Are you sure you want to clear all stays?')) {
    stays.value = []
  }
}
</script>
