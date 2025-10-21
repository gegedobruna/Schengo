import { describe, it, expect } from 'vitest'
import { DateTime } from 'luxon'
import { calculateSchengenStatus, isSchengenCountry, get180DayWindow } from '../src/lib/schengen'
import type { Stay } from '../src/types'

describe('Schengen Calculations', () => {
  describe('isSchengenCountry', () => {
    it('should identify Schengen countries correctly', () => {
      expect(isSchengenCountry('FR')).toBe(true)
      expect(isSchengenCountry('DE')).toBe(true)
      expect(isSchengenCountry('IT')).toBe(true)
      expect(isSchengenCountry('ES')).toBe(true)
    })

    it('should identify non-Schengen countries correctly', () => {
      expect(isSchengenCountry('US')).toBe(false)
      expect(isSchengenCountry('GB')).toBe(false)
      expect(isSchengenCountry('CA')).toBe(false)
    })

    it('should handle case insensitive input', () => {
      expect(isSchengenCountry('fr')).toBe(true)
      expect(isSchengenCountry('germany')).toBe(false)
    })
  })

  describe('get180DayWindow', () => {
    it('should calculate correct 180-day window', () => {
      const referenceDate = DateTime.fromISO('2024-01-01')
      const window = get180DayWindow(referenceDate)
      
      expect(window.start.toISODate()).toBe('2023-07-06')
      expect(window.end.toISODate()).toBe('2024-01-01')
    })
  })

  describe('calculateSchengenStatus', () => {
    it('should calculate status for empty stays', () => {
      const status = calculateSchengenStatus([])
      
      expect(status.daysUsed).toBe(0)
      expect(status.daysRemaining).toBe(90)
      expect(status.isCompliant).toBe(true)
      expect(status.nextResetDate).toBeNull()
      expect(status.warnings).toHaveLength(0)
    })

    it('should calculate status for single stay', () => {
      const referenceDate = DateTime.fromISO('2024-01-15')
      const stays: Stay[] = [{
        id: '1',
        country: 'FR',
        entryDate: DateTime.fromISO('2024-01-01'),
        exitDate: DateTime.fromISO('2024-01-10'),
        duration: 10
      }]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(10)
      expect(status.daysRemaining).toBe(80)
      expect(status.isCompliant).toBe(true)
    })

    it('should calculate status for multiple stays', () => {
      const referenceDate = DateTime.fromISO('2024-03-15')
      const stays: Stay[] = [
        {
          id: '1',
          country: 'FR',
          entryDate: DateTime.fromISO('2024-01-01'),
          exitDate: DateTime.fromISO('2024-01-30'),
          duration: 30
        },
        {
          id: '2',
          country: 'DE',
          entryDate: DateTime.fromISO('2024-02-01'),
          exitDate: DateTime.fromISO('2024-02-28'),
          duration: 28
        }
      ]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(58)
      expect(status.daysRemaining).toBe(32)
      expect(status.isCompliant).toBe(true)
    })

    it('should handle overlapping stays correctly', () => {
      const referenceDate = DateTime.fromISO('2024-01-20')
      const stays: Stay[] = [
        {
          id: '1',
          country: 'FR',
          entryDate: DateTime.fromISO('2024-01-01'),
          exitDate: DateTime.fromISO('2024-01-10'),
          duration: 10
        },
        {
          id: '2',
          country: 'DE',
          entryDate: DateTime.fromISO('2024-01-05'),
          exitDate: DateTime.fromISO('2024-01-15'),
          duration: 11
        }
      ]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      // Should count overlapping days only once
      expect(status.daysUsed).toBe(15) // Jan 1-15, not 21
      expect(status.daysRemaining).toBe(75)
    })

    it('should detect non-compliance', () => {
      const referenceDate = DateTime.fromISO('2024-04-15')
      const stays: Stay[] = [{
        id: '1',
        country: 'FR',
        entryDate: DateTime.fromISO('2024-01-01'),
        exitDate: DateTime.fromISO('2024-04-01'),
        duration: 91
      }]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(91)
      expect(status.daysRemaining).toBe(-1)
      expect(status.isCompliant).toBe(false)
      expect(status.warnings).toContain('You have exceeded the 90-day limit')
    })

    it('should generate warnings for approaching limit', () => {
      const referenceDate = DateTime.fromISO('2024-03-25')
      const stays: Stay[] = [{
        id: '1',
        country: 'FR',
        entryDate: DateTime.fromISO('2024-01-01'),
        exitDate: DateTime.fromISO('2024-03-20'),
        duration: 80
      }]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(80)
      expect(status.warnings).toContain('You are approaching the 90-day limit')
    })

    it('should filter out non-Schengen stays', () => {
      const referenceDate = DateTime.fromISO('2024-02-15')
      const stays: Stay[] = [
        {
          id: '1',
          country: 'US',
          entryDate: DateTime.fromISO('2024-01-01'),
          exitDate: DateTime.fromISO('2024-01-30'),
          duration: 30
        },
        {
          id: '2',
          country: 'FR',
          entryDate: DateTime.fromISO('2024-02-01'),
          exitDate: DateTime.fromISO('2024-02-10'),
          duration: 10
        }
      ]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(10) // Only Schengen stay counted
      expect(status.daysRemaining).toBe(80)
    })

    it('should handle stays outside 180-day window', () => {
      const referenceDate = DateTime.fromISO('2024-06-01')
      const stays: Stay[] = [{
        id: '1',
        country: 'FR',
        entryDate: DateTime.fromISO('2023-01-01'),
        exitDate: DateTime.fromISO('2023-01-30'),
        duration: 30
      }]

      const status = calculateSchengenStatus(stays, referenceDate)
      
      expect(status.daysUsed).toBe(0) // Stay is outside 180-day window
      expect(status.daysRemaining).toBe(90)
    })
  })
})
