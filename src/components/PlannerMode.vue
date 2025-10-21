<template>
  <div class="space-y-6">
    <!-- Status Overview -->
    <div class="grid md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="text-3xl font-bold text-primary-600 mb-2">
          {{ schengenStatus.daysUsed }}
        </div>
        <div class="text-sm text-gray-600">Days Used</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-schengen-600 mb-2">
          {{ schengenStatus.daysRemaining }}
        </div>
        <div class="text-sm text-gray-600">Days Remaining</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold mb-2" :class="schengenStatus.isCompliant ? 'text-green-600' : 'text-red-600'">
          {{ schengenStatus.isCompliant ? '✓' : '✗' }}
        </div>
        <div class="text-sm text-gray-600">Compliant</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm text-gray-600">
        <span>Days used in 180-day window</span>
        <span>{{ schengenStatus.daysUsed }}/90</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div 
          class="h-3 rounded-full transition-all duration-300"
          :class="progressBarClass"
          :style="{ width: `${Math.min((schengenStatus.daysUsed / 90) * 100, 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="schengenStatus.warnings.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-yellow-800">Warnings</h3>
          <ul class="mt-1 text-sm text-yellow-700 list-disc list-inside">
            <li v-for="warning in schengenStatus.warnings" :key="warning">{{ warning }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Add Stay Form -->
    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Stay</h3>
      <StayEditor @save="handleAddStay" :disabled="!canAddStay" />
    </div>

    <!-- Stays List -->
    <div v-if="currentStays.length > 0" class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Stays</h3>
      <div class="space-y-3">
        <div v-for="stay in currentStays" :key="stay.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <h4 class="font-medium text-gray-900">{{ stay.country }}</h4>
              <span class="ml-2 badge badge-info">{{ stay.duration }} days</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ formatDateRange(stay.entryDate, stay.exitDate) }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="handleEditStay(stay)"
              class="btn btn-sm btn-secondary"
            >
              Edit
            </button>
            <button 
              @click="handleRemoveStay(stay.id)"
              class="btn btn-sm btn-danger"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500">No stays recorded yet. Add your first stay above.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlanner } from '../composables/usePlanner'
import { formatDateRange } from '../utils/stays'
import StayEditor from './StayEditor.vue'
import type { Stay } from '../types'

const { currentStays, schengenStatus, canAddStay, addStay, removeStay } = usePlanner()

const progressBarClass = computed(() => {
  const percentage = (schengenStatus.value.daysUsed / 90) * 100
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

const handleAddStay = (stay: Omit<Stay, 'id'>) => {
  addStay(stay)
}

const handleEditStay = (stay: Stay) => {
  // TODO: Implement edit functionality
  console.log('Edit stay:', stay)
}

const handleRemoveStay = (stayId: string) => {
  if (confirm('Are you sure you want to remove this stay?')) {
    removeStay(stayId)
  }
}
</script>
