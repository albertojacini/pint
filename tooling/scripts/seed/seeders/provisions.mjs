/**
 * Provisions Domain Seeder
 * Seeds provisions (actual policy data) and provision resources (URLs for the agent to process)
 * Dependencies: entities (political_entities)
 */

import { provisions } from '../data/provisions-data.mjs'
import { provisionResources } from '../data/provision-resources-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed provisions domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedProvisions(client, supabase, idMaps) {
  // ===== PROVISIONS =====
  logger.startSection('provisions')

  let successCount = 0
  let skipCount = 0

  if (await hasData(client, 'provisions')) {
    logger.skipSection('Provisions')
  } else {
    for (const provision of provisions) {
      // Try to get entity ID from idMaps, otherwise query database
      let entityId = idMaps.entities.get(provision.entity)

      if (!entityId) {
        // Query database for entity ID
        const result = await client.query(
          'SELECT id FROM political_entities WHERE name = $1',
          [provision.entity]
        )
        if (result.rows.length > 0) {
          entityId = result.rows[0].id
          // Cache it for future use
          idMaps.entities.set(provision.entity, entityId)
        }
      }

      if (!entityId) {
        logger.warning(`Skipping provision "${provision.title}" - entity not found: ${provision.entity}`)
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'provisions',
        columns: ['id', 'entity_id', 'title', 'description', 'type', 'status', 'effective_from', 'effective_until', 'extra_data'],
        values: [
          id,
          entityId,
          provision.title,
          provision.description,
          provision.type,
          provision.status,
          provision.effectiveFrom || null,
          provision.effectiveUntil || null,
          JSON.stringify(provision.extraData || {})
        ],
      })

      successCount++
      idMaps.provisions.set(provision.title, id)
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} provisions due to missing dependencies`)
    }

    logger.endSection('provisions', successCount)
  }

  // ===== PROVISION RESOURCES =====
  logger.startSection('provision_resources')

  successCount = 0
  skipCount = 0

  if (await hasData(client, 'provision_resources')) {
    logger.skipSection('Provision resources')
  } else {
    for (const resource of provisionResources) {
      // Try to get entity ID from idMaps, otherwise query database
      let entityId = idMaps.entities.get(resource.entity)

      if (!entityId) {
        // Query database for entity ID
        const result = await client.query(
          'SELECT id FROM political_entities WHERE name = $1',
          [resource.entity]
        )
        if (result.rows.length > 0) {
          entityId = result.rows[0].id
          // Cache it for future use
          idMaps.entities.set(resource.entity, entityId)
        }
      }

      if (!entityId) {
        logger.warning(`Skipping resource "${resource.url}" - entity not found: ${resource.entity}`)
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'provision_resources',
        columns: ['id', 'entity_id', 'url', 'status'],
        values: [id, entityId, resource.url, 'pending'],
      })

      successCount++
      idMaps.provisionResources.set(resource.url, id)
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} resources due to missing dependencies`)
    }

    logger.endSection('provision_resources', successCount)
  }

  return idMaps
}
