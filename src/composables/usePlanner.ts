import { computed, ref } from 'vue'
import { DateTime } from 'luxon'
import { useTripsStore } from '../stores/trips'
import { calculateSchengenStatus, isSchengenCountry } from '../lib/schengen'
import type { Stay, SchengenStatus, PlannerMode } from '../types'

export function usePlanner() {
  const tripsStore = useTripsStore()
  const mode = ref<PlannerMode>('plan')
  const referenceDate = ref(DateTime.now())

  const currentStays = computed(() => {
    if (!tripsStore.currentTrip) return []
    return tripsStore.currentTrip.stays
  })

  const schengenStays = computed(() => {
    return currentStays.value.filter(stay => isSchengenCountry(stay.country))
  })

  const schengenStatus = computed((): SchengenStatus => {
    return calculateSchengenStatus(schengenStays.value, referenceDate.value)
  })

  const canAddStay = computed(() => {
    return schengenStatus.value.isCompliant
  })

  const addStay = (stay: Omit<Stay, 'id'>) => {
    if (!tripsStore.currentTrip) return
    
    const duration = stay.exitDate.diff(stay.entryDate, 'days').days + 1
    const stayWithDuration = { ...stay, duration }
    
    tripsStore.addStay(tripsStore.currentTrip.id, stayWithDuration)
  }

  const updateStay = (stayId: string, updates: Partial<Omit<Stay, 'id'>>) => {
    if (!tripsStore.currentTrip) return
    
    if (updates.entryDate && updates.exitDate) {
      const duration = updates.exitDate.diff(updates.entryDate, 'days').days + 1
      updates.duration = duration
    }
    
    tripsStore.updateStay(tripsStore.currentTrip.id, stayId, updates)
  }

  const removeStay = (stayId: string) => {
    if (!tripsStore.currentTrip) return
    tripsStore.removeStay(tripsStore.currentTrip.id, stayId)
  }

  const setMode = (newMode: PlannerMode) => {
    mode.value = newMode
  }

  const setReferenceDate = (date: DateTime) => {
    referenceDate.value = date
  }

  const resetReferenceDate = () => {
    referenceDate.value = DateTime.now()
  }

  return {
    mode,
    referenceDate,
    currentStays,
    schengenStays,
    schengenStatus,
    canAddStay,
    addStay,
    updateStay,
    removeStay,
    setMode,
    setReferenceDate,
    resetReferenceDate
  }
}
