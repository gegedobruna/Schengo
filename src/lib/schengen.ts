import { DateTime } from 'luxon'
import type { Stay, PlanResult, InsideResult, AgingOutEvent, NormalizeResult } from '../types'

/**
 * Calculate inclusive days between two dates (both dates count as full days)
 * @param aISO Start date in ISO format (YYYY-MM-DD)
 * @param bISO End date in ISO format (YYYY-MM-DD)
 * @returns Number of inclusive days
 */
export function daysInclusive(aISO: string, bISO: string): number {
  const start = DateTime.fromISO(aISO, { zone: 'utc' })
  const end = DateTime.fromISO(bISO, { zone: 'utc' })
  
  if (!start.isValid || !end.isValid) return 0
  if (end < start) return 0
  
  return end.diff(start, 'days').days + 1
}

/**
 * Check if two stays are adjacent (next entry <= prev exit + 1 day)
 * @param a First stay
 * @param b Second stay
 * @returns True if adjacent
 */
export function areAdjacent(a: Stay, b: Stay): boolean {
  const aExit = DateTime.fromISO(a.exit, { zone: 'utc' })
  const bEntry = DateTime.fromISO(b.entry, { zone: 'utc' })
  
  if (!aExit.isValid || !bEntry.isValid) return false
  
  return bEntry <= aExit.plus({ days: 1 })
}

/**
 * Normalize stays by sorting and merging overlaps/adjacent ranges
 * @param input Array of stays to normalize
 * @returns Normalized stays with optional warning
 */
export function normalizeStays(input: Stay[]): NormalizeResult {
  const validStays: Stay[] = []
  const warnings: string[] = []
  
  // Filter valid stays and collect warnings
  for (const stay of input) {
    const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
    const exit = DateTime.fromISO(stay.exit, { zone: 'utc' })
    
    if (!entry.isValid || !exit.isValid) {
      warnings.push(`Invalid date in stay: ${stay.entry} to ${stay.exit}`)
      continue
    }
    
    if (exit < entry) {
      warnings.push(`Exit date before entry date: ${stay.entry} to ${stay.exit}`)
      continue
    }
    
    validStays.push(stay)
  }
  
  if (validStays.length === 0) {
    return { stays: [], warning: warnings.length > 0 ? warnings.join('; ') : undefined }
  }
  
  // Sort by entry date
  const sorted = [...validStays].sort((a, b) => 
    DateTime.fromISO(a.entry, { zone: 'utc' }).toMillis() - 
    DateTime.fromISO(b.entry, { zone: 'utc' }).toMillis()
  )
  
  // Merge overlapping and adjacent stays
  const merged: Stay[] = []
  let current = { ...sorted[0] }
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    const currentExit = DateTime.fromISO(current.exit, { zone: 'utc' })
    const nextEntry = DateTime.fromISO(next.entry, { zone: 'utc' })
    const nextExit = DateTime.fromISO(next.exit, { zone: 'utc' })
    
    // Check if overlapping or adjacent
    if (nextEntry <= currentExit.plus({ days: 1 })) {
      // Merge: extend current stay to the later exit date
      if (nextExit > currentExit) {
        current.exit = next.exit
      }
    } else {
      // No overlap/adjacency: add current and start new
      merged.push(current)
      current = { ...next }
    }
  }
  
  // Add the last stay
  merged.push(current)
  
  const warning = warnings.length > 0 ? warnings.join('; ') : undefined
  return { stays: merged, warning }
}

/**
 * Calculate used days in the rolling 180-day window ending on reference date
 * @param stays Array of normalized stays
 * @param refISO Reference date in ISO format (YYYY-MM-DD)
 * @returns Number of used days in [ref-179, ref] window
 */
export function usedOn(stays: Stay[], refISO: string): number {
  const refDate = DateTime.fromISO(refISO, { zone: 'utc' })
  if (!refDate.isValid) return 0
  
  const windowStart = refDate.minus({ days: 179 })
  const windowEnd = refDate
  
  let totalDays = 0
  
  for (const stay of stays) {
    const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
    const exit = DateTime.fromISO(stay.exit, { zone: 'utc' })
    
    if (!entry.isValid || !exit.isValid) continue
    
    // Find overlap with 180-day window
    const overlapStart = DateTime.max(entry, windowStart)
    const overlapEnd = DateTime.min(exit, windowEnd)
    
    if (overlapStart <= overlapEnd) {
      totalDays += daysInclusive(overlapStart.toISODate()!, overlapEnd.toISODate()!)
    }
  }
  
  return totalDays
}

/**
 * Find the latest safe continuous exit date for a given entry date
 * @param stays Array of normalized stays
 * @param entryISO Entry date in ISO format (YYYY-MM-DD)
 * @returns Latest safe exit date in ISO format
 */
export function latestSafeExit(stays: Stay[], entryISO: string): string {
  const entry = DateTime.fromISO(entryISO, { zone: 'utc' })
  if (!entry.isValid) return entryISO
  
  // Simulate day by day forward from entry
  let currentDate = entry
  let maxDays = 90
  
  while (true) {
    const usedOnCurrent = usedOn(stays, currentDate.toISODate()!)
    
    if (usedOnCurrent >= maxDays) {
      // This day would exceed the limit, so previous day was the last safe day
      return currentDate.minus({ days: 1 }).toISODate()!
    }
    
    // Check if we can continue one more day
    const nextDay = currentDate.plus({ days: 1 })
    const usedOnNext = usedOn(stays, nextDay.toISODate()!)
    
    if (usedOnNext >= maxDays) {
      // Next day would exceed, so current day is the last safe day
      return currentDate.toISODate()!
    }
    
    currentDate = nextDay
  }
}

/**
 * Generate aging-out schedule showing when days drop out of the 180-day window
 * @param stays Array of normalized stays
 * @param refISO Reference date in ISO format (YYYY-MM-DD)
 * @returns Array of aging-out events
 */
export function agingOutSchedule(stays: Stay[], refISO: string): AgingOutEvent[] {
  const refDate = DateTime.fromISO(refISO, { zone: 'utc' })
  if (!refDate.isValid) return []
  
  const dropEvents = new Map<string, number>()
  
  // For each stay, calculate when each day will drop out
  for (const stay of stays) {
    const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
    const exit = DateTime.fromISO(stay.exit, { zone: 'utc' })
    
    if (!entry.isValid || !exit.isValid) continue
    
    // Each day in the stay drops out 180 days later
    let currentDay = entry
    while (currentDay <= exit) {
      const dropDate = currentDay.plus({ days: 180 })
      const dropDateISO = dropDate.toISODate()!
      
      dropEvents.set(dropDateISO, (dropEvents.get(dropDateISO) || 0) + 1)
      currentDay = currentDay.plus({ days: 1 })
    }
  }
  
  // Convert to array and sort by date
  return Array.from(dropEvents.entries())
    .map(([dropDateISO, daysRegained]) => ({ dropDateISO, daysRegained }))
    .sort((a, b) => a.dropDateISO.localeCompare(b.dropDateISO))
}

/**
 * Plan a future trip
 * @param stays Array of normalized stays
 * @param entryISO Planned entry date
 * @param proposedExitISO Optional proposed exit date
 * @returns Planning results
 */
export function planTrip(stays: Stay[], entryISO: string, proposedExitISO?: string): PlanResult {
  const usedOnEntry = usedOn(stays, entryISO)
  const remainingOnEntry = Math.max(0, 90 - usedOnEntry)
  const latestExit = latestSafeExit(stays, entryISO)
  const agingOut = agingOutSchedule(stays, entryISO).slice(0, 10)
  
  let proposed: { ok: boolean; firstIllegal?: string } | null = null
  
  if (proposedExitISO) {
    const proposedEntry = DateTime.fromISO(entryISO, { zone: 'utc' })
    const proposedExit = DateTime.fromISO(proposedExitISO, { zone: 'utc' })
    
    if (proposedEntry.isValid && proposedExit.isValid && proposedExit >= proposedEntry) {
      // Check each day of the proposed stay
      let currentDay = proposedEntry
      let foundIllegal = false
      
      while (currentDay <= proposedExit && !foundIllegal) {
        const usedOnDay = usedOn(stays, currentDay.toISODate()!)
        if (usedOnDay >= 90) {
          proposed = { ok: false, firstIllegal: currentDay.toISODate()! }
          foundIllegal = true
        }
        currentDay = currentDay.plus({ days: 1 })
      }
      
      if (!foundIllegal) {
        proposed = { ok: true }
      }
    } else {
      proposed = { ok: false, firstIllegal: proposedExitISO }
    }
  }
  
  return {
    usedOnEntry,
    remainingOnEntry,
    latestExit,
    agingOut: agingOut.map(event => ({ date: event.dropDateISO, days: event.daysRegained })),
    proposed: proposed || undefined
  }
}

/**
 * Calculate status for someone already inside Schengen
 * @param stays Array of normalized stays
 * @param actualEntryISO Actual entry date of current stay
 * @returns Inside status results
 */
export function alreadyInside(stays: Stay[], actualEntryISO: string): InsideResult {
  const today = DateTime.now().toUTC().toISODate()!
  const usedToday = usedOn(stays, today)
  const daysLeft = Math.max(0, 90 - usedToday)
  const latestExit = latestSafeExit(stays, actualEntryISO)
  
  return {
    usedToday,
    daysLeft,
    latestExit
  }
}

/**
 * Check if a country is part of the Schengen area
 * @param countryCode Two-letter country code
 * @returns True if Schengen country
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
 * Get the 180-day window for a given reference date
 * @param refISO Reference date in ISO format
 * @returns Date range object
 */
export function get180DayWindow(refISO: string): { start: DateTime; end: DateTime } {
  const refDate = DateTime.fromISO(refISO, { zone: 'utc' })
  return {
    start: refDate.minus({ days: 179 }),
    end: refDate
  }
}