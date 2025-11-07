/**
 * Environment configuration for database seeding
 */

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

// Supabase configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Admin user configuration
export const ADMIN_USER = {
  fullName: process.env.ADMIN_USER_FULL_NAME,
  email: process.env.ADMIN_USER_EMAIL,
  password: process.env.ADMIN_USER_PASSWORD
}

// Seeding configuration
export const SEED_CONFIG = {
  // Set to true to skip seeding if data already exists
  skipIfExists: process.env.SKIP_EXISTING_DATA === 'true',

  // Set to true to enable verbose logging
  verbose: process.env.VERBOSE_SEED === 'true',

  // Set to true to enable UUID debugging
  debugUUIDs: process.env.DEBUG_UUIDS === 'true'
}

/**
 * Check if Supabase is configured
 * @returns {boolean} True if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_SERVICE_ROLE_KEY)
}

/**
 * Check if admin user creation is configured
 * @returns {boolean} True if admin user can be created
 */
export function isAdminUserConfigured() {
  return Boolean(
    ADMIN_USER.email &&
    ADMIN_USER.password &&
    isSupabaseConfigured()
  )
}