import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import { getPublicationsBySymbols } from './get-pulications-by-token-symbols.js'

const PORT = process.env.PORT || 3000
export const MAX_RESULTS = Number(process.env.MAX_RESULTS) ?? 20

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

  console.log(`${publications.length} results found for ${symbols}. returning ${MAX_RESULTS} results`)

  return res.send(publications.slice(0, MAX_RESULTS))
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
