import { pgTable, text, uuid, timestamp, integer, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { ideas } from './policies'
import { events } from './ingestion'
import { artifacts } from './knowledge'

// ============================================================================
// GOVERNMENT SUBSYSTEM (gov_)
// ============================================================================

// Territory
export const entities = pgTable('gov_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nativeName: text('native_name'),
  language: text('language').notNull(), // BCP 47 language tag
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

export const entityRelations = pgTable('gov_entity_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  relatedEntityId: uuid('related_entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueRelationship: uniqueIndex('gov_entity_relations_unique').on(table.entityId, table.relatedEntityId, table.relationshipType),
}))

// Leadership
export const people = pgTable('gov_people', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const administrations = pgTable('gov_administrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
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

export const members = pgTable('gov_members', {
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

// Provisions
export const provisionTypes = pgTable('gov_provision_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  label: text('label').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const provisions = pgTable('gov_provisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  descriptionShort: text('description_short'),
  description: text('description'),
  summaryMd: text('summary_md'),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'), // 'active', 'repealed', 'suspended'
  relevance: integer('relevance'),
  effectiveFrom: text('effective_from'), // date as text (YYYY-MM-DD)
  effectiveUntil: text('effective_until'), // date as text (YYYY-MM-DD)
  ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  displayData: jsonb('display_data').$type<{ items: Array<{ label: string; value: string }> }>().default({ items: [] }).notNull(),
  displayChanges: jsonb('display_changes').$type<{ items: Array<{ timestamp: string; label: string }> }>().default({ items: [] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const provisionTypeAssocs = pgTable('gov_provision_type_assocs', {
  id: uuid('id').primaryKey().defaultRandom(),
  provisionId: uuid('provision_id').notNull().references(() => provisions.id, { onDelete: 'cascade' }),
  typeId: uuid('type_id').notNull().references(() => provisionTypes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueAssociation: uniqueIndex('gov_provision_type_assocs_unique').on(table.provisionId, table.typeId),
}))

// Provision-Artifact junction table
export const provisionArtifacts = pgTable('gov_provision_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  provisionId: uuid('provision_id').notNull().references(() => provisions.id, { onDelete: 'cascade' }),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProvisionArtifact: uniqueIndex('gov_provision_artifacts_unique').on(table.provisionId, table.artifactId),
}))

// ============================================================================
// HISTORY SUBSYSTEM (gov_changes)
// ============================================================================
// A "change" is a manually tracked record of a modification to a government
// target (provision, entity, or administration). Changes capture both:
// - Actual changes: modifications that have taken effect (e.g., "Area C price raised to €7.50")
// - Planned changes: announced future modifications (e.g., "Metro Line 4 extension scheduled for 2028")
//
// Changes are linked to ingestion events that document them, providing
// traceability to source documents. The effective_date indicates when the
// change takes/took effect (distinct from created_at which tracks when
// the record was created in the system).
export const changes = pgTable('gov_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration']
  }).notNull(),
  targetId: uuid('target_id').notNull(),
  type: text('type', {
    enum: ['actual', 'planned']
  }).notNull().default('actual'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  relevance: integer('relevance'), // 1-10 scale, how significant is this change
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
