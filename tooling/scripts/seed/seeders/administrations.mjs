/**
 * Government Administration Domain Seeder
 * Seeds people, administrations, and their membership relationships
 * Dependencies: political_entities
 */

import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed government administration domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedAdministrations(client, supabase, idMaps) {
  // Load data dynamically
  const { people } = await loadData('people-data.mjs')
  const { administrations, administrationMembers } = await loadData('administrations-data.mjs')

  // ===== PEOPLE =====
  logger.startSection('people')

  if (await hasData(client, 'gov_people')) {
    logger.skipSection('People')
  } else {
    // Insert each person
    for (const person of people) {
      const id = generateUUID()

      await insertQuery(client, {
        table: 'gov_people',
        columns: ['id', 'full_name', 'avatar_url'],
        values: [id, person.full_name, person.avatar_url]
      })

      // Store ID mapping for later reference
      idMaps.people.set(person.full_name, id)
    }

    logger.endSection('people', people.length)
  }

  // ===== ADMINISTRATIONS =====
  logger.startSection('administrations')

  let adminCount = 0
  let memberCount = 0
  let skipCount = 0

  if (await hasData(client, 'gov_administrations')) {
    logger.skipSection('Administrations')
  } else {
    // Insert each administration
    for (const admin of administrations) {
      // Look up entity ID
      const entityId = idMaps.entities.get(admin.entity)

      if (!entityId) {
        logger.warning(`Skipping administration "${admin.name}" - entity not found: ${admin.entity}`)
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gov_administrations',
        columns: [
          'id',
          'entity_id',
          'name',
          'term_start',
          'term_end',
          'status',
          'description',
          'council_composition',
          'election_data',
          'extra_metadata'
        ],
        values: [
          id,
          entityId,
          admin.name,
          admin.term_start,
          admin.term_end,
          admin.status,
          admin.description,
          admin.council_composition ? JSON.stringify(admin.council_composition) : null,
          admin.election_data ? JSON.stringify(admin.election_data) : null,
          admin.extra_metadata ? JSON.stringify(admin.extra_metadata) : null
        ]
      })

      adminCount++
      idMaps.administrations.set(admin.name, id)
    }

    logger.endSection('administrations', adminCount)
  }

  // ===== ADMINISTRATION MEMBERS =====
  logger.startSection('administration members')

  if (await hasData(client, 'gov_members')) {
    logger.skipSection('Administration members')
  } else {
    for (const member of administrationMembers) {
      // Look up administration and person IDs
      const adminId = idMaps.administrations.get(member.admin)
      const personId = idMaps.people.get(member.person)

      if (!adminId || !personId) {
        logger.warning(
          `Skipping member: ${member.person} in ${member.admin} (not found)`
        )
        skipCount++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'gov_members',
        columns: [
          'id',
          'administration_id',
          'person_id',
          'role_type',
          'role_title',
          'icon',
          'party',
          'appointed_at',
          'left_at',
          'status'
        ],
        values: [
          id,
          adminId,
          personId,
          member.role_type,
          member.role_title,
          member.icon || null,
          member.party || null,
          member.appointed_at,
          member.left_at,
          member.status
        ]
      })

      memberCount++
    }

    if (skipCount > 0) {
      logger.warning(`Skipped ${skipCount} items due to missing dependencies`)
    }

    logger.endSection('administration members', memberCount)
  }

  return idMaps
}
