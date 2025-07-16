import type { Person } from './person.ts'

export interface PersonList {
  count: number
  next: string | null
  previous: string | null
  results: Person[]
}
