import { BigQuery } from "@google-cloud/bigquery"

const KEYFILE_PATH = './keyfile.json'

type Publication = {}

export const getPublicationsBySymbols = async (symbols: string[]): Promise<Publication[]> => {
  /**
   * Read latest posts from Lens BigQuery
   */
  const client = new BigQuery({ keyFilename: KEYFILE_PATH })
  const query = `
    SELECT *
    FROM lens-public-data.polygon.public_profile_post
    WHERE main_content_focus = "TEXT_ONLY" 
    AND content IS NOT NULL 
    AND content_warning IS NULL
    AND is_related_to_post IS NULL
    AND s3_metadata_location IS NOT NULL
    AND has_error = false
    AND is_metadata_processed = true
    ORDER BY block_timestamp DESC
    LIMIT 1000
  `
  const [publications] = await client.query({ query, location: 'US' })

  /**
   * Filter the publications to those only including one of the symbols
   */
  return publications.filter((pub) => {
    let includesSymbol = false

    for (const symbol of symbols) {
      if (pub.content.includes(symbol)) {
        includesSymbol = true
        break
      }
    }

    return includesSymbol
  })
}
