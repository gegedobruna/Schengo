import { DateTime } from 'luxon'

export interface Stay {
  entry: string // ISO YYYY-MM-DD
  exit: string  // ISO YYYY-MM-DD
}

export interface Trip {
  id: string
  name: string
  stays: Stay[]
  createdAt: DateTime
  updatedAt: DateTime
}

export interface SchengenStatus {
  daysUsed: number
  daysRemaining: number
  isCompliant: boolean
  nextResetDate: DateTime | null
  warnings: string[]
}

export type PlannerMode = 'plan' | 'inside'

export interface DateRange {
  start: DateTime
  end: DateTime
}

export interface Country {
  code: string
  name: string
  isSchengen: boolean
}

export interface PlanResult {
  usedOnEntry: number
  remainingOnEntry: number
  latestExit: string
  agingOut: Array<{ date: string; days: number }>
  proposed?: {
    ok: boolean
    firstIllegal?: string
  }
}

export interface InsideResult {
  usedToday: number
  daysLeft: number
  latestExit: string
}

export interface NormalizeResult {
  stays: Stay[]
  warning?: string
}

export interface AgingOutEvent {
  dropDateISO: string
  daysRegained: number
}
