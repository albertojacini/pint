/**
 * Administrations seeder
 * Seeds government administrations and their members
 * Dependencies: political-entities, people
 */

import { administrations, administrationMembers } from '../data/administrations-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed administrations into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedAdministrations(client, supabase, idMaps) {
  logger.startSection('administrations')

  // Check if administrations already exist
  if (await hasData(client, 'administrations')) {
    logger.skipSection('Administrations')
    return idMaps
  }

  let adminCount = 0
  let memberCount = 0
  let skipCount = 0

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
      table: 'administrations',
      columns: [
        'id',
        'entity_id',
        'name',
        'term_start',
        'term_end',
        'status',
        'description'
      ],
      values: [
        id,
        entityId,
        admin.name,
        admin.term_start,
        admin.term_end,
        admin.status,
        admin.description
      ]
    })

    adminCount++
    idMaps.administrations.set(admin.name, id)
  }

  logger.endSection('administrations', adminCount)

  // Now seed administration members
  logger.startSection('administration members')

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
      table: 'administration_members',
      columns: [
        'id',
        'administration_id',
        'person_id',
        'role_type',
        'role_title',
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

  return idMaps
}