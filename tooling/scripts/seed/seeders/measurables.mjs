/**
 * Measurables seeder
 * Seeds quantifiable metrics that policies affect
 */

import { measurables } from '../data/measurables-data.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed measurables into the database
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client (unused here)
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedMeasurables(client, supabase, idMaps) {
  logger.startSection('measurables')

  // Check if measurables already exist
  if (await hasData(client, 'measurables')) {
    logger.skipSection('Measurables')
    return idMaps
  }

  // Insert each measurable
  for (const measurable of measurables) {
    const id = generateUUID()

    await insertQuery(client, {
      table: 'measurables',
      columns: [
        'id',
        'title',
        'unit',
        'data_source',
        'measurement_frequency'
      ],
      values: [
        id,
        measurable.title,
        measurable.unit,
        measurable.data_source,
        measurable.measurement_frequency
      ]
    })

    // Store ID mapping for later reference
    idMaps.measurables.set(measurable.title, id)
  }

  logger.endSection('measurables', measurables.length)

  return idMaps
}