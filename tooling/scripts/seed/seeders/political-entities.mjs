/**
 * Political entities seeder
 * Seeds cities, regions, countries, and supranational organizations
 */

import { politicalEntities } from '../data/political-entities-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed political entities into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedPoliticalEntities(client, supabase, idMaps) {
  logger.startSection('political entities')

  // Check if entities already exist
  if (await hasData(client, 'political_entities')) {
    logger.skipSection('Political entities')
    return idMaps
  }

  // Insert each political entity
  for (const entity of politicalEntities) {
    const id = generateUUID()

    await insertQuery(client, {
      table: 'political_entities',
      columns: [
        'id',
        'name',
        'native_name',
        'description',
        'avatar_url',
        'type',
        'population',
        'score_innovation',
        'score_sustainability',
        'score_impact'
      ],
      values: [
        id,
        entity.name,
        entity.native_name || null,
        entity.description,
        entity.avatar_url || null,
        entity.type,
        entity.population || null,
        entity.score_innovation || null,
        entity.score_sustainability || null,
        entity.score_impact || null
      ]
    })

    // Store ID mapping for later reference
    idMaps.entities.set(entity.name, id)
  }

  logger.endSection('political entities', politicalEntities.length)

  return idMaps
}