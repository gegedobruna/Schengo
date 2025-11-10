<template>
  <div class="space-y-6">
    <!-- Stay Rows -->
    <div class="space-y-4">
      <div v-for="(stay, index) in stays" :key="index" class="flex items-end gap-4 p-6 glass-effect rounded-xl transition-all duration-300 hover:bg-white/85">
        <div class="flex-1">
          <label class="label">Entry Date</label>
          <input 
            type="date" 
            :value="stay.entry"
            @input="updateStayEntry(index, ($event.target as HTMLInputElement).value)"
            class="input"
            :class="{ 'input-error': getStayErrors(index).entry }"
            :disabled="disabled"
          />
          <p v-if="getStayErrors(index).entry" class="error-message">{{ getStayErrors(index).entry }}</p>
        </div>
        
        <div class="flex-1">
          <label class="label">Exit Date</label>
          <input 
            type="date" 
            :value="stay.exit"
            @input="updateStayExit(index, ($event.target as HTMLInputElement).value)"
            class="input"
            :class="{ 'input-error': getStayErrors(index).exit }"
            :disabled="disabled"
          />
          <p v-if="getStayErrors(index).exit" class="error-message">{{ getStayErrors(index).exit }}</p>
        </div>
        
        <div class="flex-1">
          <label class="label">Duration</label>
          <div class="input bg-gray-50">
            {{ calculateDuration(stay.entry, stay.exit) }} days
          </div>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="addStay"
            class="btn btn-sm btn-primary"
            :disabled="disabled"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add
          </button>
          <button 
            @click="removeStay(index)"
            class="btn btn-sm btn-danger"
            :disabled="disabled || stays.length <= 1"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4">
      <button 
        @click="validateAndMerge"
        class="btn btn-primary"
        :disabled="disabled || stays.length === 0"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Validate & Merge
      </button>
      
      <button 
        @click="exportStays"
        class="btn btn-secondary"
        :disabled="disabled || stays.length === 0"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export JSON
      </button>
      
      <button 
        @click="showImportModal = true"
        class="btn btn-secondary"
        :disabled="disabled"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Import JSON
      </button>
      
      <button 
        @click="showBulkModal = true"
        class="btn btn-secondary"
        :disabled="disabled"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Bulk Import
      </button>
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

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div class="glass-effect rounded-xl p-6 w-full max-w-md shadow-2xl transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Import JSON</h3>
        <textarea 
          v-model="importText"
          class="input w-full h-32"
          placeholder="Paste JSON data here..."
        ></textarea>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showImportModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="importStays" class="btn btn-primary">Import</button>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <div v-if="showBulkModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div class="glass-effect rounded-xl p-6 w-full max-w-2xl shadow-2xl transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bulk Import</h3>
        <p class="text-sm text-gray-600 mb-4">
          Enter dates in format: YYYY-MM-DD → YYYY-MM-DD (one per line)
        </p>
        <textarea 
          v-model="bulkText"
          class="input w-full h-40"
          placeholder="2024-01-01 → 2024-01-10&#10;2024-02-01 → 2024-02-15&#10;..."
        ></textarea>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showBulkModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="importBulk" class="btn btn-primary">Import</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DateTime } from 'luxon'
import { usePlanner } from '../composables/usePlanner'
import { calculateStayDuration, validateStay } from '../utils/stays'
import type { Stay } from '../types'

interface Props {
  disabled?: boolean
}

defineProps<Props>()

const { currentStays, normalizeStays, addStay: addStayToStore, removeStay: removeStayFromStore, exportStays: exportStaysFromStore, importStays: importStaysFromStore, importBulkText, warning } = usePlanner()

const stays = ref<Stay[]>([...currentStays.value])
const showImportModal = ref(false)
const showBulkModal = ref(false)
const importText = ref('')
const bulkText = ref('')

// Watch for changes in currentStays and update local stays
watch(() => currentStays.value, (newStays) => {
  stays.value = [...newStays]
}, { deep: true })

const calculateDuration = (entry: string, exit: string): number => {
  return calculateStayDuration(entry, exit)
}

const getStayErrors = (index: number) => {
  const stay = stays.value[index]
  if (!stay) return { entry: '', exit: '' }
  
  const errors = validateStay(stay)
  return {
    entry: errors.find(e => e.includes('entry')) || '',
    exit: errors.find(e => e.includes('exit')) || ''
  }
}

const updateStayEntry = (index: number, value: string) => {
  if (stays.value[index]) {
    stays.value[index].entry = value
  }
}

const updateStayExit = (index: number, value: string) => {
  if (stays.value[index]) {
    stays.value[index].exit = value
  }
}

const addStay = () => {
  const today = DateTime.now().toUTC().toISODate()!
  const tomorrow = DateTime.now().toUTC().plus({ days: 1 }).toISODate()!
  stays.value.push({ entry: today, exit: tomorrow })
}

const removeStay = (index: number) => {
  if (stays.value.length > 1) {
    stays.value.splice(index, 1)
  }
}

const validateAndMerge = () => {
  // Clear current stays and add all local stays to the store
  // First, clear the current trip's stays
  if (currentStays.value.length > 0) {
    // Remove all current stays
    for (let i = currentStays.value.length - 1; i >= 0; i--) {
      removeStayFromStore(i)
    }
  }
  
  // Add all local stays to the store
  stays.value.forEach(stay => {
    addStayToStore(stay)
  })
  
  // Normalize stays in the store
  normalizeStays()
  
  // Update local stays with normalized result
  stays.value = [...currentStays.value]
}

const exportStays = () => {
  const json = exportStaysFromStore()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'schengen-stays.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importStays = () => {
  if (importText.value.trim()) {
    importStaysFromStore(importText.value)
    stays.value = [...currentStays.value]
    showImportModal.value = false
    importText.value = ''
  }
}

const importBulk = () => {
  if (bulkText.value.trim()) {
    importBulkText(bulkText.value)
    stays.value = [...currentStays.value]
    showBulkModal.value = false
    bulkText.value = ''
  }
}
</script>