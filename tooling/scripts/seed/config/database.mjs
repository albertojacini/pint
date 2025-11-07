/**
 * Database connection configuration
 */

import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './environment.mjs'

const { Client } = pg

/**
 * Create a PostgreSQL client
 * @returns {import('pg').Client} PostgreSQL client instance
 */
export function createDbClient() {
  return new Client({
    connectionString: DATABASE_URL
  })
}

/**
 * Create a Supabase client for admin operations
 * @returns {import('@supabase/supabase-js').SupabaseClient|null} Supabase client or null if not configured
 */
export function createSupabaseClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Test database connection
 * @param {import('pg').Client} client - PostgreSQL client
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection(client) {
  try {
    await client.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return false
  }
}