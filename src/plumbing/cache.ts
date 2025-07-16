import NodeCache from 'node-cache'
import type { PersonList } from '../models/person-list.ts'
import type { Person } from '../models/person.ts'
import type { PlanetList } from '../models/planet-list.ts'
import type { Planet } from '../models/planet.ts'
import { fixPlanetResidents } from '../utils/fix-planet-residents.ts'
import { log } from './logger.ts'

const activeCache = new NodeCache({ stdTTL: 0, checkperiod: 600 })

export const getPersonList: () => Person[] = () => {
  let cacheKey = `person-list`
  const cachedPersonList: undefined | Person[] = activeCache.get(cacheKey)

  if (!cachedPersonList) {
    log({
      message: 'no person-list in cache - building it',
    })
    const personKeyList = activeCache
      .keys()
      .filter((key) => key.startsWith('person-'))
    const personList: Person[] = []
    personKeyList.forEach((key) => {
      const person = activeCache.get(key)
      if (person) {
        personList.push(person as Person)
      }
    })
    activeCache.set(cacheKey, personList)
    return personList
  } else {
    log({
      message: 'person-list cache hit',
    })
    return cachedPersonList
  }
}

export const getPlanetList: () => Planet[] = () => {
  let cacheKey = `planet-list`
  const cachedPlanetList: undefined | Planet[] = activeCache.get(cacheKey)

  if (!cachedPlanetList) {
    log({
      message: 'no planet-list in cache - building it',
    })
    const planetKeyList = activeCache
      .keys()
      .filter((key) => key.startsWith('planet-'))
    const planetList: Planet[] = []
    planetKeyList.forEach((key) => {
      const planet = activeCache.get(key)
      if (planet) {
        planetList.push(planet as Planet)
      }
    })
    activeCache.set(cacheKey, planetList)
    return planetList
  } else {
    log({
      message: 'planet-list cache hit',
    })
    return cachedPlanetList
  }
}

export const loadPersonList: (url?: string) => Promise<boolean> = async (
  url,
) => {
  const fetchUrl = url ?? `https://swapi.py4e.com/api/people/`
  try {
    const result = await fetch(fetchUrl)
    const personList: PersonList = (await result.json()) as PersonList
    if (personList) {
      for (const person of personList.results) {
        const cacheKey = `person-${person.url}`
        activeCache.set(cacheKey, person)
      }
      log({
        message: `Person API successfully loaded ${personList.results.length} records`,
        url: fetchUrl,
      })
    }
    if (personList.next !== null) {
      return await loadPersonList(personList.next)
    } else {
      return true
    }
  } catch (error) {
    const printableError = error as string | object
    log({
      message: `error loading url`,
      url: url ?? 'undefined',
      error: printableError,
    })
    return false
  }
}

export const loadPlanetList: (url?: string) => Promise<boolean> = async (
  url,
) => {
  const fetchUrl = url ?? `https://swapi.py4e.com/api/planets/`
  try {
    const result = await fetch(fetchUrl)
    const planetList: PlanetList = (await result.json()) as PlanetList
    if (planetList) {
      for (const planet of planetList.results) {
        const cacheKey = `planet-${planet.url}`
        const updatedPlanet = await fixPlanetResidents(planet)
        activeCache.set(cacheKey, updatedPlanet)
      }
      log({
        message: `Planet API successfully loaded ${planetList.results.length} records`,
        url: fetchUrl,
      })
    }
    if (planetList.next !== null) {
      return await loadPlanetList(planetList.next)
    } else {
      return true
    }
  } catch (error) {
    const printableError = error as string | object
    log({
      message: `error loading url`,
      url: url ?? 'undefined',
      error: printableError,
    })
    return false
  }
}

export const fetchPerson = async (url: string) => {
  try {
    const response = await fetch(url)
    const person: Person = (await response.json()) as Person
    return person
  } catch (error) {
    const printableError = error as string | object
    log({
      message: `error looking up person: ${url}`,
      error: printableError,
    })
    return undefined
  }
}

export const getPerson = async (url: string) => {
  const cacheKey = `person-${url}`
  const cachedPerson = activeCache.get<Person>(cacheKey)

  if (cachedPerson) {
    return cachedPerson
  } else {
    const person = await fetchPerson(url)
    if (person) {
      const success = activeCache.set(cacheKey, person)
      if (!success) {
        log({
          message: 'Failed to store person',
          url,
          person,
        })
      }
      return person
    }
  }
}
