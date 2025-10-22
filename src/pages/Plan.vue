<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
              <p class="text-gray-600 mt-2">Plan your future Schengen area visit</p>
            </div>
            <RouterLink to="/" class="btn btn-secondary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </RouterLink>
          </div>
        </div>

        <!-- Planner Mode Component -->
        <PlannerMode />
        
        <!-- Stay Management -->
        <div class="mt-8">
          <StayManager />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlannerMode from '../components/PlannerMode.vue'
import StayManager from '../components/StayManager.vue'
</script>
