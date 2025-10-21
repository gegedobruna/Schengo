import { DateTime } from 'luxon'
import type { Stay } from '../types'

/**
 * Calculate the duration of a stay in days
 */
export function calculateStayDuration(entryDate: DateTime, exitDate: DateTime): number {
  return exitDate.diff(entryDate, 'days').days + 1
}

/**
 * Format a date for display
 */
export function formatDate(date: DateTime, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toFormat('MMM dd, yyyy')
    case 'long':
      return date.toFormat('MMMM dd, yyyy')
    case 'iso':
      return date.toISODate() || ''
    default:
      return date.toFormat('MMM dd, yyyy')
  }
}

/**
 * Format a date range for display
 */
export function formatDateRange(start: DateTime, end: DateTime): string {
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
 * Sort stays by entry date
 */
export function sortStaysByEntryDate(stays: Stay[]): Stay[] {
  return [...stays].sort((a, b) => a.entryDate.toMillis() - b.entryDate.toMillis())
}

/**
 * Get stays within a date range
 */
export function getStaysInRange(
  stays: Stay[],
  startDate: DateTime,
  endDate: DateTime
): Stay[] {
  return stays.filter(stay => 
    stay.entryDate <= endDate && stay.exitDate >= startDate
  )
}

/**
 * Calculate total days in a country
 */
export function calculateTotalDaysInCountry(stays: Stay[], countryCode: string): number {
  return stays
    .filter(stay => stay.country === countryCode)
    .reduce((total, stay) => total + stay.duration, 0)
}

/**
 * Get unique countries from stays
 */
export function getUniqueCountries(stays: Stay[]): string[] {
  return [...new Set(stays.map(stay => stay.country))]
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: DateTime): boolean {
  return date < DateTime.now().startOf('day')
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: DateTime): boolean {
  return date > DateTime.now().endOf('day')
}

/**
 * Get the next day after a given date
 */
export function getNextDay(date: DateTime): DateTime {
  return date.plus({ days: 1 })
}

/**
 * Get the previous day before a given date
 */
export function getPreviousDay(date: DateTime): DateTime {
  return date.minus({ days: 1 })
}
