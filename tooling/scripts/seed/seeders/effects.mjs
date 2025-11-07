/**
 * Effects seeder
 * Seeds relationships between ideas and measurables
 * Dependencies: ideas, measurables
 */

import { effects } from '../data/effects-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed effects into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedEffects(client, supabase, idMaps) {
  logger.startSection('effects')

  // Check if effects already exist
  if (await hasData(client, 'effects')) {
    logger.skipSection('Effects')
    return idMaps
  }

  let successCount = 0
  let skipCount = 0

  // Insert each effect
  for (const effect of effects) {
    // Look up idea and measurable IDs
    const ideaId = idMaps.ideas.get(effect.idea)
    const measurableId = idMaps.measurables.get(effect.measurable)

    if (!ideaId || !measurableId) {
      logger.warning(
        `Skipping effect: ${effect.idea} -> ${effect.measurable} (not found)`
      )
      skipCount++
      continue
    }

    const id = generateUUID()

    await insertQuery(client, {
      table: 'effects',
      columns: [
        'id',
        'idea_id',
        'measurable_id',
        'direction',
        'intensity',
        'confidence',
        'evidence_description'
      ],
      values: [
        id,
        ideaId,
        measurableId,
        effect.direction,
        effect.intensity,
        effect.confidence,
        effect.evidence
      ]
    })

    successCount++
    // Store effect ID if needed (compound key)
    const effectKey = `${effect.idea}:${effect.measurable}`
    idMaps.effects.set(effectKey, id)
  }

  if (skipCount > 0) {
    logger.warning(`Skipped ${skipCount} effects due to missing dependencies`)
  }

  logger.endSection('effects', successCount)

  return idMaps
}