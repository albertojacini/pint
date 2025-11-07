/**
 * Contributions seeder
 * Seeds relationships between measurables and goals
 * Dependencies: measurables, goals
 */

import { contributions } from '../data/contributions-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed contributions into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedContributions(client, supabase, idMaps) {
  logger.startSection('contributions')

  // Check if contributions already exist
  if (await hasData(client, 'contributions')) {
    logger.skipSection('Contributions')
    return idMaps
  }

  let successCount = 0
  let skipCount = 0

  // Insert each contribution
  for (const contribution of contributions) {
    // Look up measurable and goal IDs
    const measurableId = idMaps.measurables.get(contribution.measurable)
    const goalId = idMaps.goals.get(contribution.goal)

    if (!measurableId || !goalId) {
      logger.warning(
        `Skipping contribution: ${contribution.measurable} -> ${contribution.goal} (not found)`
      )
      skipCount++
      continue
    }

    const id = generateUUID()

    await insertQuery(client, {
      table: 'contributions',
      columns: [
        'id',
        'measurable_id',
        'goal_id',
        'contribution_type',
        'weight',
        'description'
      ],
      values: [
        id,
        measurableId,
        goalId,
        contribution.contribution_type,
        contribution.weight,
        contribution.description
      ]
    })

    successCount++
    // Store contribution ID if needed (compound key)
    const contributionKey = `${contribution.measurable}:${contribution.goal}`
    idMaps.contributions.set(contributionKey, id)
  }

  if (skipCount > 0) {
    logger.warning(`Skipped ${skipCount} contributions due to missing dependencies`)
  }

  logger.endSection('contributions', successCount)

  return idMaps
}