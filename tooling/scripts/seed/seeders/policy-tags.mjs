/**
 * Policy tags seeder
 * Seeds policy tag taxonomies and their values
 */

import { policyTags } from '../data/policy-tags-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed policy tags into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedPolicyTags(client, supabase, idMaps) {
  logger.startSection('policy tags')

  // Check if tags already exist
  if (await hasData(client, 'policy_tags')) {
    logger.skipSection('Policy tags')
    return idMaps
  }

  let tagCount = 0
  let valueCount = 0

  // Insert each tag taxonomy and its values
  for (const [tagName, values] of Object.entries(policyTags)) {
    const tagId = generateUUID()

    // Insert the tag
    await insertQuery(client, {
      table: 'policy_tags',
      columns: ['id', 'name'],
      values: [tagId, tagName]
    })

    tagCount++
    idMaps.tags.set(tagName, tagId)

    // Insert the tag values
    for (const value of values) {
      const valueId = generateUUID()

      await insertQuery(client, {
        table: 'tag_values',
        columns: ['id', 'tag_id', 'value'],
        values: [valueId, tagId, value]
      })

      valueCount++
      // Store value ID with compound key: "tagName:value"
      idMaps.tagValues.set(`${tagName}:${value}`, valueId)
    }
  }

  logger.endSection('policy tags', tagCount)
  logger.info(`  └─ ${valueCount} tag values inserted`)

  return idMaps
}