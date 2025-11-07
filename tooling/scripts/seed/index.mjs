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

// Import all seeders
import { seedAdminUser } from './seeders/admin-user.mjs'
import { seedCategories } from './seeders/categories.mjs'
import { seedPoliticalEntities } from './seeders/political-entities.mjs'
import { seedEntityRelationships } from './seeders/entity-relationships.mjs'
import { seedPolicyTags } from './seeders/policy-tags.mjs'
import { seedGoals } from './seeders/goals.mjs'
import { seedPeople } from './seeders/people.mjs'
import { seedAdministrations } from './seeders/administrations.mjs'
import { seedMeasurables } from './seeders/measurables.mjs'
import { seedIdeas } from './seeders/ideas.mjs'
import { seedEffects } from './seeders/effects.mjs'
import { seedContributions } from './seeders/contributions.mjs'
import { seedPolicies } from './seeders/policies.mjs'
import { seedMetrics } from './seeders/metrics.mjs'

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
      // Independent seeders (no foreign key dependencies)
      { name: 'admin-user', fn: seedAdminUser },
      { name: 'categories', fn: seedCategories },
      { name: 'political-entities', fn: seedPoliticalEntities },
      { name: 'policy-tags', fn: seedPolicyTags },
      { name: 'goals', fn: seedGoals },
      { name: 'people', fn: seedPeople },
      { name: 'measurables', fn: seedMeasurables },

      // Dependent seeders (require data from previous seeders)
      { name: 'entity-relationships', fn: seedEntityRelationships }, // needs: political-entities
      { name: 'administrations', fn: seedAdministrations }, // needs: political-entities, people
      { name: 'ideas', fn: seedIdeas }, // needs: categories
      { name: 'effects', fn: seedEffects }, // needs: ideas, measurables
      { name: 'contributions', fn: seedContributions }, // needs: measurables, goals
      { name: 'policies', fn: seedPolicies }, // needs: ideas, political-entities, administrations
      { name: 'metrics', fn: seedMetrics }, // needs: categories
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