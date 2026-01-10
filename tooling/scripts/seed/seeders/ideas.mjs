/**
 * Ideas Domain Seeder
 * Seeds the complete policy analysis framework:
 * goal → idea → effect → measurable → contribution → goal (circular relationship)
 * Dependencies: taxonomy (categories)
 */

import { loadData } from '../utils/data-loader.mjs'
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
  // Load data dynamically
  const { goals } = await loadData('goals-data.mjs')
  const { stakeholderGroups } = await loadData('stakeholder-groups-data.mjs')
  const { ideas } = await loadData('ideas-data.mjs')
  const { measurables } = await loadData('measurables-data.mjs')
  const { effects } = await loadData('effects-data.mjs')
  const { contributions } = await loadData('contributions-data.mjs')

  // ===== GOALS =====
  logger.startSection('goals')

  if (await hasData(client, 'pol_goals')) {
    logger.skipSection('Goals')
  } else {
    // Insert each goal
    for (const goalTitle of goals) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'pol_goals',
        columns: ['id', 'title'],
        values: [id, goalTitle]
      })

      // Store ID mapping for later reference
      idMaps.goals.set(goalTitle, id)
    }

    logger.endSection('goals', goals.length)
  }

  // ===== STAKEHOLDER GROUPS =====
  logger.startSection('stakeholder_groups')

  if (await hasData(client, 'pol_stakeholders')) {
    logger.skipSection('Stakeholder Groups')
  } else {
    // Insert each stakeholder group
    for (const group of stakeholderGroups) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'pol_stakeholders',
        columns: ['id', 'name', 'title', 'category', 'icon'],
        values: [id, group.name, group.title, group.category, group.icon]
      })

      // Store ID mapping for later reference (by name)
      idMaps.stakeholderGroups.set(group.name, id)
    }

    logger.endSection('stakeholder_groups', stakeholderGroups.length)
  }

  // ===== MEASURABLES =====
  logger.startSection('measurables')

  if (await hasData(client, 'pol_measurables')) {
    logger.skipSection('Measurables')
  } else {
    // Insert each measurable
    for (const measurable of measurables) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'pol_measurables',
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

  if (await hasData(client, 'pol_ideas')) {
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

      // Process effects diagram if present
      let effectsDiagram = null
      if (idea.effectsDiagram) {
        // Resolve stakeholder group names to IDs
        effectsDiagram = {
          stakeholderGroups: idea.effectsDiagram.stakeholderGroups.map(sg => {
            const stakeholderGroupId = idMaps.stakeholderGroups.get(sg.stakeholderGroupName)
            if (!stakeholderGroupId) {
              logger.warning(`Stakeholder group not found: ${sg.stakeholderGroupName}`)
              return null
            }
            return {
              stakeholderGroupId,
              subtitle: sg.subtitle,
              effects: sg.effects
            }
          }).filter(sg => sg !== null)
        }
      }

      await insertQuery(client, {
        table: 'pol_ideas',
        columns: [
          'id',
          'category_id',
          'title',
          'description',
          'effects_diagram'
        ],
        values: [
          id,
          categoryId,
          idea.title,
          idea.description,
          effectsDiagram ? JSON.stringify(effectsDiagram) : null
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

  if (await hasData(client, 'pol_effects')) {
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
        table: 'pol_effects',
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

  if (await hasData(client, 'pol_contributions')) {
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
        table: 'pol_contributions',
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
