/**
 * Provisions Domain Seeder
 * Seeds provisions (state infrastructure), events, and their relationships
 * Dependencies: ideas, entities (political_entities), administrations
 */

import { provisions } from '../data/provisions-data.mjs'
import { events } from '../data/events-data.mjs'
import { provisionEvents } from '../data/provision-events-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed provisions domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedProvisions(client, supabase, idMaps) {
  // ===== PROVISIONS =====
  logger.startSection('provisions')

  let provisionSuccessCount = 0
  let provisionSkipCount = 0

  if (await hasData(client, 'provisions')) {
    logger.skipSection('Provisions')
  } else {
    // Insert each provision
    for (const provision of provisions) {
      // Look up foreign key IDs
      const entityId = idMaps.entities.get(provision.entity)
      const ideaId = provision.idea ? idMaps.ideas.get(provision.idea) : null

      if (!entityId) {
        logger.warning(
          `Skipping provision "${provision.title}" - entity not found: ${provision.entity}`
        )
        provisionSkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'provisions',
        columns: [
          'id',
          'entity_id',
          'title',
          'description',
          'type',
          'status',
          'effective_from',
          'effective_until',
          'idea_id'
        ],
        values: [
          id,
          entityId,
          provision.title,
          provision.description,
          provision.type,
          provision.status || 'active',
          provision.effectiveFrom || null,
          provision.effectiveUntil || null,
          ideaId
        ]
      })

      provisionSuccessCount++
      idMaps.provisions.set(provision.title, id)
    }

    if (provisionSkipCount > 0) {
      logger.warning(`Skipped ${provisionSkipCount} provisions due to missing dependencies`)
    }

    logger.endSection('provisions', provisionSuccessCount)
  }

  // ===== EVENTS =====
  logger.startSection('events')

  let eventSuccessCount = 0
  let eventSkipCount = 0

  if (await hasData(client, 'events')) {
    logger.skipSection('Events')
  } else {
    // Insert each event
    for (const event of events) {
      // Look up administration ID (nullable for non-governmental events)
      const administrationId = event.administration
        ? idMaps.administrations.get(event.administration)
        : null

      // Only skip if administration was specified but not found
      if (event.administration && !administrationId) {
        logger.warning(
          `Skipping event "${event.title}" - administration not found: ${event.administration}`
        )
        eventSkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'events',
        columns: [
          'id',
          'administration_id',
          'title',
          'description',
          'type',
          'occurred_at'
        ],
        values: [
          id,
          administrationId,
          event.title,
          event.description,
          event.type,
          event.occurredAt
        ]
      })

      eventSuccessCount++
      idMaps.events.set(event.title, id)
    }

    if (eventSkipCount > 0) {
      logger.warning(`Skipped ${eventSkipCount} events due to missing dependencies`)
    }

    logger.endSection('events', eventSuccessCount)
  }

  // ===== PROVISION-EVENT RELATIONSHIPS =====
  logger.startSection('provision-event relationships')

  let relationshipSuccessCount = 0
  let relationshipSkipCount = 0

  if (await hasData(client, 'provision_events')) {
    logger.skipSection('Provision-event relationships')
  } else {
    // Insert each relationship
    for (const relationship of provisionEvents) {
      // Look up provision and event IDs
      const provisionId = idMaps.provisions.get(relationship.provision)
      const eventId = idMaps.events.get(relationship.event)

      if (!provisionId || !eventId) {
        logger.warning(
          `Skipping relationship: ${relationship.provision} <-> ${relationship.event} (not found)`
        )
        relationshipSkipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'provision_events',
        columns: [
          'id',
          'provision_id',
          'event_id',
          'relationship_type'
        ],
        values: [
          id,
          provisionId,
          eventId,
          relationship.relationshipType || null
        ]
      })

      relationshipSuccessCount++
    }

    if (relationshipSkipCount > 0) {
      logger.warning(`Skipped ${relationshipSkipCount} relationships due to missing dependencies`)
    }

    logger.endSection('provision-event relationships', relationshipSuccessCount)
  }

  return idMaps
}
