import { DateTime } from 'luxon'

export interface Stay {
  id: string
  country: string
  entryDate: DateTime
  exitDate: DateTime
  duration: number // in days
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
