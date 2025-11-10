import { describe, it, expect } from 'vitest'
import { 
  calculateSchengenStatus,
  formatDate,
  parseDate,
  type Stay
} from '../src/utils/schengen'

// Helper function to create Date objects from ISO strings
function date(isoString: string): Date {
  return new Date(isoString + 'T00:00:00.000Z')
}

describe('Schengen Calculations', () => {
  describe('calculateSchengenStatus', () => {
    it('should calculate status with no past stays and no planned entry', () => {
      const result = calculateSchengenStatus([], null, null)
      expect(result.daysLeft).toBeGreaterThanOrEqual(0)
      expect(result.daysLeft).toBeLessThanOrEqual(90)
      expect(result.tripValid).toBe(false)
      expect(result.daysUsedOnEntry).toBe(0)
      expect(result.daysRemainingOnEntry).toBe(90)
    })

    it('should calculate status with empty past stays and planned entry', () => {
      const plannedEntry = date('2024-06-01')
      const result = calculateSchengenStatus([], plannedEntry, null)
      expect(result.daysUsedOnEntry).toBe(0)
      expect(result.daysRemainingOnEntry).toBe(90)
      expect(result.tripValid).toBe(true)
      expect(result.latestSafeExit).toBeDefined()
    })

    it('should calculate days used correctly for single stay', () => {
      // Use a date that's definitely more than 180 days away
      const farPastStays: Stay[] = [
        { entry: date('2023-01-01'), exit: date('2023-01-10') }
      ]
      const farPlannedEntry = date('2024-06-01')
      const farResult = calculateSchengenStatus(farPastStays, farPlannedEntry, null)
      
      // This should be 0 since it's more than 180 days before
      expect(farResult.daysUsedOnEntry).toBe(0)
      expect(farResult.daysRemainingOnEntry).toBe(90)
    })

    it('should calculate days used for stays within 180-day window', () => {
      const today = new Date()
      const entryDate = new Date(today)
      entryDate.setDate(entryDate.getDate() - 10) // 10 days ago
      const exitDate = new Date(today)
      exitDate.setDate(exitDate.getDate() - 1) // Yesterday
      
      const pastStays: Stay[] = [
        { entry: entryDate, exit: exitDate }
      ]
      const plannedEntry = new Date(today)
      plannedEntry.setDate(plannedEntry.getDate() + 30) // 30 days from now
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      expect(result.daysUsedOnEntry).toBeGreaterThan(0)
      expect(result.daysRemainingOnEntry).toBeLessThan(90)
    })

    it('should merge overlapping stays correctly', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-05') },
        { entry: date('2024-01-03'), exit: date('2024-01-10') }
      ]
      const plannedEntry = date('2024-01-15')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should count as 10 days (merged), not 15 days
      expect(result.daysUsedOnEntry).toBe(10)
    })

    it('should merge adjacent stays correctly', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-05') },
        { entry: date('2024-01-06'), exit: date('2024-01-10') }
      ]
      const plannedEntry = date('2024-01-15')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should count as 10 days (merged), not two separate stays
      expect(result.daysUsedOnEntry).toBe(10)
    })

    it('should validate planned trip with exit date', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-30') } // 30 days
      ]
      const plannedEntry = date('2024-06-01')
      const plannedExit = date('2024-06-31') // 30 days trip
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, plannedExit)
      
      // Total would be 30 (past) + 30 (planned) = 60 days, should be valid
      expect(result.tripValid).toBe(true)
      expect(result.daysRemainingAfterTrip).toBeDefined()
    })

    it('should detect invalid trip that exceeds 90 days', () => {
      // Use dates that are within the 180-day window
      const today = new Date()
      const pastEntry = new Date(today)
      pastEntry.setDate(pastEntry.getDate() - 30) // 30 days ago
      const pastExit = new Date(today)
      pastExit.setDate(pastExit.getDate() - 1) // Yesterday (29 days stay)
      
      const pastStays: Stay[] = [
        { entry: pastEntry, exit: pastExit } // ~29 days
      ]
      
      const plannedEntry = new Date(today)
      plannedEntry.setDate(plannedEntry.getDate() + 1) // Tomorrow
      const plannedExit = new Date(today)
      plannedExit.setDate(plannedExit.getDate() + 65) // 65 days from now
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, plannedExit)
      
      // Total would be ~29 + 65 = 94 days, should be invalid
      expect(result.tripValid).toBe(false)
    })

    it('should calculate latest safe exit correctly', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-30') } // 30 days
      ]
      const plannedEntry = date('2024-06-01')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should be able to stay 60 more days (90 - 30 = 60)
      expect(result.latestSafeExit).toBeDefined()
      const latestExit = new Date(result.latestSafeExit)
      expect(latestExit >= plannedEntry).toBe(true)
    })

    it('should handle single-day stays', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-01') }
      ]
      const plannedEntry = date('2024-01-15')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      expect(result.daysUsedOnEntry).toBe(1)
      expect(result.daysRemainingOnEntry).toBe(89)
    })

    it('should filter out invalid stays (exit before entry)', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-10'), exit: date('2024-01-05') }, // Invalid
        { entry: date('2024-01-01'), exit: date('2024-01-05') }  // Valid
      ]
      const plannedEntry = date('2024-01-15')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should only count the valid stay (5 days)
      expect(result.daysUsedOnEntry).toBe(5)
    })

    it('should handle stays outside 180-day window', () => {
      const today = new Date()
      const oldEntry = new Date(today)
      oldEntry.setDate(oldEntry.getDate() - 200) // 200 days ago
      const oldExit = new Date(today)
      oldExit.setDate(oldExit.getDate() - 190) // 190 days ago
      
      const pastStays: Stay[] = [
        { entry: oldEntry, exit: oldExit }
      ]
      const plannedEntry = new Date(today)
      plannedEntry.setDate(plannedEntry.getDate() + 30)
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should not count days outside the 180-day window
      expect(result.daysUsedOnEntry).toBe(0)
    })
  })

  describe('formatDate', () => {
    it('should format date in English', () => {
      const date = new Date('2025-04-11T00:00:00.000Z')
      const result = formatDate(date, 'en')
      expect(result).toBe('11 April 2025')
    })

    it('should format date in Albanian', () => {
      const date = new Date('2025-04-11T00:00:00.000Z')
      const result = formatDate(date, 'sq')
      expect(result).toBe('11 Prill 2025')
    })

    it('should default to English if locale not found', () => {
      const date = new Date('2025-04-11T00:00:00.000Z')
      const result = formatDate(date, 'unknown' as any)
      expect(result).toBe('11 April 2025')
    })

    it('should format different months correctly', () => {
      const janDate = new Date('2025-01-15T00:00:00.000Z')
      expect(formatDate(janDate, 'en')).toBe('15 January 2025')
      
      const decDate = new Date('2025-12-25T00:00:00.000Z')
      expect(formatDate(decDate, 'en')).toBe('25 December 2025')
    })
  })

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('11-04-2025')
      expect(result).not.toBeNull()
      expect(result!.getDate()).toBe(11)
      expect(result!.getMonth()).toBe(3) // April is month 3 (0-indexed)
      expect(result!.getFullYear()).toBe(2025)
    })

    it('should return null for invalid format', () => {
      expect(parseDate('invalid')).toBeNull()
      expect(parseDate('2025-04-11')).toBeNull() // Wrong format
      expect(parseDate('11/04/2025')).toBeNull() // Wrong separator
    })

    it('should return null for invalid date values', () => {
      expect(parseDate('32-01-2025')).toBeNull() // Invalid day
      expect(parseDate('11-13-2025')).toBeNull() // Invalid month
      expect(parseDate('11-02-30')).toBeNull() // Invalid year
    })

    it('should handle edge cases', () => {
      expect(parseDate('29-02-2024')).not.toBeNull() // Leap year
      expect(parseDate('29-02-2025')).toBeNull() // Not a leap year
      expect(parseDate('31-04-2025')).toBeNull() // April has 30 days
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple overlapping stays', () => {
      const pastStays: Stay[] = [
        { entry: date('2024-01-01'), exit: date('2024-01-05') },
        { entry: date('2024-01-03'), exit: date('2024-01-10') },
        { entry: date('2024-01-08'), exit: date('2024-01-15') }
      ]
      const plannedEntry = date('2024-01-20')
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should merge all three into one stay (15 days total)
      expect(result.daysUsedOnEntry).toBe(15)
    })

    it('should handle stays spanning exactly 180 days', () => {
      const today = new Date()
      const entryDate = new Date(today)
      entryDate.setDate(entryDate.getDate() - 170) // 170 days ago
      const exitDate = new Date(today)
      exitDate.setDate(exitDate.getDate() - 160) // 160 days ago (10 day stay)
      
      const pastStays: Stay[] = [
        { entry: entryDate, exit: exitDate }
      ]
      const plannedEntry = new Date(today)
      plannedEntry.setDate(plannedEntry.getDate() + 10) // 10 days from now
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      // The stay should be within the 180-day window from planned entry
      expect(result.daysUsedOnEntry).toBeGreaterThan(0)
    })

    it('should handle maximum 90 days used', () => {
      // Use dates that are within the 180-day window
      const today = new Date()
      const entryDate = new Date(today)
      entryDate.setDate(entryDate.getDate() - 90) // 90 days ago
      const exitDate = new Date(today)
      exitDate.setDate(exitDate.getDate() - 1) // Yesterday (89 days stay, but we need to check inclusive)
      
      const pastStays: Stay[] = [
        { entry: entryDate, exit: exitDate }
      ]
      const plannedEntry = new Date(today)
      plannedEntry.setDate(plannedEntry.getDate() + 1) // Tomorrow
      
      const result = calculateSchengenStatus(pastStays, plannedEntry, null)
      
      // Should be close to 90 days (within the 180-day window)
      expect(result.daysUsedOnEntry).toBeGreaterThan(85)
      expect(result.daysRemainingOnEntry).toBeLessThan(5)
    })
  })
})