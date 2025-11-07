/**
 * Authentication & User Management Domain Seeder
 * Seeds admin user via Supabase Auth
 * Dependencies: None
 */

import { logger } from '../utils/logger.mjs'
import { ADMIN_USER, isAdminUserConfigured } from '../config/environment.mjs'

/**
 * Seed authentication domain
 * @param {import('pg').Client} client - PostgreSQL client (unused here)
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedAuthDomain(client, supabase, idMaps) {
  // Check if admin user is configured
  if (!isAdminUserConfigured()) {
    if (!ADMIN_USER.email || !ADMIN_USER.password) {
      logger.adminUser.skipped('credentials not provided')
    } else if (!supabase) {
      logger.adminUser.skipped('SUPABASE_SERVICE_ROLE_KEY not provided')
    }
    return idMaps
  }

  logger.adminUser.creating()

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      logger.error('Error listing users:', listError.message)
      return idMaps
    }

    const userExists = existingUsers?.users?.some(u => u.email === ADMIN_USER.email)

    if (userExists) {
      logger.adminUser.exists()
      return idMaps
    }

    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_USER.fullName || null
      }
    })

    if (error) {
      logger.error('Error creating admin user:', error.message)
    } else {
      logger.adminUser.created(ADMIN_USER.email)

      // Store user ID if needed for future reference
      if (data?.user) {
        idMaps.set('users', 'admin', data.user.id)
      }
    }
  } catch (error) {
    logger.error('Unexpected error creating admin user:', error)
  }

  return idMaps
}
