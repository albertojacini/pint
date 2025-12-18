import { pgTable, text, uuid, timestamp, integer, uniqueIndex, numeric, jsonb, type AnyPgColumn } from 'drizzle-orm/pg-core'
import type { EffectsDiagram } from '@pint/types'

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
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'cascade' }),
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
  nativeName: text('native_name'),
  slug: text('slug').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  type: text('type', {
    enum: ['neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational']
  }).notNull(),
  population: integer('population'),
  scoreInnovation: integer('score_innovation'),
  scoreSustainability: integer('score_sustainability'),
  scoreImpact: integer('score_impact'),
  essentialStats: jsonb('essential_stats').$type<{
    area?: number
    density?: number
    gdpPerCapita?: number
    unemploymentRate?: number
    povertyRate?: number
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

// Unified tags table for all content types
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  category: text('category'), // 'policy-topic', 'geographic', 'impact-area', 'maturity'
  color: text('color'), // hex color for UI display
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Polymorphic tagging junction table
export const taggables = pgTable('taggables', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  taggableType: text('taggable_type').notNull(), // 'entity', 'provision', 'idea', 'event', 'administration'
  taggableId: uuid('taggable_id').notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTaggable: uniqueIndex('taggables_unique').on(table.tagId, table.taggableType, table.taggableId),
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

// Stakeholder groups (universal stakeholders affected by policies)
export const stakeholderGroups = pgTable('stakeholder_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  title: text('title').notNull(),
  category: text('category'),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})


// Posts table (simple content for testing forms and UI)
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  title: text('title').notNull(),
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
  councilComposition: jsonb('council_composition').$type<Array<{
    party: string
    seats: number
    color: string
  }>>(),
  electionData: jsonb('election_data').$type<{
    electionDate?: string
    turnout?: number
    nextElection?: string
    results?: Array<{
      candidate: string
      coalition: string
      percentage: number
      color: string
    }>
  }>(),
  extraMetadata: jsonb('extra_metadata').$type<Record<string, unknown>>(),
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
  icon: text('icon'),
  party: text('party'),
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
  effectsDiagram: jsonb('effects_diagram').$type<EffectsDiagram>(),
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
  slug: text('slug').notNull(),
  descriptionShort: text('description_short'),
  description: text('description'),
  summary: text('summary'),
  avatarUrl: text('avatar_url'),
  type: text('type', {
    enum: ['ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation']
  }).notNull(), // ownership: stakes in companies, property, infrastructure
                // contract: service agreements, concessions, partnerships
                // regulation: rules, ordinances, codes, standards
                // taxation: taxes, fees, tariffs
                // allocation: programs, subsidies, budgets, funds
                // designation: zones, landmarks, protected areas, institutions
  status: text('status').notNull().default('active'), // 'active', 'repealed', 'suspended'
  relevance: integer('relevance'),
  effectiveFrom: text('effective_from'), // date as text (YYYY-MM-DD)
  effectiveUntil: text('effective_until'), // date as text (YYYY-MM-DD)
  ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  extraData: jsonb('extra_data').$type<Record<string, unknown>>(), // Type-specific data validated with Zod
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Events: temporal occurrences that shape provisions
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  administrationId: uuid('administration_id').references(() => administrations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  descriptionShort: text('description_short'),
  description: text('description'),
  type: text('type').notNull(), // 'judicial_decree', 'legislative_vote', 'protest', 'executive_order', etc.
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Changes: polymorphic bridge between events and their targets (provisions, entities, administrations)
export const changes = pgTable('changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration']
  }).notNull(),
  targetId: uuid('target_id').notNull(),
  changeType: text('change_type', {
    enum: ['create', 'update', 'deactivate', 'activate', 'merge', 'split']
  }).notNull(),
  description: text('description'),
  effectiveAt: timestamp('effective_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Provision drafts: work-in-progress provisions from AI ingestion pipeline
export const provisionDrafts = pgTable('provision_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by'),

  inputDescription: text('input_description').notNull(),

  suggestedType: text('suggested_type', {
    enum: ['ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation']
  }),
  confirmedType: text('confirmed_type', {
    enum: ['ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation']
  }),

  jobId: text('job_id'),
  jobStatus: text('job_status', {
    enum: ['pending', 'classifying', 'classified', 'researching', 'completed', 'failed']
  }).notNull().default('pending'),
  errorMessage: text('error_message'),

  title: text('title'),
  descriptionShort: text('description_short'),
  description: text('description'),
  summary: text('summary'),
  extraData: jsonb('extra_data').$type<Record<string, unknown>>(),

  confidence: numeric('confidence'),
  sourceUrls: text('source_urls').array(),
  relevance: integer('relevance'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

