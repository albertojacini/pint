/**
 * People seeder
 * Seeds politicians and government officials
 */

import { people } from '../data/people-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed people into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedPeople(client, supabase, idMaps) {
  logger.startSection('people')

  // Check if people already exist
  if (await hasData(client, 'people')) {
    logger.skipSection('People')
    return idMaps
  }

  // Insert each person
  for (const person of people) {
    const id = generateUUID()

    await insertQuery(client, {
      table: 'people',
      columns: ['id', 'full_name', 'avatar_url'],
      values: [id, person.full_name, person.avatar_url]
    })

    // Store ID mapping for later reference
    idMaps.people.set(person.full_name, id)
  }

  logger.endSection('people', people.length)

  return idMaps
}