/**
 * Goals seeder
 * Seeds universal policy goals
 */

import { goals } from '../data/goals-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed goals into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedGoals(client, supabase, idMaps) {
  logger.startSection('goals')

  // Check if goals already exist
  if (await hasData(client, 'goals')) {
    logger.skipSection('Goals')
    return idMaps
  }

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

  return idMaps
}