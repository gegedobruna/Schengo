import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DateTime } from 'luxon'
import type { Trip, Stay } from '../types'

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([])
  const currentTripId = ref<string | null>(null)

  const currentTrip = computed(() => {
    if (!currentTripId.value) return null
    return trips.value.find(trip => trip.id === currentTripId.value) || null
  })

  const createTrip = (name: string): Trip => {
    const trip: Trip = {
      id: DateTime.now().toMillis().toString(),
      name,
      stays: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now()
    }
    trips.value.push(trip)
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
    }
  }

  const deleteTrip = (tripId: string) => {
    const tripIndex = trips.value.findIndex(trip => trip.id === tripId)
    if (tripIndex !== -1) {
      trips.value.splice(tripIndex, 1)
      if (currentTripId.value === tripId) {
        currentTripId.value = null
      }
    }
  }

  const addStay = (tripId: string, stay: Omit<Stay, 'id'>) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      const newStay: Stay = {
        ...stay,
        id: DateTime.now().toMillis().toString()
      }
      trip.stays.push(newStay)
      trip.updatedAt = DateTime.now()
    }
  }

  const updateStay = (tripId: string, stayId: string, updates: Partial<Omit<Stay, 'id'>>) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      const stayIndex = trip.stays.findIndex(s => s.id === stayId)
      if (stayIndex !== -1) {
        trip.stays[stayIndex] = { ...trip.stays[stayIndex], ...updates }
        trip.updatedAt = DateTime.now()
      }
    }
  }

  const removeStay = (tripId: string, stayId: string) => {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      const stayIndex = trip.stays.findIndex(s => s.id === stayId)
      if (stayIndex !== -1) {
        trip.stays.splice(stayIndex, 1)
        trip.updatedAt = DateTime.now()
      }
    }
  }

  const setCurrentTrip = (tripId: string | null) => {
    currentTripId.value = tripId
  }

  return {
    trips,
    currentTripId,
    currentTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    addStay,
    updateStay,
    removeStay,
    setCurrentTrip
  }
})
