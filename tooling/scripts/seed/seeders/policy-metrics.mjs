/**
 * Policy Metrics Domain Seeder
 * Seeds universal goals
 * Dependencies: none
 */

import { goals } from '../data/goals-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed policy metrics domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedPolicyMetrics(client, supabase, idMaps) {
  // ===== GOALS =====
  logger.startSection('goals')

  if (await hasData(client, 'goals')) {
    logger.skipSection('Goals')
  } else {
    // Insert each goal
    for (const goalTitle of goals) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'goals',
        columns: ['id', 'title'],
        values: [id, goalTitle]
      })

      // Store ID mapping for later reference
      idMaps.goals.set(goalTitle, id)
    }

    logger.endSection('goals', goals.length)
  }

  return idMaps
}
