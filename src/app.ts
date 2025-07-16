import 'dotenv/config'
import express from 'express'
import type { Request, Response } from 'express'
import info from '../package.json' with { type: 'json' }
import type { Person } from './models/person.ts'
import { getPersonList, getPlanetList } from './plumbing/cache.ts'
import { log } from './plumbing/logger.ts'
import { initialLoad } from './utils/initial-load.ts'

const { name, version } = info

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send(`Please query either /people or /planets `)
})

await initialLoad()

app.get('/people', (req: Request, res: Response) => {
  console.log('attempting to get people')
  const { sortBy } = req.query
  const personList = getPersonList()
  const sortedPersonList = [...personList]
  if (!sortBy || sortBy === 'name') {
    sortedPersonList.sort((a: Person, b: Person) =>
      a.name.localeCompare(b.name),
    )
  } else if (sortBy === 'height') {
    // NOTE: This is just a simple string sort - if a more realistic actual height sort is desired this needs to change
    sortedPersonList.sort((a: Person, b: Person) =>
      a.height.localeCompare(b.height),
    )
  } else if (sortBy === 'mass') {
    // NOTE: This is just a simple string sort - if a more realistic actual numeric sort is desired this needs to change
    sortedPersonList.sort((a: Person, b: Person) =>
      a.mass.localeCompare(b.mass),
    )
  }
  res.json(sortedPersonList)
})
app.get('/planets', (req: Request, res: Response) => {
  const planetList = getPlanetList()
  res.json(planetList)
})

app.get('/about', (req, res) => {
  res.json({
    name,
    version,
  })
})

app.listen(port, () => {
  if (!process.env.PORT) {
    log('process.env.PORT is undefined - defaulting to 3000')
  }
  return log(`Express service listening at htpp://localhost:${port}`)
})
