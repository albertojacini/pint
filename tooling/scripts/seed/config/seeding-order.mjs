/**
 * Seeding order configuration
 * Defines the order in which seeders should be executed to respect foreign key constraints
 */

// Import all seeders (will be added as we create them)
// import { seedAdminUser } from '../seeders/admin-user.mjs'
// import { seedCategories } from '../seeders/categories.mjs'
// import { seedPoliticalEntities } from '../seeders/political-entities.mjs'
// import { seedEntityRelationships } from '../seeders/entity-relationships.mjs'
// import { seedPolicyTags } from '../seeders/policy-tags.mjs'
// import { seedGoals } from '../seeders/goals.mjs'
// import { seedPeople } from '../seeders/people.mjs'
// import { seedAdministrations } from '../seeders/administrations.mjs'
// import { seedMeasurables } from '../seeders/measurables.mjs'
// import { seedIdeas } from '../seeders/ideas.mjs'
// import { seedEffects } from '../seeders/effects.mjs'
// import { seedContributions } from '../seeders/contributions.mjs'
// import { seedPolicies } from '../seeders/policies.mjs'
// import { seedMetrics } from '../seeders/metrics.mjs'

/**
 * Get the ordered list of seeders to execute
 * @returns {Array<{name: string, fn: Function}>} Ordered array of seeder functions
 */
export function getSeedingOrder() {
  // This array defines the execution order
  // Each seeder should only depend on seeders that come before it
  return [
    // Independent seeders (no foreign key dependencies)
    // { name: 'admin-user', fn: seedAdminUser },
    // { name: 'categories', fn: seedCategories },
    // { name: 'political-entities', fn: seedPoliticalEntities },
    // { name: 'policy-tags', fn: seedPolicyTags },
    // { name: 'goals', fn: seedGoals },
    // { name: 'people', fn: seedPeople },
    // { name: 'measurables', fn: seedMeasurables },

    // Dependent seeders (require data from previous seeders)
    // { name: 'entity-relationships', fn: seedEntityRelationships }, // needs: political-entities
    // { name: 'administrations', fn: seedAdministrations }, // needs: political-entities, people
    // { name: 'ideas', fn: seedIdeas }, // needs: categories
    // { name: 'effects', fn: seedEffects }, // needs: ideas, measurables
    // { name: 'contributions', fn: seedContributions }, // needs: measurables, goals
    // { name: 'policies', fn: seedPolicies }, // needs: ideas, political-entities, administrations
    // { name: 'metrics', fn: seedMetrics }, // needs: categories
  ]
}

/**
 * Get seeder dependencies for validation
 * @returns {Object<string, string[]>} Map of seeder names to their dependencies
 */
export function getSeederDependencies() {
  return {
    'admin-user': [],
    'categories': [],
    'political-entities': [],
    'policy-tags': [],
    'goals': [],
    'people': [],
    'measurables': [],
    'entity-relationships': ['political-entities'],
    'administrations': ['political-entities', 'people'],
    'ideas': ['categories'],
    'effects': ['ideas', 'measurables'],
    'contributions': ['measurables', 'goals'],
    'policies': ['ideas', 'political-entities', 'administrations'],
    'metrics': ['categories']
  }
}