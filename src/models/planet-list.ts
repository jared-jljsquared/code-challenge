import type { Planet } from './planet.ts'

export interface PlanetList {
  count: number
  next: string | null
  previous: string | null
  results: Planet[]
}
