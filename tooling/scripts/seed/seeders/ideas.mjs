/**
 * Ideas Domain Seeder
 * Seeds the complete policy analysis framework:
 * goal → idea → effect → measurable → contribution → goal (circular relationship)
 * Dependencies: taxonomy (categories)
 */

import { goals } from '../data/goals-data.mjs'
import { ideas } from '../data/ideas-data.mjs'
import { measurables } from '../data/measurables-data.mjs'
import { effects } from '../data/effects-data.mjs'
import { contributions } from '../data/contributions-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed ideas domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedIdeas(client, supabase, idMaps) {
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

  // ===== MEASURABLES =====
  logger.startSection('measurables')

  if (await hasData(client, 'measurables')) {
    logger.skipSection('Measurables')
  } else {
    // Insert each measurable
    for (const measurable of measurables) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'measurables',
        columns: [
          'id',
          'title',
          'unit',
          'data_source',
          'measurement_frequency'
        ],
        values: [
          id,
          measurable.title,
          measurable.unit,
          measurable.data_source,
          measurable.measurement_frequency
        ]
      })

      // Store ID mapping for later reference
      idMaps.measurables.set(measurable.title, id)
    }

    logger.endSection('measurables', measurables.length)
  }

  // ===== IDEAS =====
  logger.startSection('ideas')

  let successCount = 0
  let skipCount = 0

  if (await hasData(client, 'ideas')) {
    logger.skipSection('Ideas')
  } else {
    // Insert each idea
    for (const idea of ideas) {
      // Look up category ID
      const categoryId = idMaps.categories.get(idea.category)

      if (!categoryId) {
        logger.warning(`Skipping idea "${idea.title}" - category not found: ${idea.category}`)
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'ideas',
        columns: [
          'id',
          'category_id',
          'title',
          'description'
        ],
        values: [
          id,
          categoryId,
          idea.title,
          idea.description
        ]
      })

      successCount++
      // Store ID mapping for later reference
      idMaps.ideas.set(idea.title, id)
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} ideas due to missing categories`)
    }

    logger.endSection('ideas', successCount)
  }

  // ===== EFFECTS =====
  logger.startSection('effects')

  successCount = 0
  skipCount = 0

  if (await hasData(client, 'effects')) {
    logger.skipSection('Effects')
  } else {
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
          'title',
          'description',
          'mechanism'
        ],
        values: [
          id,
          ideaId,
          measurableId,
          effect.title,
          effect.description,
          effect.mechanism
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
  }

  // ===== CONTRIBUTIONS =====
  logger.startSection('contributions')

  successCount = 0
  skipCount = 0

  if (await hasData(client, 'contributions')) {
    logger.skipSection('Contributions')
  } else {
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
  }

  return idMaps
}
