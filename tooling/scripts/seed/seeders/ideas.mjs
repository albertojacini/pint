/**
 * Ideas seeder
 * Seeds abstract policy ideas
 * Dependencies: categories
 */

import { ideas } from '../data/ideas-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed ideas into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedIdeas(client, supabase, idMaps) {
  logger.startSection('ideas')

  // Check if ideas already exist
  if (await hasData(client, 'ideas')) {
    logger.skipSection('Ideas')
    return idMaps
  }

  let successCount = 0
  let skipCount = 0

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

  return idMaps
}