import { computed, ref } from 'vue'
import { useTripsStore } from '../stores/trips'
import { planTrip, alreadyInside } from '../lib/schengen'
import { getTodayISO } from '../utils/stays'
import type { Stay, PlanResult, InsideResult, PlannerMode } from '../types'

export function usePlanner() {
  const tripsStore = useTripsStore()
  const mode = ref<PlannerMode>(tripsStore.lastMode)
  const referenceDate = ref(getTodayISO())

  const currentStays = computed(() => {
    return tripsStore.currentStays
  })

  const planTripResult = computed(() => {
    if (!currentStays.value.length) {
      return {
        usedOnEntry: 0,
        remainingOnEntry: 90,
        latestExit: referenceDate.value,
        agingOut: [],
        proposed: undefined
      } as PlanResult
    }
    return planTrip(currentStays.value, referenceDate.value)
  })

  const insideResult = computed(() => {
    if (!currentStays.value.length) {
      return {
        usedToday: 0,
        daysLeft: 90,
        latestExit: getTodayISO()
      } as InsideResult
    }
    return alreadyInside(currentStays.value, referenceDate.value)
  })

  const canAddStay = computed(() => {
    if (mode.value === 'plan') {
      return planTripResult.value.remainingOnEntry > 0
    } else {
      return insideResult.value.daysLeft > 0
    }
  })

  const addStay = (stay: Stay) => {
    if (!tripsStore.currentTrip) return
    
    tripsStore.addStay(tripsStore.currentTrip.id, stay)
  }

  const updateStay = (stayIndex: number, updates: Partial<Stay>) => {
    if (!tripsStore.currentTrip) return
    
    tripsStore.updateStay(tripsStore.currentTrip.id, stayIndex, updates)
  }

  const removeStay = (stayIndex: number) => {
    if (!tripsStore.currentTrip) return
    
    tripsStore.removeStay(tripsStore.currentTrip.id, stayIndex)
  }

  const addEmptyStay = () => {
    if (!tripsStore.currentTrip) return
    
    tripsStore.addEmptyStay(tripsStore.currentTrip.id)
  }

  const normalizeStays = () => {
    if (!tripsStore.currentTrip) return
    
    tripsStore.normalizeStays(tripsStore.currentTrip.id)
  }

  const setMode = (newMode: PlannerMode) => {
    mode.value = newMode
    tripsStore.setMode(newMode)
  }

  const setReferenceDate = (date: string) => {
    referenceDate.value = date
  }

  const resetReferenceDate = () => {
    referenceDate.value = getTodayISO()
  }

  const exportStays = (): string => {
    if (!tripsStore.currentTrip) return ''
    return tripsStore.exportJson(tripsStore.currentTrip.id)
  }

  const importStays = (json: string) => {
    if (!tripsStore.currentTrip) return
    tripsStore.importJson(tripsStore.currentTrip.id, json)
  }

  const importBulkText = (text: string) => {
    if (!tripsStore.currentTrip) return
    tripsStore.importBulkText(tripsStore.currentTrip.id, text)
  }

  const clearWarning = () => {
    tripsStore.clearWarning()
  }

  // Create default trip if none exists
  if (!tripsStore.currentTrip && tripsStore.trips.length === 0) {
    const defaultTrip = tripsStore.createTrip('My Schengen Trip')
    tripsStore.setCurrentTrip(defaultTrip.id)
  }

  return {
    mode,
    referenceDate,
    currentStays,
    planTripResult,
    insideResult,
    canAddStay,
    warning: computed(() => tripsStore.warning),
    addStay,
    updateStay,
    removeStay,
    addEmptyStay,
    normalizeStays,
    setMode,
    setReferenceDate,
    resetReferenceDate,
    exportStays,
    importStays,
    importBulkText,
    clearWarning
  }
}