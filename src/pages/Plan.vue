<template>
  <div class="min-h-screen relative">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">Plan Your Trip</h1>
              <p class="text-white/90 text-lg drop-shadow">Plan your future Schengen area visit</p>
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
