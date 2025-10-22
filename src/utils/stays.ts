import { DateTime } from 'luxon'
import type { Stay, NormalizeResult } from '../types'
import { normalizeStays } from '../lib/schengen'

/**
 * Parse bulk text input into stays array
 * @param text Multi-line text with format: YYYY-MM-DD → YYYY-MM-DD
 * @returns Array of stays
 */
export function parseBulkStays(text: string): Stay[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  const stays: Stay[] = []
  
  for (const line of lines) {
    // Support various separators: →, ->, -, to, -
    const separators = ['→', '->', ' - ', ' to ', '-']
    let parts: string[] = []
    
    for (const sep of separators) {
      if (line.includes(sep)) {
        parts = line.split(sep).map(p => p.trim())
        break
      }
    }
    
    if (parts.length === 2) {
      const entry = parts[0]
      const exit = parts[1]
      
      // Validate ISO date format
      if (DateTime.fromISO(entry).isValid && DateTime.fromISO(exit).isValid) {
        stays.push({ entry, exit })
      }
    }
  }
  
  return stays
}

/**
 * Format a date for display
 * @param dateISO ISO date string
 * @param format Display format
 * @returns Formatted date string
 */
export function formatDate(dateISO: string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const date = DateTime.fromISO(dateISO, { zone: 'utc' })
  if (!date.isValid) return dateISO
  
  switch (format) {
    case 'short':
      return date.toFormat('MMM dd, yyyy')
    case 'long':
      return date.toFormat('MMMM dd, yyyy')
    case 'iso':
      return date.toISODate() || dateISO
    default:
      return date.toFormat('MMM dd, yyyy')
  }
}

/**
 * Format a date range for display
 * @param startISO Start date in ISO format
 * @param endISO End date in ISO format
 * @returns Formatted date range string
 */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = DateTime.fromISO(startISO, { zone: 'utc' })
  const end = DateTime.fromISO(endISO, { zone: 'utc' })
  
  if (!start.isValid || !end.isValid) return `${startISO} - ${endISO}`
  
  if (start.hasSame(end, 'year')) {
    if (start.hasSame(end, 'month')) {
      return `${start.toFormat('MMM dd')} - ${end.toFormat('dd, yyyy')}`
    } else {
      return `${start.toFormat('MMM dd')} - ${end.toFormat('MMM dd, yyyy')}`
    }
  } else {
    return `${start.toFormat('MMM dd, yyyy')} - ${end.toFormat('MMM dd, yyyy')}`
  }
}

/**
 * Calculate the duration of a stay in days (inclusive)
 * @param entryISO Entry date in ISO format
 * @param exitISO Exit date in ISO format
 * @returns Duration in days
 */
export function calculateStayDuration(entryISO: string, exitISO: string): number {
  const entry = DateTime.fromISO(entryISO, { zone: 'utc' })
  const exit = DateTime.fromISO(exitISO, { zone: 'utc' })
  
  if (!entry.isValid || !exit.isValid) return 0
  if (exit < entry) return 0
  
  return exit.diff(entry, 'days').days + 1
}

/**
 * Sort stays by entry date
 * @param stays Array of stays
 * @returns Sorted stays array
 */
export function sortStaysByEntryDate(stays: Stay[]): Stay[] {
  return [...stays].sort((a, b) => 
    DateTime.fromISO(a.entry, { zone: 'utc' }).toMillis() - 
    DateTime.fromISO(b.entry, { zone: 'utc' }).toMillis()
  )
}

/**
 * Get stays within a date range
 * @param stays Array of stays
 * @param startISO Start date in ISO format
 * @param endISO End date in ISO format
 * @returns Filtered stays array
 */
export function getStaysInRange(stays: Stay[], startISO: string, endISO: string): Stay[] {
  const start = DateTime.fromISO(startISO, { zone: 'utc' })
  const end = DateTime.fromISO(endISO, { zone: 'utc' })
  
  if (!start.isValid || !end.isValid) return []
  
  return stays.filter(stay => {
    const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
    const exit = DateTime.fromISO(stay.exit, { zone: 'utc' })
    
    if (!entry.isValid || !exit.isValid) return false
    
    return entry <= end && exit >= start
  })
}

/**
 * Check if a date is in the past
 * @param dateISO Date in ISO format
 * @returns True if in the past
 */
export function isPastDate(dateISO: string): boolean {
  const date = DateTime.fromISO(dateISO, { zone: 'utc' })
  if (!date.isValid) return false
  
  return date < DateTime.now().toUTC().startOf('day')
}

/**
 * Check if a date is in the future
 * @param dateISO Date in ISO format
 * @returns True if in the future
 */
export function isFutureDate(dateISO: string): boolean {
  const date = DateTime.fromISO(dateISO, { zone: 'utc' })
  if (!date.isValid) return false
  
  return date > DateTime.now().toUTC().endOf('day')
}

/**
 * Get today's date in ISO format (UTC)
 * @returns Today's date as ISO string
 */
export function getTodayISO(): string {
  return DateTime.now().toUTC().toISODate()!
}

/**
 * Get tomorrow's date in ISO format (UTC)
 * @returns Tomorrow's date as ISO string
 */
export function getTomorrowISO(): string {
  return DateTime.now().toUTC().plus({ days: 1 }).toISODate()!
}

/**
 * Validate a stay entry
 * @param stay Stay object to validate
 * @returns Array of validation errors
 */
export function validateStay(stay: Stay): string[] {
  const errors: string[] = []
  
  const entry = DateTime.fromISO(stay.entry, { zone: 'utc' })
  const exit = DateTime.fromISO(stay.exit, { zone: 'utc' })
  
  if (!entry.isValid) {
    errors.push('Invalid entry date format')
  }
  
  if (!exit.isValid) {
    errors.push('Invalid exit date format')
  }
  
  if (entry.isValid && exit.isValid) {
    if (exit < entry) {
      errors.push('Exit date must be after entry date')
    }
    
    if (entry < DateTime.fromISO('2020-01-01', { zone: 'utc' })) {
      errors.push('Entry date cannot be before 2020')
    }
    
    if (exit > DateTime.now().toUTC().plus({ years: 10 })) {
      errors.push('Exit date cannot be more than 10 years in the future')
    }
  }
  
  return errors
}

/**
 * Export stays to JSON format
 * @param stays Array of stays
 * @returns JSON string
 */
export function exportStaysToJSON(stays: Stay[]): string {
  return JSON.stringify(stays, null, 2)
}

/**
 * Import stays from JSON format
 * @param json JSON string
 * @returns Array of stays
 */
export function importStaysFromJSON(json: string): Stay[] {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      return parsed.filter(item => 
        typeof item === 'object' && 
        item !== null && 
        typeof item.entry === 'string' && 
        typeof item.exit === 'string'
      )
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error)
  }
  
  return []
}

/**
 * Normalize and validate stays with detailed results
 * @param stays Array of stays to normalize
 * @returns Normalization result with warnings
 */
export function normalizeAndValidateStays(stays: Stay[]): NormalizeResult {
  const validationErrors: string[] = []
  
  // Validate each stay
  for (let i = 0; i < stays.length; i++) {
    const errors = validateStay(stays[i])
    if (errors.length > 0) {
      validationErrors.push(`Stay ${i + 1}: ${errors.join(', ')}`)
    }
  }
  
  // Normalize stays
  const result = normalizeStays(stays)
  
  // Combine validation and normalization warnings
  const allWarnings = [...validationErrors]
  if (result.warning) {
    allWarnings.push(result.warning)
  }
  
  return {
    stays: result.stays,
    warning: allWarnings.length > 0 ? allWarnings.join('; ') : undefined
  }
}