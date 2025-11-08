/**
 * Policies Domain Seeder
 * Seeds policies (regulatory frameworks), actions, and their relationships
 * Dependencies: ideas, entities (political_entities), administrations
 */

import { policies } from '../data/policies-data.mjs'
import { actions } from '../data/actions-data.mjs'
import { policyActions } from '../data/policy-actions-data.mjs'
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

  let policySuccessCount = 0
  let policySkipCount = 0

  if (await hasData(client, 'policies')) {
    logger.skipSection('Policies')
  } else {
    // Insert each policy (regulatory framework)
    for (const policy of policies) {
      // Look up foreign key IDs
      const entityId = idMaps.entities.get(policy.entity)
      const ideaId = policy.idea ? idMaps.ideas.get(policy.idea) : null

      if (!entityId) {
        logger.warning(
          `Skipping policy "${policy.title}" - entity not found: ${policy.entity}`
        )
        policySkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'policies',
        columns: [
          'id',
          'entity_id',
          'title',
          'description',
          'idea_id'
        ],
        values: [
          id,
          entityId,
          policy.title,
          policy.description,
          ideaId
        ]
      })

      policySuccessCount++
      idMaps.policies.set(policy.title, id)
    }

    if (policySkipCount > 0) {
      logger.warning(`Skipped ${policySkipCount} policies due to missing dependencies`)
    }

    logger.endSection('policies', policySuccessCount)
  }

  // ===== ACTIONS =====
  logger.startSection('actions')

  let actionSuccessCount = 0
  let actionSkipCount = 0

  if (await hasData(client, 'actions')) {
    logger.skipSection('Actions')
  } else {
    // Insert each action
    for (const action of actions) {
      // Look up administration ID
      const administrationId = idMaps.administrations.get(action.administration)

      if (!administrationId) {
        logger.warning(
          `Skipping action "${action.title}" - administration not found: ${action.administration}`
        )
        actionSkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'actions',
        columns: [
          'id',
          'administration_id',
          'title',
          'description'
        ],
        values: [
          id,
          administrationId,
          action.title,
          action.description
        ]
      })

      actionSuccessCount++
      idMaps.actions.set(action.title, id)
    }

    if (actionSkipCount > 0) {
      logger.warning(`Skipped ${actionSkipCount} actions due to missing dependencies`)
    }

    logger.endSection('actions', actionSuccessCount)
  }

  // ===== POLICY-ACTION RELATIONSHIPS =====
  logger.startSection('policy-action relationships')

  let relationshipSuccessCount = 0
  let relationshipSkipCount = 0

  if (await hasData(client, 'policy_actions')) {
    logger.skipSection('Policy-action relationships')
  } else {
    // Insert each relationship
    for (const relationship of policyActions) {
      // Look up policy and action IDs
      const policyId = idMaps.policies.get(relationship.policy)
      const actionId = idMaps.actions.get(relationship.action)

      if (!policyId || !actionId) {
        logger.warning(
          `Skipping relationship: ${relationship.policy} <-> ${relationship.action} (not found)`
        )
        relationshipSkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'policy_actions',
        columns: [
          'id',
          'policy_id',
          'action_id'
        ],
        values: [
          id,
          policyId,
          actionId
        ]
      })

      relationshipSuccessCount++
    }

    if (relationshipSkipCount > 0) {
      logger.warning(`Skipped ${relationshipSkipCount} relationships due to missing dependencies`)
    }

    logger.endSection('policy-action relationships', relationshipSuccessCount)
  }

  return idMaps
}
