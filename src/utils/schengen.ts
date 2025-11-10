export interface Stay {
  entry: Date | null
  exit: Date | null
}

export interface CalculationResult {
  daysLeft: number
  tripValid: boolean
  daysUsedOnEntry: number
  daysRemainingOnEntry: number
  latestSafeExit: string
  requiredExitDate?: string
  daysRemainingAfterTrip?: number
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Calculates days used within a rolling 180-day window ending on the reference date.
 * The window includes the reference date and the 179 days before it (180 days total).
 * Uses a Set to automatically handle overlapping stays without double-counting.
 */
function calculateDaysUsed(stays: Stay[], referenceDate: Date): number {
  const mergedStays = mergeStays(stays)
  
  const refDate = normalizeDate(referenceDate)
  const windowStart = new Date(refDate)
  windowStart.setDate(windowStart.getDate() - 179) // 180 days inclusive
  windowStart.setHours(0, 0, 0, 0)
  
  const usedDays = new Set<string>()
  
  for (const stay of mergedStays) {
    if (!stay.entry || !stay.exit) continue
    
    const stayEntry = normalizeDate(stay.entry)
    const stayExit = normalizeDate(stay.exit)
    
    // Only count the portion of the stay that falls within the 180-day window
    const stayStart = stayEntry > windowStart ? stayEntry : windowStart
    const stayEnd = stayExit < refDate ? stayExit : refDate
    
    if (stayStart <= stayEnd) {
      const days = getDaysInRange(stayStart, stayEnd)
      days.forEach(day => usedDays.add(toISODate(day)))
    }
  }
  
  return usedDays.size
}

/**
 * Merges overlapping or adjacent stays to prevent double-counting days.
 * Two stays are considered adjacent if the next stay starts on or before
 * the day after the current stay ends (e.g., Jan 1-5 and Jan 6-10 merge into Jan 1-10).
 */
function mergeStays(stays: Stay[]): Stay[] {
  if (stays.length === 0) return []
  
  const validStays = stays
    .filter(stay => stay.entry && stay.exit && stay.entry <= stay.exit)
    .sort((a, b) => a.entry!.getTime() - b.entry!.getTime())
  
  if (validStays.length === 0) return []
  
  const merged: Stay[] = []
  let current = { ...validStays[0] }
  
  for (let i = 1; i < validStays.length; i++) {
    const next = validStays[i]
    
    // Check if stays overlap or are adjacent (next day)
    const nextDay = new Date(current.exit!)
    nextDay.setDate(nextDay.getDate() + 1)
    
    if (next.entry! <= nextDay) {
      // Merge stays by extending the exit date if needed
      if (next.exit! > current.exit!) {
        current.exit = next.exit
      }
    } else {
      // No overlap, add current and start new
      merged.push(current)
      current = { ...next }
    }
  }
  
  merged.push(current)
  return merged
}

/**
 * Finds the latest safe exit date by simulating day-by-day forward from entry.
 * Tests each day to see if staying until that day would exceed the 90-day limit.
 * Returns the last day before the limit would be exceeded, or entry + 89 days if full 90 days are available.
 */
function calculateLatestSafeExit(stays: Stay[], entryDate: Date): string {
  const mergedStays = mergeStays(stays)
  const normalizedEntry = normalizeDate(entryDate)
  
  for (let day = 0; day < 90; day++) {
    const testDate = new Date(normalizedEntry)
    testDate.setDate(testDate.getDate() + day)
    testDate.setHours(0, 0, 0, 0)
    
    const daysUsed = calculateDaysUsed(mergedStays, testDate)
    
    if (daysUsed >= 90) {
      // This day would exceed the limit, so the previous day was the last safe day
      testDate.setDate(testDate.getDate() - 1)
      return toISODate(testDate)
    }
  }
  
  // Can stay the full 90 days
  const maxExit = new Date(normalizedEntry)
  maxExit.setDate(maxExit.getDate() + 89) // 90 days inclusive
  return toISODate(maxExit)
}

/**
 * Main calculation function for Schengen status.
 * 
 * The "Days Left" value shown depends on context:
 * - If exit date provided: shows days remaining AFTER the planned trip
 * - If no exit date: shows days remaining ON the planned entry date
 * 
 * This ensures users see the most relevant information for their situation.
 */
export function calculateSchengenStatus(
  pastStays: Stay[],
  plannedEntry: Date | null,
  plannedExit: Date | null
): CalculationResult {
  const today = normalizeDate(new Date())
  
  const daysUsedToday = calculateDaysUsed(pastStays, today)
  const daysLeft = Math.max(0, 90 - daysUsedToday)
  
  if (!plannedEntry) {
    return {
      daysLeft,
      tripValid: false,
      daysUsedOnEntry: 0,
      daysRemainingOnEntry: 90,
      latestSafeExit: toISODate(today)
    }
  }
  
  const normalizedPlannedEntry = normalizeDate(plannedEntry)
  const daysUsedOnEntry = calculateDaysUsed(pastStays, normalizedPlannedEntry)
  const daysRemainingOnEntry = Math.max(0, 90 - daysUsedOnEntry)
  const latestSafeExit = calculateLatestSafeExit(pastStays, normalizedPlannedEntry)
  
  let tripValid = true
  let requiredExitDate: string | undefined
  let daysRemainingAfterTrip: number | undefined
  let daysLeftToShow: number
  
  if (plannedExit) {
    // User provided exit date - check if trip is valid and show days after trip
    const normalizedPlannedExit = normalizeDate(plannedExit)
    
    // Include the planned trip in calculation to check if it would exceed limit
    const staysWithPlannedTrip = [
      ...pastStays.filter(stay => stay.entry && stay.exit),
      { entry: normalizedPlannedEntry, exit: normalizedPlannedExit }
    ]
    
    const daysUsedOnExit = calculateDaysUsed(staysWithPlannedTrip, normalizedPlannedExit)
    tripValid = daysUsedOnExit <= 90
    daysRemainingAfterTrip = Math.max(0, 90 - daysUsedOnExit)
    daysLeftToShow = daysRemainingAfterTrip
  } else {
    // No exit date - show days available on entry date and provide latest safe exit
    requiredExitDate = latestSafeExit
    daysLeftToShow = daysRemainingOnEntry
  }
  
  return {
    daysLeft: daysLeftToShow,
    tripValid,
    daysUsedOnEntry,
    daysRemainingOnEntry,
    latestSafeExit,
    requiredExitDate,
    daysRemainingAfterTrip
  }
}

export function formatDate(date: Date, locale: string = 'en'): string {
  const day = date.getDate()
  const year = date.getFullYear()
  
  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    sq: ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
         'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor']
  }
  
  const monthName = monthNames[locale as keyof typeof monthNames]?.[date.getMonth()] || monthNames.en[date.getMonth()]
  
  return `${day} ${monthName} ${year}`
}

export function parseDate(dateString: string): Date | null {
  const parts = dateString.split('-')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const year = parseInt(parts[2], 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  const date = new Date(year, month, day)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null // Invalid date
  }
  
  return date
}
