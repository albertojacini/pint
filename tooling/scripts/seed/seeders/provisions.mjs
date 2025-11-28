/**
 * Provisions Domain Seeder
 * Seeds provision resources (URLs for the agent to process)
 * Dependencies: entities (political_entities)
 */

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
  // ===== PROVISION RESOURCES =====
  logger.startSection('provision_resources')

  let successCount = 0
  let skipCount = 0

  if (await hasData(client, 'provision_resources')) {
    logger.skipSection('Provision resources')
  } else {
    for (const resource of provisionResources) {
      const entityId = idMaps.entities.get(resource.entity)

      if (!entityId) {
        logger.warning(
          `Skipping resource "${resource.url}" - entity not found: ${resource.entity}`
        )
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'provision_resources',
        columns: ['id', 'entity_id', 'url', 'status'],
        values: [id, entityId, resource.url, 'pending']
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
