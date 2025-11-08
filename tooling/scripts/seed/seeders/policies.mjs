/**
 * Policies Domain Seeder
 * Seeds concrete policy implementations
 * Dependencies: ideas, entities (political_entities), administrations
 */

import { policies } from '../data/policies-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed policies domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedPolicies(client, supabase, idMaps) {
  // ===== POLICIES =====
  logger.startSection('policies')

  let successCount = 0
  let skipCount = 0

  if (await hasData(client, 'policies')) {
    logger.skipSection('Policies')
  } else {
    // Insert each policy
    for (const policy of policies) {
      // Look up foreign key IDs
      const ideaId = idMaps.ideas.get(policy.idea)
      const entityId = idMaps.entities.get(policy.entity)
      const administrationId = idMaps.administrations.get(policy.administration)

      if (!ideaId || !entityId || !administrationId) {
        logger.warning(
          `Skipping policy "${policy.title}" - missing dependency (idea: ${!!ideaId}, entity: ${!!entityId}, admin: ${!!administrationId})`
        )
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'policies',
        columns: [
          'id',
          'idea_id',
          'entity_id',
          'administration_id',
          'title',
          'description',
          'status',
          'start_date',
          'end_date',
          'budget_allocated',
          'budget_currency',
          'implementation_notes'
        ],
        values: [
          id,
          ideaId,
          entityId,
          administrationId,
          policy.title,
          policy.description,
          policy.status,
          policy.start_date,
          policy.end_date,
          policy.budget_allocated,
          policy.budget_currency,
          policy.implementation_notes
        ]
      })

      successCount++
      // Store policy ID
      idMaps.policies.set(policy.title, id)
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} policies due to missing dependencies`)
    }

    logger.endSection('policies', successCount)
  }

  return idMaps
}
