/**
 * Policy Metrics Domain Seeder
 * Seeds universal goals and category-specific metrics
 * Dependencies: categories (for metrics)
 */

import { goals } from '../data/goals-data.mjs'
import { metrics } from '../data/metrics-data.mjs'
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

  // ===== METRICS =====
  logger.startSection('metrics')

  if (await hasData(client, 'metrics')) {
    logger.skipSection('Metrics')
  } else {
    let successCount = 0
    let skipCount = 0

    // Insert metrics for each category
    for (const metricGroup of metrics) {
      // Look up category ID
      const categoryId = idMaps.categories.get(metricGroup.category)

      if (!categoryId) {
        logger.warning(`Skipping metrics for category "${metricGroup.category}" - category not found`)
        skipCount += metricGroup.metrics.length
        continue
      }

      // Insert each metric for this category
      for (const metricTitle of metricGroup.metrics) {
        const id = generateUUID()

        await insertQuery(client, {
          table: 'metrics',
          columns: ['id', 'category_id', 'title'],
          values: [id, categoryId, metricTitle]
        })

        successCount++
        // Store metric ID with compound key: "category:metric"
        idMaps.metrics.set(`${metricGroup.category}:${metricTitle}`, id)
      }
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} metrics due to missing categories`)
    }

    logger.endSection('metrics', successCount)
  }

  return idMaps
}
