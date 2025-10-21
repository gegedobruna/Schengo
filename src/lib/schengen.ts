import { DateTime } from 'luxon'
import type { Stay, SchengenStatus, DateRange } from '../types'

/**
 * Calculate Schengen status for a given date range
 */
export function calculateSchengenStatus(
  stays: Stay[],
  referenceDate: DateTime = DateTime.now()
): SchengenStatus {
  const schengenStays = stays.filter(stay => isSchengenCountry(stay.country))
  
  // Get the 180-day window ending on the reference date
  const windowStart = referenceDate.minus({ days: 179 })
  const windowEnd = referenceDate
  
  // Filter stays within the 180-day window
  const relevantStays = schengenStays.filter(stay => 
    stay.entryDate <= windowEnd && stay.exitDate >= windowStart
  )
  
  // Calculate total days used
  let daysUsed = 0
  for (const stay of relevantStays) {
    const effectiveStart = DateTime.max(stay.entryDate, windowStart)
    const effectiveEnd = DateTime.min(stay.exitDate, windowEnd)
    const duration = effectiveEnd.diff(effectiveStart, 'days').days + 1
    daysUsed += Math.max(0, duration)
  }
  
  const daysRemaining = 90 - daysUsed
  const isCompliant = daysUsed <= 90
  
  // Find next reset date (when the 180-day window will allow more days)
  let nextResetDate: DateTime | null = null
  if (!isCompliant) {
    // Find the earliest date when we'll be compliant again
    for (let i = 1; i <= 180; i++) {
      const testDate = referenceDate.plus({ days: i })
      const testStatus = calculateSchengenStatus(stays, testDate)
      if (testStatus.isCompliant) {
        nextResetDate = testDate
        break
      }
    }
  }
  
  // Generate warnings
  const warnings: string[] = []
  if (daysUsed > 80) {
    warnings.push('You are approaching the 90-day limit')
  }
  if (daysUsed > 90) {
    warnings.push('You have exceeded the 90-day limit')
  }
  if (daysRemaining < 10 && daysRemaining > 0) {
    warnings.push(`Only ${daysRemaining} days remaining in your 180-day window`)
  }
  
  return {
    daysUsed,
    daysRemaining,
    isCompliant,
    nextResetDate,
    warnings
  }
}

/**
 * Check if a country is part of the Schengen area
 */
export function isSchengenCountry(countryCode: string): boolean {
  const schengenCountries = [
    'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT',
    'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'ES',
    'SE', 'CH'
  ]
  return schengenCountries.includes(countryCode.toUpperCase())
}

/**
 * Get the 180-day window for a given date
 */
export function get180DayWindow(referenceDate: DateTime): DateRange {
  return {
    start: referenceDate.minus({ days: 179 }),
    end: referenceDate
  }
}

/**
 * Check if a stay overlaps with any existing stays
 */
export function hasOverlappingStays(
  newStay: Omit<Stay, 'id'>,
  existingStays: Stay[]
): boolean {
  return existingStays.some(stay => 
    (newStay.entryDate <= stay.exitDate && newStay.exitDate >= stay.entryDate)
  )
}

/**
 * Validate a stay entry
 */
export function validateStay(stay: Omit<Stay, 'id'>): string[] {
  const errors: string[] = []
  
  if (stay.entryDate >= stay.exitDate) {
    errors.push('Entry date must be before exit date')
  }
  
  if (stay.duration <= 0) {
    errors.push('Duration must be positive')
  }
  
  if (stay.entryDate < DateTime.now().minus({ years: 10 })) {
    errors.push('Entry date cannot be more than 10 years in the past')
  }
  
  if (stay.exitDate > DateTime.now().plus({ years: 10 })) {
    errors.push('Exit date cannot be more than 10 years in the future')
  }
  
  return errors
}
