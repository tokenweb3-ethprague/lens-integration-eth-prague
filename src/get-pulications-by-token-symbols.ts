import { BigQuery } from "@google-cloud/bigquery"

export type LensPublication = {
  "post_id": string,
  "contract_publication_id": string,
  "profile_id": string,
  "content_uri": string,
  "s3_metadata_location": string,
  "collect_nft_address": string,
  "reference_implementation": string,
  "reference_return_data": string,
  "is_related_to_post": boolean,
  "is_related_to_comment": boolean,
  "is_metadata_processed": boolean,
  "has_error": boolean,
  "metadata_error_reason": string,
  "tx_hash": string,
  "is_hidden": boolean,
  "timeout_request": boolean,
  "app_id": string,
  "block_timestamp": {
    "value": string,
  },
  "created_block_hash": string,
  "metadata_version": string,
  "language": string,
  "region": string,
  "content_warning": string,
  "main_content_focus": string,
  "tags_vector": string,
  "custom_filters_gardener_flagged": boolean,
  "content": string,
  "is_gated": boolean,
  "is_data_availability": boolean,
  "data_availability_proofs": string,
  "datastream_metadata": {
    "uuid": string,
    "source_timestamp": number,
  }
  "data_availability_verification_failed": boolean
}

export const getPublicationsBySymbols = async (symbols: string[]): Promise<LensPublication[]> => {
  /**
   * Read latest posts from Lens BigQuery
   */
  const client = new BigQuery({ credentials: JSON.parse(process.env.BIGQUERY_CREDENTIALS as string) })

  const contentFilterClause = `(${symbols.map(symbol => `LOWER(content) LIKE "%${symbol.toLowerCase()}%"`).join(' OR ')})`

  const query = `
    SELECT *
    FROM lens-public-data.polygon.public_profile_post
    WHERE main_content_focus = "TEXT_ONLY" 
    AND content IS NOT NULL 
    AND content_warning IS NULL
    AND is_related_to_post IS NULL
    AND is_related_to_comment IS NULL
    AND s3_metadata_location IS NOT NULL
    AND has_error = false
    AND is_metadata_processed = true
    AND content NOT LIKE '%I just voted%' 
    AND content NOT LIKE '%delegate tokens%' 
    AND content NOT LIKE '%Voting has started%' 
    AND content NOT LIKE '%Snapshot Proposal Ended%'
    AND content NOT LIKE '%** New Post notification for communities you follow%'
    AND content NOT LIKE '%https://snapshot.org/#/%'
    AND content NOT LIKE '%@pooltogether.lens%'
    AND ${contentFilterClause}
    ORDER BY block_timestamp DESC
    LIMIT 200
  `

  const [publications] = await client.query({ query, location: 'US' })

  return publications
}
