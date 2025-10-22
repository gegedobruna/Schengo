import { describe, it, expect } from 'vitest'
import { 
  daysInclusive, 
  areAdjacent, 
  normalizeStays, 
  usedOn, 
  latestSafeExit, 
  agingOutSchedule,
  planTrip,
  alreadyInside
} from '../src/lib/schengen'
import type { Stay } from '../src/types'

describe('Schengen Calculations', () => {
  describe('daysInclusive', () => {
    it('should calculate inclusive days correctly', () => {
      expect(daysInclusive('2024-01-01', '2024-01-01')).toBe(1) // Same day
      expect(daysInclusive('2024-01-01', '2024-01-02')).toBe(2) // Consecutive days
      expect(daysInclusive('2024-01-01', '2024-01-10')).toBe(10) // 10 days
    })

    it('should handle invalid dates', () => {
      expect(daysInclusive('invalid', '2024-01-01')).toBe(0)
      expect(daysInclusive('2024-01-01', 'invalid')).toBe(0)
    })

    it('should handle exit before entry', () => {
      expect(daysInclusive('2024-01-10', '2024-01-01')).toBe(0)
    })
  })

  describe('areAdjacent', () => {
    it('should identify adjacent stays', () => {
      const stay1: Stay = { entry: '2024-01-01', exit: '2024-01-05' }
      const stay2: Stay = { entry: '2024-01-06', exit: '2024-01-10' }
      expect(areAdjacent(stay1, stay2)).toBe(true)
    })

    it('should identify overlapping stays', () => {
      const stay1: Stay = { entry: '2024-01-01', exit: '2024-01-05' }
      const stay2: Stay = { entry: '2024-01-03', exit: '2024-01-10' }
      expect(areAdjacent(stay1, stay2)).toBe(true)
    })

    it('should identify non-adjacent stays', () => {
      const stay1: Stay = { entry: '2024-01-01', exit: '2024-01-05' }
      const stay2: Stay = { entry: '2024-01-07', exit: '2024-01-10' }
      expect(areAdjacent(stay1, stay2)).toBe(false)
    })
  })

  describe('normalizeStays', () => {
    it('should merge overlapping stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: '2024-01-03', exit: '2024-01-10' }
      ]
      const result = normalizeStays(stays)
      expect(result.stays).toHaveLength(1)
      expect(result.stays[0]).toEqual({ entry: '2024-01-01', exit: '2024-01-10' })
    })

    it('should merge adjacent stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: '2024-01-06', exit: '2024-01-10' }
      ]
      const result = normalizeStays(stays)
      expect(result.stays).toHaveLength(1)
      expect(result.stays[0]).toEqual({ entry: '2024-01-01', exit: '2024-01-10' })
    })

    it('should not merge non-adjacent stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: '2024-01-07', exit: '2024-01-10' }
      ]
      const result = normalizeStays(stays)
      expect(result.stays).toHaveLength(2)
    })

    it('should filter invalid stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: 'invalid', exit: '2024-01-10' },
        { entry: '2024-01-15', exit: '2024-01-10' } // exit before entry
      ]
      const result = normalizeStays(stays)
      expect(result.stays).toHaveLength(1)
      expect(result.warning).toContain('Invalid date')
    })
  })

  describe('usedOn', () => {
    it('should calculate used days for empty stays', () => {
      expect(usedOn([], '2024-01-01')).toBe(0)
    })

    it('should calculate used days for single stay', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' }
      ]
      expect(usedOn(stays, '2024-01-15')).toBe(10)
    })

    it('should calculate used days for multiple stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' },
        { entry: '2024-01-15', exit: '2024-01-20' }
      ]
      expect(usedOn(stays, '2024-01-25')).toBe(16)
    })

    it('should handle stays outside 180-day window', () => {
      const stays: Stay[] = [
        { entry: '2023-01-01', exit: '2023-01-10' } // More than 180 days ago
      ]
      expect(usedOn(stays, '2024-01-01')).toBe(0)
    })

    it('should handle partial overlap with 180-day window', () => {
      const stays: Stay[] = [
        { entry: '2023-12-01', exit: '2024-01-10' } // Partially in window
      ]
      const result = usedOn(stays, '2024-01-01')
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(41) // Full stay would be 41 days
    })
  })

  describe('latestSafeExit', () => {
    it('should find latest safe exit for empty stays', () => {
      const result = latestSafeExit([], '2024-01-01')
      expect(result).toBe('2024-01-01')
    })

    it('should find latest safe exit with existing stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' }
      ]
      const result = latestSafeExit(stays, '2024-01-15')
      expect(result).toBe('2024-01-15') // Can stay 90 days from entry
    })

    it('should handle complex scenarios', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-30' }, // 30 days
        { entry: '2024-02-01', exit: '2024-02-15' }  // 15 days
      ]
      const result = latestSafeExit(stays, '2024-03-01')
      // Should be able to stay until we reach 90 days total
      expect(new Date(result) > new Date('2024-03-01')).toBe(true)
    })
  })

  describe('agingOutSchedule', () => {
    it('should generate aging out schedule for empty stays', () => {
      const result = agingOutSchedule([], '2024-01-01')
      expect(result).toHaveLength(0)
    })

    it('should generate aging out schedule for single stay', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' }
      ]
      const result = agingOutSchedule(stays, '2024-01-01')
      expect(result).toHaveLength(5) // 5 days in stay
      expect(result[0].dropDateISO).toBe('2024-07-01') // 180 days later
      expect(result[0].daysRegained).toBe(1)
    })

    it('should group days that drop on the same date', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-01' },
        { entry: '2024-01-01', exit: '2024-01-01' }
      ]
      const result = agingOutSchedule(stays, '2024-01-01')
      expect(result).toHaveLength(1)
      expect(result[0].daysRegained).toBe(2)
    })
  })

  describe('planTrip', () => {
    it('should plan trip with empty stays', () => {
      const result = planTrip([], '2024-01-01')
      expect(result.usedOnEntry).toBe(0)
      expect(result.remainingOnEntry).toBe(90)
      expect(result.latestExit).toBe('2024-01-01')
      expect(result.agingOut).toHaveLength(0)
    })

    it('should plan trip with existing stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' }
      ]
      const result = planTrip(stays, '2024-01-15')
      expect(result.usedOnEntry).toBe(10)
      expect(result.remainingOnEntry).toBe(80)
      expect(new Date(result.latestExit) > new Date('2024-01-15')).toBe(true)
    })

    it('should validate proposed exit', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' }
      ]
      const result = planTrip(stays, '2024-01-15', '2024-01-20')
      expect(result.proposed).toBeDefined()
      expect(result.proposed?.ok).toBe(true)
    })

    it('should detect illegal proposed exit', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-80' } // 80 days
      ]
      const result = planTrip(stays, '2024-01-15', '2024-01-20')
      expect(result.proposed).toBeDefined()
      expect(result.proposed?.ok).toBe(false)
    })
  })

  describe('alreadyInside', () => {
    it('should calculate status for empty stays', () => {
      const result = alreadyInside([], '2024-01-01')
      expect(result.usedToday).toBe(0)
      expect(result.daysLeft).toBe(90)
      expect(result.latestExit).toBe('2024-01-01')
    })

    it('should calculate status with existing stays', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-10' }
      ]
      const result = alreadyInside(stays, '2024-01-15')
      expect(result.usedToday).toBeGreaterThan(0)
      expect(result.daysLeft).toBeLessThan(90)
      expect(new Date(result.latestExit) > new Date('2024-01-15')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single-day stays correctly', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-01' }
      ]
      expect(usedOn(stays, '2024-01-01')).toBe(1)
    })

    it('should handle back-to-back ranges', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: '2024-01-06', exit: '2024-01-10' }
      ]
      const result = normalizeStays(stays)
      expect(result.stays).toHaveLength(1)
      expect(result.stays[0]).toEqual({ entry: '2024-01-01', exit: '2024-01-10' })
    })

    it('should handle sparse trips far apart', () => {
      const stays: Stay[] = [
        { entry: '2024-01-01', exit: '2024-01-05' },
        { entry: '2024-06-01', exit: '2024-06-05' }
      ]
      const result = usedOn(stays, '2024-06-10')
      expect(result).toBe(5) // Only the second stay counts
    })

    it('should handle heavy summer travel scenario', () => {
      const stays: Stay[] = [
        { entry: '2024-06-01', exit: '2024-06-30' }, // 30 days in June
        { entry: '2024-07-01', exit: '2024-07-31' }, // 31 days in July
        { entry: '2024-08-01', exit: '2024-08-15' }  // 15 days in August
      ]
      const result = usedOn(stays, '2024-08-15')
      expect(result).toBe(76) // 30 + 31 + 15
    })
  })
})