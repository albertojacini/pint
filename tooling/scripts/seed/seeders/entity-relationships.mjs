/**
 * Entity relationships seeder
 * Seeds hierarchical relationships between political entities
 * Dependencies: political-entities
 */

import { entityRelationships } from '../data/entity-relationships-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed entity relationships into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedEntityRelationships(client, supabase, idMaps) {
  logger.startSection('entity relationships')

  // Check if relationships already exist
  if (await hasData(client, 'entity_relationships')) {
    logger.skipSection('Entity relationships')
    return idMaps
  }

  // Insert each relationship
  let successCount = 0
  let skipCount = 0

  for (const relationship of entityRelationships) {
    // Look up entity IDs from the ID map
    const entityId = idMaps.entities.get(relationship.entity)
    const relatedEntityId = idMaps.entities.get(relationship.related)

    // Skip if either entity wasn't found
    if (!entityId || !relatedEntityId) {
      logger.warning(
        `Skipping relationship: ${relationship.entity} -> ${relationship.related} (entity not found)`
      )
      skipCount++
      continue
    }

    const id = generateUUID()

    await insertQuery(client, {
      table: 'entity_relationships',
      columns: [
        'id',
        'entity_id',
        'related_entity_id',
        'relationship_type'
      ],
      values: [
        id,
        entityId,
        relatedEntityId,
        relationship.type
      ]
    })

    successCount++
  }

  if (skipCount > 0) {
    logger.warning(`Skipped ${skipCount} relationships due to missing entities`)
  }

  logger.endSection('entity relationships', successCount)

  return idMaps
}