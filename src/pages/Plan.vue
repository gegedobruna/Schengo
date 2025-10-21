<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
              <p class="text-gray-600 mt-2">Add and manage your Schengen area stays</p>
            </div>
            <RouterLink to="/" class="btn btn-secondary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </RouterLink>
          </div>
        </div>

        <!-- Status Card -->
        <div class="card mb-8">
          <div class="card-header">
            <h2 class="card-title">Current Status</h2>
          </div>
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
          
          <!-- Warnings -->
          <div v-if="schengenStatus.warnings.length > 0" class="mt-6">
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
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
          </div>
        </div>

        <!-- Add Stay Form -->
        <div class="card mb-8">
          <div class="card-header">
            <h2 class="card-title">Add New Stay</h2>
          </div>
          <StayEditor @save="handleAddStay" :disabled="!canAddStay" />
        </div>

        <!-- Stays List -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Your Stays</h2>
          </div>
          <div v-if="currentStays.length === 0" class="text-center py-12">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-gray-500">No stays recorded yet. Add your first stay above.</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="stay in currentStays" :key="stay.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h3 class="text-lg font-medium text-gray-900">{{ stay.country }}</h3>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlanner } from '../composables/usePlanner'
import { useTripsStore } from '../stores/trips'
import { formatDateRange } from '../utils/stays'
import StayEditor from '../components/StayEditor.vue'
import type { Stay } from '../types'

const { currentStays, schengenStatus, canAddStay, addStay, removeStay } = usePlanner()
const tripsStore = useTripsStore()

// Create a default trip if none exists
if (!tripsStore.currentTrip) {
  tripsStore.createTrip('My Schengen Trip')
  tripsStore.setCurrentTrip(tripsStore.trips[0]?.id || null)
}

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
