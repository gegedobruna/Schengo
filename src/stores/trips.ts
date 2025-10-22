import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DateTime } from 'luxon'
import type { Trip, Stay } from '../types'
import { exportStaysToJSON, importStaysFromJSON, normalizeAndValidateStays } from '../utils/stays'

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([])
  const currentTripId = ref<string | null>(null)
  const warning = ref<string>('')
  const lastMode = ref<'plan' | 'inside'>('plan')

  const currentTrip = computed(() => {
    if (!currentTripId.value) return null
    return trips.value.find(trip => trip.id === currentTripId.value) || null
  })

  const currentStays = computed(() => {
    return currentTrip.value?.stays || []
  })

  // Load from localStorage on initialization
  const load = () => {
    try {
      const stored = localStorage.getItem('schengo-trips')
      if (stored) {
        const data = JSON.parse(stored)
        trips.value = data.trips || []
        currentTripId.value = data.currentTripId || null
        lastMode.value = data.lastMode || 'plan'
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  // Save to localStorage
  const save = () => {
    try {
      const data = {
        trips: trips.value,
        currentTripId: currentTripId.value,
        lastMode: lastMode.value
      }
      localStorage.setItem('schengo-trips', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const createTrip = (name: string): Trip => {
    const trip: Trip = {
      id: DateTime.now().toMillis().toString(),
      name,
      stays: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now()
    }
    trips.value.push(trip)
    save()
    return trip
  }

  const updateTrip = (tripId: string, updates: Partial<Omit<Trip, 'id' | 'createdAt'>>) => {
    const tripIndex = trips.value.findIndex(trip => trip.id === tripId)
    if (tripIndex !== -1) {
      trips.value[tripIndex] = {
        ...trips.value[tripIndex],
        ...updates,
        updatedAt: DateTime.now()
      }
      save()
    }
  }

  const deleteTrip = (tripId: string) => {
    const tripIndex = trips.value.findIndex(trip => trip.id === tripId)
    if (tripIndex !== -1) {
      trips.value.splice(tripIndex, 1)
      if (currentTripId.value === tripId) {
        currentTripId.value = null
      }
      save()
    }
  }

  const addStay = (tripId: string, stay: Stay) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      trip.stays.push(stay)
      trip.updatedAt = DateTime.now()
      save()
    }
  }

  const updateStay = (tripId: string, stayIndex: number, updates: Partial<Stay>) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip && trip.stays[stayIndex]) {
      trip.stays[stayIndex] = { ...trip.stays[stayIndex], ...updates }
      trip.updatedAt = DateTime.now()
      save()
    }
  }

  const removeStay = (tripId: string, stayIndex: number) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip && trip.stays[stayIndex]) {
      trip.stays.splice(stayIndex, 1)
      trip.updatedAt = DateTime.now()
      save()
    }
  }

  const setCurrentTrip = (tripId: string | null) => {
    currentTripId.value = tripId
    save()
  }

  const setMode = (mode: 'plan' | 'inside') => {
    lastMode.value = mode
    save()
  }

  const addEmptyStay = (tripId: string) => {
    const today = DateTime.now().toUTC().toISODate()!
    const tomorrow = DateTime.now().toUTC().plus({ days: 1 }).toISODate()!
    addStay(tripId, { entry: today, exit: tomorrow })
  }

  const normalizeStays = (tripId: string) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip) return

    const result = normalizeAndValidateStays(trip.stays)
    trip.stays = result.stays
    trip.updatedAt = DateTime.now()
    warning.value = result.warning || ''
    save()
  }

  const exportJson = (tripId: string): string => {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip) return ''
    return exportStaysToJSON(trip.stays)
  }

  const importJson = (tripId: string, json: string) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip) return

    const importedStays = importStaysFromJSON(json)
    if (importedStays.length > 0) {
      trip.stays = importedStays
      trip.updatedAt = DateTime.now()
      save()
    }
  }

  const importBulkText = (tripId: string, text: string) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip) return

    const { parseBulkStays } = require('../utils/stays')
    const importedStays = parseBulkStays(text)
    if (importedStays.length > 0) {
      trip.stays = [...trip.stays, ...importedStays]
      trip.updatedAt = DateTime.now()
      save()
    }
  }

  const clearWarning = () => {
    warning.value = ''
  }

  // Initialize on store creation
  load()

  return {
    trips,
    currentTripId,
    currentTrip,
    currentStays,
    warning,
    lastMode,
    createTrip,
    updateTrip,
    deleteTrip,
    addStay,
    updateStay,
    removeStay,
    setCurrentTrip,
    setMode,
    addEmptyStay,
    normalizeStays,
    exportJson,
    importJson,
    importBulkText,
    clearWarning,
    load,
    save
  }
})