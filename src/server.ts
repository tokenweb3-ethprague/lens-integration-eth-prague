import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import { getPublicationsBySymbols } from './get-pulications-by-token-symbols.js'

const PORT = 3000
const RESULTS_TO_RETURN = 20

const app = express()

app.get('/publications', async (req, res) => {
  const symbols = (req.query.symbols as string).split(',')

  console.log(`/publications called with: ${symbols}`)

  let publications: {}[] = []
  try {
    publications = await getPublicationsBySymbols(symbols)
  } catch (error) {
    console.log(error)
  }

  console.log(`${publications.length} results found for ${symbols}. returning ${RESULTS_TO_RETURN} results`)

  return res.send(publications.slice(0, RESULTS_TO_RETURN))
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
