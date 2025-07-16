import { loadPersonList, loadPlanetList } from '../plumbing/cache.ts'
import { log } from '../plumbing/logger.ts'

export const initialLoad = async () => {
  log({
    message: 'starting the initial load',
  })
  await loadPersonList()
  await loadPlanetList()
}
