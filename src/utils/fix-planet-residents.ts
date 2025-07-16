import type { Planet } from '../models/planet.ts'
import { getPerson } from '../plumbing/cache.ts'

export const fixPlanetResidents: (planet: Planet) => Promise<Planet> = async (
  planet,
) => {
  const nameList: string[] = []
  const processResidents = async (planet: Planet) => {
    for (const url of planet.residents) {
      const person = await getPerson(url)
      if (person) {
        nameList.push(person.name)
      }
    }
  }
  await processResidents(planet)
  const updatedPlanet = {
    ...planet,
    residents: nameList,
  }
  return updatedPlanet
}
