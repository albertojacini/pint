/**
 * Political Geography Domain Seeder
 * Seeds political entities and their hierarchical relationships
 * Dependencies: None
 */

import { politicalEntities } from '../data/political-entities-data.mjs'
import { entityRelationships } from '../data/entity-relationships-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed political geography domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedEntities(client, supabase, idMaps) {
  // ===== POLITICAL ENTITIES =====
  logger.startSection('political entities')

  if (await hasData(client, 'political_entities')) {
    logger.skipSection('Political entities')
  } else {
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
  }

  // ===== ENTITY RELATIONSHIPS =====
  logger.startSection('entity relationships')

  if (await hasData(client, 'entity_relationships')) {
    logger.skipSection('Entity relationships')
  } else {
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
  }

  return idMaps
}
