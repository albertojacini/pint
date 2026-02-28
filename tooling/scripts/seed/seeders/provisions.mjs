/**
 * Provisions Domain Seeder
 * Seeds provisions (actual policy data)
 * Dependencies: entities (political_entities)
 */

import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

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
 * Seed provisions domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedProvisions(client, supabase, idMaps) {
  // Load data dynamically
  const { provisions } = await loadData('provisions-data.mjs')
  const { taggablesData } = await loadData('taggables-data.mjs')
  const { events } = await loadData('events-data.mjs')
  const { changes } = await loadData('changes-data.mjs')

  // ===== PROVISIONS =====
  logger.startSection('provisions')

  let successCount = 0
  let skipCount = 0

  if (await hasData(client, 'gov_provisions')) {
    logger.skipSection('Provisions')
  } else {
    for (const provision of provisions) {
      // Try to get entity ID from idMaps, otherwise query database
      let entityId = idMaps.entities.get(provision.entity)

      if (!entityId) {
        // Query database for entity ID
        const result = await client.query(
          'SELECT id FROM gov_entities WHERE name = $1',
          [provision.entity]
        )
        if (result.rows.length > 0) {
          entityId = result.rows[0].id
          // Cache it for future use
          idMaps.entities.set(provision.entity, entityId)
        }
      }

      if (!entityId) {
        logger.warning(`Skipping provision "${provision.title}" - entity not found: ${provision.entity}`)
        skipCount++
        continue
      }

      // Look up idea ID if provided
      const ideaId = provision.idea
        ? idMaps.ideas.get(provision.idea)
        : null;

      const avatarUrl = provision.avatarUrl || null
      const id = generateUUID()

      const slug = generateSlug(provision.title)

      await insertQuery(client, {
        table: 'gov_provisions',
        columns: ['id', 'entity_id', 'title', 'slug', 'description', 'tagline', 'avatar_url', 'status', 'relevance', 'idea_id', 'analysis', 'highlights', 'changelog', 'console', 'starts_on', 'ends_on'],
        values: [
          id,
          entityId,
          provision.title,
          slug,
          provision.description,
          provision.tagline || null,
          avatarUrl,
          provision.status,
          provision.relevance || null,
          ideaId,
          provision.analysis || null,
          JSON.stringify(provision.highlights || { items: [] }),
          JSON.stringify(provision.changelog || { items: [] }),
          provision.console ? JSON.stringify(provision.console) : null,
          provision.startsOn || null,
          provision.endsOn || null
        ],
      })

      // Create type associations
      if (provision.types && provision.types.length > 0) {
        for (const typeCode of provision.types) {
          // Look up type ID from gov_provision_types table
          const typeResult = await client.query(
            'SELECT id FROM gov_provision_types WHERE code = $1',
            [typeCode]
          )

          if (typeResult.rows.length > 0) {
            const typeId = typeResult.rows[0].id
            const associationId = generateUUID()

            await insertQuery(client, {
              table: 'gov_provision_type_assocs',
              columns: ['id', 'provision_id', 'type_id'],
              values: [associationId, id, typeId]
            })
          } else {
            logger.warning(`Type "${typeCode}" not found for provision "${provision.title}"`)
          }
        }
      }

      successCount++
      idMaps.provisions.set(provision.title, id)
    }

    // Second pass: set parent_id for provisions with a parent reference
    for (const provision of provisions) {
      if (!provision.parent) continue
      const provisionId = idMaps.provisions.get(provision.title)
      const parentId = idMaps.provisions.get(provision.parent)
      if (provisionId && parentId) {
        await client.query(
          'UPDATE gov_provisions SET parent_id = $1 WHERE id = $2',
          [parentId, provisionId]
        )
      } else {
        logger.warning(`Could not set parent for "${provision.title}" - parent "${provision.parent}" not found`)
      }
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} provisions due to missing dependencies`)
    }

    logger.endSection('provisions', successCount)
  }

  // ===== PROVISION TAGGABLES =====
  logger.startSection('provision taggables')

  let taggablesCount = 0
  let taggablesSkipped = 0

  // Filter to only provision taggables
  const provisionTaggables = taggablesData.filter(t => t.taggableType === 'provision')

  for (const taggable of provisionTaggables) {
    // Look up tag ID by slug
    const tagId = idMaps.tags.get(taggable.tagSlug)
    // Look up provision ID by title
    const provisionId = idMaps.provisions.get(taggable.taggableName)

    if (!tagId || !provisionId) {
      logger.warning(
        `Skipping taggable: tag=${taggable.tagSlug}, provision=${taggable.taggableName} (not found)`
      )
      taggablesSkipped++
      continue
    }

    const id = generateUUID()

    await insertQuery(client, {
      table: 'tax_taggables',
      columns: ['id', 'tag_id', 'taggable_type', 'taggable_id'],
      values: [id, tagId, 'provision', provisionId]
    })

    taggablesCount++
  }

  if (taggablesSkipped > 0) {
    logger.warning(`Skipped ${taggablesSkipped} taggables due to missing references`)
  }

  logger.endSection('provision taggables', taggablesCount)

  // ===== EVENTS =====
  logger.startSection('events')

  let eventsCount = 0

  if (await hasData(client, 'eve_events')) {
    logger.skipSection('Events')
  } else {
    for (const event of events) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'eve_events',
        columns: ['id', 'title', 'description', 'description_short', 'type', 'date'],
        values: [
          id,
          event.title,
          event.description,
          event.descriptionShort || null,
          event.type,
          event.date
        ],
      })

      eventsCount++
      idMaps.events.set(event.title, id)
    }

    logger.endSection('events', eventsCount)
  }

  // ===== CHANGES =====
  logger.startSection('changes')

  let changesCount = 0
  let changesSkipped = 0

  if (await hasData(client, 'gov_changes')) {
    logger.skipSection('Changes')
  } else {
    for (const change of changes) {
      // Look up event ID
      const eventId = change.event ? idMaps.events.get(change.event) : null

      // Look up target ID based on target type
      let targetId = null
      if (change.targetType === 'provision') {
        targetId = idMaps.provisions.get(change.targetName)
      } else if (change.targetType === 'entity') {
        targetId = idMaps.entities.get(change.targetName)
      } else if (change.targetType === 'administration') {
        targetId = idMaps.administrations.get(change.targetName)
      }

      if (!targetId) {
        logger.warning(`Skipping change for "${change.targetName}" - ${change.targetType} not found`)
        changesSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gov_changes',
        columns: ['id', 'event_id', 'target_type', 'target_id', 'type', 'date', 'relevance', 'description'],
        values: [
          id,
          eventId,
          change.targetType,
          targetId,
          change.type || 'actual',
          change.date ? new Date(change.date).toISOString() : null,
          change.relevance || null,
          change.description || null
        ],
      })

      changesCount++
      idMaps.changes.set(`${change.event}-${change.targetName}`, id)
    }

    if (changesSkipped > 0) {
      logger.warning(`Skipped ${changesSkipped} changes due to missing dependencies`)
    }

    logger.endSection('changes', changesCount)
  }

  return idMaps
}
