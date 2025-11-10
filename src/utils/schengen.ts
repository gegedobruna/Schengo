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
    
    const stayStart = stayEntry > windowStart ? stayEntry : windowStart
    const stayEnd = stayExit < refDate ? stayExit : refDate
    
    if (stayStart <= stayEnd) {
      const days = getDaysInRange(stayStart, stayEnd)
      days.forEach(day => usedDays.add(toISODate(day)))
    }
  }
  
  return usedDays.size
}

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

function calculateLatestSafeExit(stays: Stay[], entryDate: Date): string {
  const mergedStays = mergeStays(stays)
  const normalizedEntry = normalizeDate(entryDate)
  
  for (let day = 0; day < 90; day++) {
    const testDate = new Date(normalizedEntry)
    testDate.setDate(testDate.getDate() + day)
    testDate.setHours(0, 0, 0, 0)
    
    const daysUsed = calculateDaysUsed(mergedStays, testDate)
    
    if (daysUsed >= 90) {
      testDate.setDate(testDate.getDate() - 1)
      return toISODate(testDate)
    }
  }
  
  const maxExit = new Date(normalizedEntry)
  maxExit.setDate(maxExit.getDate() + 89) // 90 days inclusive
  return toISODate(maxExit)
}

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
    const normalizedPlannedExit = normalizeDate(plannedExit)
    
    const staysWithPlannedTrip = [
      ...pastStays.filter(stay => stay.entry && stay.exit),
      { entry: normalizedPlannedEntry, exit: normalizedPlannedExit }
    ]
    
    const daysUsedOnExit = calculateDaysUsed(staysWithPlannedTrip, normalizedPlannedExit)
    tripValid = daysUsedOnExit <= 90
    daysRemainingAfterTrip = Math.max(0, 90 - daysUsedOnExit)
    daysLeftToShow = daysRemainingAfterTrip
  } else {
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
