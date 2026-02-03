/**
 * Voter Budget Game Seeder
 * Seeds gamvot_items, gamvot_sessions, and gamvot_votes tables
 * Dependencies: entities (gov_entities)
 */

import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed Voter Budget game data
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedVoterBudget(client, supabase, idMaps) {
  const { voterBudgetItems, voterBudgetSessions, voterBudgetVotes } = await loadData('voter-budget-data.mjs')

  // Create maps to track IDs
  const itemIdMap = new Map() // text -> id
  const sessionIdMap = new Map() // anonymousId -> id

  // ===== VOTER BUDGET ITEMS =====
  logger.startSection('voter budget items')

  let itemsCount = 0
  let itemsSkipped = 0

  if (await hasData(client, 'gamvot_items')) {
    logger.skipSection('Voter Budget Items')

    // Load existing items for reference
    const existingItems = await client.query(
      'SELECT id, text FROM gamvot_items'
    )
    for (const row of existingItems.rows) {
      itemIdMap.set(row.text, row.id)
    }
  } else {
    for (const item of voterBudgetItems) {
      // Look up entity ID
      let entityId = idMaps.entities.get(item.entity)

      if (!entityId) {
        // Query database for entity ID
        const result = await client.query(
          'SELECT id FROM gov_entities WHERE name = $1',
          [item.entity]
        )
        if (result.rows.length > 0) {
          entityId = result.rows[0].id
          idMaps.entities.set(item.entity, entityId)
        }
      }

      if (!entityId) {
        logger.warning(`Skipping item "${item.text}" - entity not found: ${item.entity}`)
        itemsSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gamvot_items',
        columns: ['id', 'entity_id', 'text', 'dimension'],
        values: [id, entityId, item.text, item.dimension],
      })

      itemIdMap.set(item.text, id)
      itemsCount++
    }

    if (itemsSkipped > 0) {
      logger.warning(`Skipped ${itemsSkipped} items due to missing entities`)
    }

    logger.endSection('voter budget items', itemsCount)
  }

  // ===== VOTER BUDGET SESSIONS =====
  logger.startSection('voter budget sessions')

  let sessionsCount = 0
  let sessionsSkipped = 0

  if (await hasData(client, 'gamvot_sessions')) {
    logger.skipSection('Voter Budget Sessions')

    // Load existing sessions for reference
    const existingSessions = await client.query(
      'SELECT id, anonymous_id FROM gamvot_sessions'
    )
    for (const row of existingSessions.rows) {
      sessionIdMap.set(row.anonymous_id, row.id)
    }
  } else {
    for (const session of voterBudgetSessions) {
      // Look up entity ID
      let entityId = idMaps.entities.get(session.entity)

      if (!entityId) {
        const result = await client.query(
          'SELECT id FROM gov_entities WHERE name = $1',
          [session.entity]
        )
        if (result.rows.length > 0) {
          entityId = result.rows[0].id
          idMaps.entities.set(session.entity, entityId)
        }
      }

      if (!entityId) {
        logger.warning(`Skipping session "${session.anonymousId}" - entity not found: ${session.entity}`)
        sessionsSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gamvot_sessions',
        columns: ['id', 'entity_id', 'anonymous_id', 'status', 'completed_at'],
        values: [
          id,
          entityId,
          session.anonymousId,
          session.status,
          session.status === 'completed' ? new Date().toISOString() : null,
        ],
      })

      sessionIdMap.set(session.anonymousId, id)
      sessionsCount++
    }

    if (sessionsSkipped > 0) {
      logger.warning(`Skipped ${sessionsSkipped} sessions due to missing entities`)
    }

    logger.endSection('voter budget sessions', sessionsCount)
  }

  // ===== VOTER BUDGET VOTES =====
  logger.startSection('voter budget votes')

  let votesCount = 0
  let votesSkipped = 0

  if (await hasData(client, 'gamvot_votes')) {
    logger.skipSection('Voter Budget Votes')
  } else {
    for (const vote of voterBudgetVotes) {
      const sessionId = sessionIdMap.get(vote.session)
      const itemId = itemIdMap.get(vote.itemText)

      if (!sessionId) {
        logger.warning(`Skipping vote - session not found: ${vote.session}`)
        votesSkipped++
        continue
      }

      if (!itemId) {
        logger.warning(`Skipping vote - item not found: ${vote.itemText}`)
        votesSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gamvot_votes',
        columns: ['id', 'session_id', 'item_id', 'amount'],
        values: [id, sessionId, itemId, vote.amount],
      })

      votesCount++
    }

    if (votesSkipped > 0) {
      logger.warning(`Skipped ${votesSkipped} votes due to missing references`)
    }

    logger.endSection('voter budget votes', votesCount)
  }

  return idMaps
}
