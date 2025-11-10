// Schengen 90/180 day rule calculations
// All dates are handled as Date objects and converted to ISO strings for calculations

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

// Convert Date to ISO date string (YYYY-MM-DD)
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}


// Get all days in a date range (inclusive)
function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

// Normalize date to start of day (midnight)
function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

// Calculate days used in rolling 180-day window
function calculateDaysUsed(stays: Stay[], referenceDate: Date): number {
  // Merge overlapping stays first to avoid double-counting
  const mergedStays = mergeStays(stays)
  
  // Normalize reference date to start of day
  const refDate = normalizeDate(referenceDate)
  const windowStart = new Date(refDate)
  windowStart.setDate(windowStart.getDate() - 179) // 180 days inclusive
  windowStart.setHours(0, 0, 0, 0)
  
  const usedDays = new Set<string>()
  
  for (const stay of mergedStays) {
    if (!stay.entry || !stay.exit) continue
    
    // Normalize stay dates
    const stayEntry = normalizeDate(stay.entry)
    const stayExit = normalizeDate(stay.exit)
    
    // Only count stays that overlap with the rolling window
    const stayStart = stayEntry > windowStart ? stayEntry : windowStart
    const stayEnd = stayExit < refDate ? stayExit : refDate
    
    if (stayStart <= stayEnd) {
      const days = getDaysInRange(stayStart, stayEnd)
      days.forEach(day => usedDays.add(toISODate(day)))
    }
  }
  
  return usedDays.size
}

// Merge overlapping or adjacent stays
function mergeStays(stays: Stay[]): Stay[] {
  if (stays.length === 0) return []
  
  // Filter out invalid stays and sort by entry date
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
      // Merge stays
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

// Calculate latest safe exit date for a planned entry
function calculateLatestSafeExit(stays: Stay[], entryDate: Date): string {
  const mergedStays = mergeStays(stays)
  const normalizedEntry = normalizeDate(entryDate)
  
  // Simulate day by day to find when we'd exceed 90 days
  for (let day = 0; day < 90; day++) {
    const testDate = new Date(normalizedEntry)
    testDate.setDate(testDate.getDate() + day)
    testDate.setHours(0, 0, 0, 0)
    
    const daysUsed = calculateDaysUsed(mergedStays, testDate)
    
    if (daysUsed >= 90) {
      // Go back one day to find the last safe day
      testDate.setDate(testDate.getDate() - 1)
      return toISODate(testDate)
    }
  }
  
  // If we can stay the full 90 days
  const maxExit = new Date(normalizedEntry)
  maxExit.setDate(maxExit.getDate() + 89) // 90 days inclusive
  return toISODate(maxExit)
}

// Main calculation function
export function calculateSchengenStatus(
  pastStays: Stay[],
  plannedEntry: Date | null,
  plannedExit: Date | null
): CalculationResult {
  const today = normalizeDate(new Date())
  
  // Calculate days left today
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
  
  // Normalize planned entry date
  const normalizedPlannedEntry = normalizeDate(plannedEntry)
  
  // Calculate days used on planned entry
  const daysUsedOnEntry = calculateDaysUsed(pastStays, normalizedPlannedEntry)
  const daysRemainingOnEntry = Math.max(0, 90 - daysUsedOnEntry)
  
  // Calculate latest safe exit
  const latestSafeExit = calculateLatestSafeExit(pastStays, normalizedPlannedEntry)
  
  // Check if planned trip is valid
  let tripValid = true
  let requiredExitDate: string | undefined
  let daysRemainingAfterTrip: number | undefined
  
  // Determine what "Days Left in EU" should show
  // If there's a planned exit, show days remaining after the trip
  // Otherwise, show days remaining on the planned entry date
  let daysLeftToShow: number
  
  if (plannedExit) {
    // Normalize planned exit date
    const normalizedPlannedExit = normalizeDate(plannedExit)
    
    // Create a temporary stays array that includes the planned trip
    const staysWithPlannedTrip = [
      ...pastStays.filter(stay => stay.entry && stay.exit),
      { entry: normalizedPlannedEntry, exit: normalizedPlannedExit }
    ]
    
    // Check if the planned exit would exceed 90 days
    const daysUsedOnExit = calculateDaysUsed(staysWithPlannedTrip, normalizedPlannedExit)
    tripValid = daysUsedOnExit <= 90
    
    // Calculate remaining days after the trip
    daysRemainingAfterTrip = Math.max(0, 90 - daysUsedOnExit)
    
    // Days left should show days remaining after the trip
    daysLeftToShow = daysRemainingAfterTrip
  } else {
    // If no exit date provided, use the latest safe exit
    requiredExitDate = latestSafeExit
    // Days left should show days remaining on entry date
    daysLeftToShow = daysRemainingOnEntry
  }
  
  return {
    daysLeft: daysLeftToShow, // Show days remaining relevant to the planned trip
    tripValid,
    daysUsedOnEntry,
    daysRemainingOnEntry,
    latestSafeExit,
    requiredExitDate,
    daysRemainingAfterTrip
  }
}

// Format date for display (11 April 2025 or 11 Prill 2025)
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

// Parse date from dd-MM-yyyy format
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
