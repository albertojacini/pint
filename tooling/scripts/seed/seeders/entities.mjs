/**
 * Political Geography Domain Seeder
 * Seeds political entities and their hierarchical relationships
 * Dependencies: None
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BASE_DATA_DIR = join(__dirname, '..', 'data', 'base')

const REVENUE_COLUMNS = {
  entrate_tributarie: 'Tributi',
  entrate_extra_tributarie: 'Extra-tributi',
  trasferimenti_correnti: 'Trasferimenti',
  entrate_conto_capitale: 'Conto capitale',
  altre_entrate: 'Altre',
}

const EXPENSE_COLUMNS = {
  spese_correnti: 'Correnti',
  spese_conto_capitale: 'Conto capitale',
  spese_conto_terzi: 'Conto terzi',
  altre_spese: 'Altre',
}

function parseFinancialCsv(filename) {
  const csv = readFileSync(join(BASE_DATA_DIR, filename), 'utf-8')
  const [header, ...rows] = csv.trim().split('\n')
  const cols = header.split(',')

  const years = rows.filter(r => r.trim()).map(row => {
    const vals = row.split(',')
    const get = (col) => {
      const idx = cols.indexOf(col)
      return idx >= 0 ? parseFloat(vals[idx]) : 0
    }

    const items = []
    for (const [col, label] of Object.entries(REVENUE_COLUMNS)) {
      items.push({ type: 'revenue', amount: get(col), label })
    }
    for (const [col, label] of Object.entries(EXPENSE_COLUMNS)) {
      items.push({ type: 'expense', amount: get(col), label })
    }

    return { year: parseInt(vals[0]), type: vals[cols.indexOf('type')] || 'actual', items }
  })

  return { currency: 'EUR', unit: 'millions', years }
}

/**
 * Generate a slug from text
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

/**
 * Seed political geography domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedEntities(client, supabase, idMaps) {
  // Load data dynamically
  const { politicalEntities } = await loadData('political-entities-data.mjs')
  const { entityRelationships } = await loadData('entity-relationships-data.mjs')
  const { taggablesData } = await loadData('taggables-data.mjs')

  // ===== POLITICAL ENTITIES =====
  logger.startSection('political entities')

  if (await hasData(client, 'gov_entities')) {
    logger.skipSection('Political entities')
  } else {
    // Insert each political entity
    for (const entity of politicalEntities) {
      const id = generateUUID()
      const avatarUrl = entity.avatar_url || null
      const slug = generateSlug(entity.name)

      const financialOverview = entity.financial_overview_csv
        ? parseFinancialCsv(entity.financial_overview_csv)
        : null

      await insertQuery(client, {
        table: 'gov_entities',
        columns: [
          'id',
          'name',
          'native_name',
          'language',
          'slug',
          'description',
          'avatar_url',
          'type',
          'population',
          'score_innovation',
          'score_sustainability',
          'score_impact',
          'essential_stats',
          'performance_indicators',
          'community_metrics',
          'financial_overview'
        ],
        values: [
          id,
          entity.name,
          entity.native_name || null,
          entity.language,
          slug,
          entity.description,
          avatarUrl,
          entity.type,
          entity.population || null,
          entity.score_innovation || null,
          entity.score_sustainability || null,
          entity.score_impact || null,
          entity.essential_stats ? JSON.stringify(entity.essential_stats) : null,
          entity.performance_indicators ? JSON.stringify(entity.performance_indicators) : null,
          entity.community_metrics ? JSON.stringify(entity.community_metrics) : null,
          financialOverview ? JSON.stringify(financialOverview) : null
        ]
      })

      // Store ID mapping for later reference
      idMaps.entities.set(entity.name, id)
    }

    logger.endSection('political entities', politicalEntities.length)
  }

  // ===== ENTITY RELATIONSHIPS =====
  logger.startSection('entity relationships')

  if (await hasData(client, 'gov_entity_relations')) {
    logger.skipSection('Entity relationships')
  } else {
    // Insert each relationship
    let successCount = 0
    let skipCount = 0

    for (const relationship of entityRelationships) {
      // Look up entity IDs from the ID map
      const entityId = idMaps.entities.get(relationship.entity)
      const relatedEntityId = idMaps.entities.get(relationship.related)

      // Skip if either entity wasn't found
      if (!entityId || !relatedEntityId) {
        logger.warning(
          `Skipping relationship: ${relationship.entity} -> ${relationship.related} (entity not found)`
        )
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gov_entity_relations',
        columns: [
          'id',
          'entity_id',
          'related_entity_id',
          'relationship_type'
        ],
        values: [
          id,
          entityId,
          relatedEntityId,
          relationship.type
        ]
      })

      successCount++
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} relationships due to missing entities`)
    }

    logger.endSection('entity relationships', successCount)
  }

  // ===== ENTITY TAGGABLES =====
  logger.startSection('entity taggables')

  if (await hasData(client, 'tax_taggables')) {
    logger.skipSection('Taggables')
  } else {
    let taggablesCount = 0
    let taggablesSkipped = 0

    // Filter to only entity taggables
    const entityTaggables = taggablesData.filter(t => t.taggableType === 'entity')

    for (const taggable of entityTaggables) {
      // Look up tag ID by slug
      const tagId = idMaps.tags.get(taggable.tagSlug)
      // Look up entity ID by name
      const entityId = idMaps.entities.get(taggable.taggableName)

      if (!tagId || !entityId) {
        logger.warning(
          `Skipping taggable: tag=${taggable.tagSlug}, entity=${taggable.taggableName} (not found)`
        )
        taggablesSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'tax_taggables',
        columns: ['id', 'tag_id', 'taggable_type', 'taggable_id'],
        values: [id, tagId, 'entity', entityId]
      })

      taggablesCount++
    }

    if (taggablesSkipped > 0) {
      logger.warning(`Skipped ${taggablesSkipped} taggables due to missing references`)
    }

    logger.endSection('entity taggables', taggablesCount)
  }

  return idMaps
}
