#!/usr/bin/env node

/**
 * Main database seeding orchestrator
 * Coordinates the execution of all seeders in the correct order
 */

import 'dotenv/config'
import { createDbClient, createSupabaseClient, testConnection } from './config/database.mjs'
import { logger } from './utils/logger.mjs'
import { createIdMaps } from './utils/id-maps.mjs'
import { SEED_CONFIG } from './config/environment.mjs'

// Import all domain seeders
import { seedAuthDomain } from './seeders/auth-domain.mjs'
import { seedPoliticalGeography } from './seeders/political-geography.mjs'
import { seedPolicyClassification } from './seeders/policy-classification.mjs'
import { seedGovernmentAdministration } from './seeders/administration.mjs'
import { seedPolicyFramework } from './seeders/policy-framework.mjs'

/**
 * Main seeding function
 */
async function runSeed() {
  logger.start()

  // Create database client
  const client = createDbClient()
  const supabase = createSupabaseClient()

  try {
    // Connect to database
    await client.connect()

    // Test connection
    if (!(await testConnection(client))) {
      throw new Error('Failed to connect to database')
    }

    logger.connectionSuccess()

    // Initialize ID maps for cross-references
    const idMaps = createIdMaps()

    // Define seeding order (respects foreign key constraints)
    const seeders = [
      // Independent domains (no foreign key dependencies)
      { name: 'auth-domain', fn: seedAuthDomain },
      { name: 'political-geography', fn: seedPoliticalGeography },
      { name: 'policy-classification', fn: seedPolicyClassification },

      // Dependent domains (require data from previous domains)
      { name: 'government-administration', fn: seedGovernmentAdministration }, // needs: political-geography (entities)
      { name: 'policy-framework', fn: seedPolicyFramework }, // needs: policy-classification, political-geography, government-administration
    ]

    // Execute seeders in order
    for (const seeder of seeders) {
      if (SEED_CONFIG.verbose) {
        console.log(`\nRunning seeder: ${seeder.name}`)
      }

      try {
        await seeder.fn(client, supabase, idMaps)
      } catch (error) {
        logger.error(`Seeder ${seeder.name} failed:`, error)

        // Optionally continue with other seeders or stop
        if (process.env.STOP_ON_ERROR === 'true') {
          throw error
        }
      }
    }

    // Debug: Print ID maps if verbose mode
    if (SEED_CONFIG.verbose || SEED_CONFIG.debugUUIDs) {
      idMaps.debug()
    }

    logger.complete()

  } catch (error) {
    logger.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the seeding process
runSeed().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})