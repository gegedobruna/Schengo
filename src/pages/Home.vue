<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Schengen 90/180 Planner
          </h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Plan your travels within the Schengen area while staying compliant with the 90/180 day rule.
            Track your stays, monitor your remaining days, and never worry about overstaying.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div class="card">
            <div class="text-center">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Your Stays</h3>
              <p class="text-gray-600">Record all your Schengen area visits with entry and exit dates.</p>
            </div>
          </div>

          <div class="card">
            <div class="text-center">
              <div class="w-12 h-12 bg-schengen-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-schengen-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">90/180 Rule</h3>
              <p class="text-gray-600">Automatic calculation of your remaining days within any 180-day period.</p>
            </div>
          </div>

          <div class="card">
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Compliance Check</h3>
              <p class="text-gray-600">Real-time validation to ensure you never exceed the 90-day limit.</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center">
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/plan" class="btn btn-primary btn-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Plan New Trip
            </RouterLink>
            <RouterLink to="/inside" class="btn btn-secondary btn-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              I'm Already Inside
            </RouterLink>
          </div>
        </div>

        <!-- Info Section -->
        <div class="mt-16 card">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">About the 90/180 Rule</h2>
          <div class="prose max-w-none">
            <p class="text-gray-600 mb-4">
              The Schengen 90/180 rule means that you can stay in the Schengen area for a maximum of 90 days 
              within any 180-day period. This rule applies to non-EU citizens who don't need a visa to enter 
              the Schengen area.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Key Points:</h3>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                  <li>90 days maximum in any 180-day period</li>
                  <li>Days are counted from your first entry</li>
                  <li>Includes all Schengen countries</li>
                  <li>Reset happens automatically after 180 days</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Schengen Countries:</h3>
                <p class="text-gray-600 text-sm">
                  Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, 
                  Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, 
                  Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, Switzerland
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page component
</script>
