import { pgTable, text, uuid, timestamp, integer, uniqueIndex, numeric, jsonb } from 'drizzle-orm/pg-core'

// User profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Categories table (hierarchical policy categories)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references(() => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().default(0),
  onlyEntitiesWithTypes: text('only_entities_with_types').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Political entities table
export const politicalEntities = pgTable('political_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  type: text('type', {
    enum: ['neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational']
  }).notNull(),
  population: integer('population'),
  scoreInnovation: integer('score_innovation'),
  scoreSustainability: integer('score_sustainability'),
  scoreImpact: integer('score_impact'),
  identityData: jsonb('identity_data').$type<{
    countryCode?: string
    regionName?: string
    cityType?: string
    coatOfArmsUrl?: string
    officialWebsite?: string
    sisterCities?: number
  }>(),
  essentialStats: jsonb('essential_stats').$type<{
    area?: number
    density?: number
    gdpPerCapita?: number
    timezone?: string
    languages?: string[]
    elevation?: number
    founded?: string
  }>(),
  politicalLandscape: jsonb('political_landscape').$type<{
    currentMayor?: {
      name: string
      party: string
      partyColor: string
    }
    lastElection?: {
      date: string
      turnout: number // percentage
    }
    nextElection?: {
      date: string
    }
    councilComposition?: Array<{
      party: string
      seats: number
      color: string
    }>
  }>(),
  performanceIndicators: jsonb('performance_indicators').$type<{
    innovation?: {
      overall: number // 0-10
      subcategories?: Array<{
        name: string
        score: number // 0-10
      }>
    }
    sustainability?: {
      overall: number // 0-10
      subcategories?: Array<{
        name: string
        score: number // 0-10
      }>
    }
    impact?: {
      overall: number // 0-10
      subcategories?: Array<{
        name: string
        score: number // 0-10
      }>
    }
  }>(),
  communityMetrics: jsonb('community_metrics').$type<{
    userSatisfaction?: {
      overall: number // 0-10
      responsesCount: number
    }
    activeProjects?: number
    communityEngagement?: {
      totalUsers: number
      activeContributors: number
    }
    surveys?: Array<{
      title: string
      score: number // 0-10
      responses: number
    }>
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Entity relationships table (for parent/child relationships)
export const entityRelationships = pgTable('entity_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  relatedEntityId: uuid('related_entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRelationship: uniqueIndex('entity_relationships_unique').on(table.entityId, table.relatedEntityId, table.relationshipType),
}))

// Policy tags table (tag taxonomies)
export const policyTags = pgTable('policy_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Tag values table (individual values within each taxonomy)
export const tagValues = pgTable('tag_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').notNull().references(() => policyTags.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTagValue: uniqueIndex('tag_values_unique').on(table.tagId, table.value),
}))

// Goals table
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  maslowLevel: text('maslow_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})


// Posts table (simple content for testing forms and UI)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  title: text('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// People table (politicians, officials, etc.)
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Administrations table (government terms)
export const administrations = pgTable('administrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  termStart: timestamp('term_start', { withTimezone: true }).notNull(),
  termEnd: timestamp('term_end', { withTimezone: true }),
  status: text('status', { enum: ['active', 'historical', 'upcoming'] }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Administration members table (many-to-many with roles)
export const administrationMembers = pgTable('administration_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  administrationId: uuid('administration_id').notNull().references(() => administrations.id, { onDelete: 'cascade' }),
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  roleType: text('role_type', {
    enum: ['mayor', 'councilor', 'minister', 'president', 'governor', 'member']
  }).notNull(),
  roleTitle: text('role_title'),
  appointedAt: timestamp('appointed_at', { withTimezone: true }).notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  status: text('status', { enum: ['active', 'historical'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// POLICY FRAMEWORK DOMAIN
// ============================================================================

// Abstract policy ideas (entity-independent)
export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Universal quantifiable metrics (entity-independent)
export const measurables = pgTable('measurables', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  unit: text('unit').notNull(),
  dataSource: text('data_source'),
  measurementFrequency: text('measurement_frequency'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Effects: idea → measurable relationships
export const effects = pgTable('effects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  mechanism: text('mechanism'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Contributions: measurable → goal relationships
export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  contributionType: text('contribution_type', { enum: ['direct', 'indirect', 'supporting'] }).notNull(),
  weight: numeric('weight'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMeasurableGoal: uniqueIndex('contributions_unique').on(table.measurableId, table.goalId),
}))

// ============================================================================
// PROVISIONS DOMAIN
// ============================================================================
// State infrastructure (provisions), temporal events, and their relationships

// Provisions: institutional/legal/operational infrastructure owned by entities
export const provisions = pgTable('provisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // Legal: 'law', 'regulation', 'ordinance', 'decree', 'standard', 'code'
                                  // Institutional: 'institution', 'utility', 'agency', 'program', 'fund'
                                  // Planning: 'plan', 'zone', 'project', 'guideline'
                                  // Fiscal: 'tax', 'fee', 'budget', 'subsidy', 'tariff'
                                  // Administrative: 'procedure', 'agreement', 'delegation', 'protocol', 'policy'
  status: text('status').notNull().default('active'), // 'active', 'repealed', 'suspended'
  effectiveFrom: text('effective_from'), // date as text (YYYY-MM-DD)
  effectiveUntil: text('effective_until'), // date as text (YYYY-MM-DD)
  ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Events: temporal occurrences that shape provisions
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  administrationId: uuid('administration_id').references(() => administrations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'judicial_decree', 'legislative_vote', 'protest', 'executive_order', etc.
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Provision-Event relationships
export const provisionEvents = pgTable('provision_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  provisionId: uuid('provision_id').notNull().references(() => provisions.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type'), // 'establishes', 'repeals', 'modifies', 'influences'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProvisionEvent: uniqueIndex('provision_events_unique').on(table.provisionId, table.eventId),
}))
