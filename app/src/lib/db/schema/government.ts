import { pgTable, text, uuid, timestamp, integer, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { ideas } from './policies'
import { events } from './events'
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
    enum: ['neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational'],
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
  financialOverview: jsonb('financial_overview').$type<{
    currency: string // e.g. "EUR"
    unit: string // e.g. "millions"
    years: Array<{
      year: number
      type: 'actual' | 'forecast'
      items: Array<{
        type: 'revenue' | 'expense'
        amount: number
        label: string
      }>
    }>
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const entityRelations = pgTable(
  'gov_entity_relations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityId: uuid('entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    relatedEntityId: uuid('related_entity_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    relationshipType: text('relationship_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('gov_entity_relations_unique').on(
      table.entityId,
      table.relatedEntityId,
      table.relationshipType
    ),
  ]
)

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
  entityId: uuid('entity_id')
    .notNull()
    .references(() => entities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  termStart: timestamp('term_start', { withTimezone: true }).notNull(),
  termEnd: timestamp('term_end', { withTimezone: true }),
  status: text('status', { enum: ['active', 'historical', 'upcoming'] }).notNull(),
  description: text('description'),
  councilComposition: jsonb('council_composition').$type<
    Array<{
      party: string
      seats: number
      color: string
    }>
  >(),
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
  administrationId: uuid('administration_id')
    .notNull()
    .references(() => administrations.id, { onDelete: 'cascade' }),
  personId: uuid('person_id')
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  roleType: text('role_type', {
    enum: ['mayor', 'councilor', 'minister', 'president', 'governor', 'member'],
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
// PROVISIONS
// ============================================================================
// A provision is a distinct policy instrument that a government entity uses
// to intervene in public life. It represents the mechanism itself, not its
// specific parameters, zones, or implementation details.
//
// TEST: All three must pass for something to be a provision:
//
// 1. INSTRUMENT TEST: Is this the policy mechanism itself, not a parameter,
//    zone, or instance of a larger mechanism?
//    ✗ "Area C" (a zone within congestion pricing)
//    ✓ "Pedaggi urbani" (the congestion pricing mechanism)
//
// 2. PORTABILITY TEST: Could another city adopt this same type of instrument
//    (with their own parameters)?
//    ✗ "Area C" (Rome can't adopt Milan's Area C)
//    ✓ "Pedaggi urbani" (Rome could adopt congestion pricing)
//
// 3. REMOVAL TEST: If removed entirely, would it eliminate a whole category
//    of government intervention?
//    ✗ "Area C" (removing it still leaves Area B)
//    ✓ "Pedaggi urbani" (removing it ends all urban road pricing)
//
// Examples:
// ✓ Pedaggi urbani (urban road pricing mechanism)
// ✓ Partecipazione ATM (public transport company ownership)
// ✓ Regolamento dehors (outdoor seating regulation)
// ✗ Area C, Area B (zones within pedaggi urbani)
// ✗ Metro Line 4 (asset within transport system)
// ✗ €15/m² fee (parameter within dehors regulation)
// ============================================================================

// Evaluation Summary Widget Types
// These types define the structure of the console JSONB field
// which powers the provision detail page header console.

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none'
type TrendDirection = 'up' | 'down' | 'stable'

export type ScoreWidget = {
  type: 'score'
  value: number // 1-10
  maxValue?: number // default 10
  trend?: TrendDirection
  label?: string // e.g., "Funziona"
  confidence: ConfidenceLevel
}

export type ImpactWidget = {
  type: 'impact'
  balance: number // -1 (all losers) to +1 (all winners), 0 = neutral
  winners: Array<{ group: string; detail?: string }>
  losers: Array<{ group: string; detail?: string }>
  confidence: ConfidenceLevel
}

export type FinancialWidget = {
  type: 'financial'
  value: string // e.g., "€24M", "-€5M"
  label: string // e.g., "netto/anno", "costo/anno"
  isPositive: boolean // for color coding
  trend?: TrendDirection
  confidence: ConfidenceLevel
}

export type SentimentWidget = {
  type: 'sentiment'
  score: number // 0-100 percentage support
  label?: string // e.g., "Supporto misto"
  confidence: ConfidenceLevel
}

export type ActivityWidget = {
  type: 'activity'
  changesCount: number
  period: string // e.g., "ultimo anno", "ultimi 6 mesi"
  trend?: 'increasing' | 'decreasing' | 'stable'
  confidence: ConfidenceLevel
}

export type DataConfidenceWidget = {
  type: 'dataConfidence'
  level: ConfidenceLevel
  coverage: number // 0-100 percentage of data available
  label?: string // e.g., "Dati parziali"
}

export type StakeholderItem = {
  group: string // e.g., "Residenti", "Pendolari"
  impact: 'positive' | 'negative' | 'neutral' | 'mixed'
  size?: 'large' | 'medium' | 'small' // affected population size
  detail?: string // brief explanation
}

export type StakeholdersWidget = {
  type: 'stakeholders'
  items: StakeholderItem[]
  confidence: ConfidenceLevel
}

export type ProposalItem = {
  label: string // freeform label (e.g., "Rimuovere", "Estendere orari", "Aumentare tariffa")
  description: string // what the proposal suggests
  support: number // support count
  oppose: number // oppose count
}

export type ProposalsWidget = {
  type: 'proposals'
  items: ProposalItem[]
  confidence: ConfidenceLevel
}

export type CommunityWidget = {
  type: 'community'
  followers: number // people tracking this provision
  rating: number // average rating 1-5
  ratingsCount: number // number of ratings
  commentsCount: number // discussions/comments count
}

export type IdeasWidget = {
  type: 'ideas'
  items: Array<{
    title: string
    description?: string
  }>
}

export type EvaluationSummary = {
  effectiveness?: ScoreWidget
  impact?: ImpactWidget
  financial?: FinancialWidget
  sentiment?: SentimentWidget
  activity?: ActivityWidget
  dataConfidence?: DataConfidenceWidget
  stakeholders?: StakeholdersWidget
  proposals?: ProposalsWidget
  community?: CommunityWidget
  ideas?: IdeasWidget
}

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
  entityId: uuid('entity_id')
    .notNull()
    .references(() => entities.id, { onDelete: 'cascade' }),
  // Parent relationship for flexible hierarchy (use tags for classification)
  parentId: uuid('parent_id').references((): any => provisions.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  tagline: text('tagline'),
  // description: Factual snapshot of the provision in a single dense paragraph.
  // LANGUAGE: Native language of the parent entity (e.g., Italian for Milan).
  // FORMAT: Single paragraph, no headers. Use **bold** for key concepts/names,
  // *italics* for values and specifics (amounts, percentages, place names).
  // CONTENT: What it is, how it works, historical context, objectives, key results.
  // Keep data-rich with specific numbers. ~100-150 words.
  // NOTE: This is descriptive (WHAT), not evaluative (HOW WELL) - use analysis for evaluation.
  description: text('description'),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'), // 'active', 'repealed', 'suspended'
  relevance: integer('relevance'),
  effectiveFrom: text('effective_from'), // date as text (YYYY-MM-DD)
  effectiveUntil: text('effective_until'), // date as text (YYYY-MM-DD)
  ideaId: uuid('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  // ============================================================================
  // DERIVED DISPLAY FIELDS
  // Pre-computed fields optimized for UI rendering. These fields synthesize data
  // from source tables (artifacts, changes, events) into display-ready formats.
  // Regenerated by enrichment pipelines; do not edit manually.
  // ============================================================================
  // analysis: DERIVED DISPLAY FIELD. Q&A format evaluation synthesized from artifacts.
  // LANGUAGE: Native language of parent entity. FORMAT: Markdown, max 2 lines per Q&A.
  // Focuses on evaluative insights (HOW WELL), not description (WHAT).
  // Template questions (include only where data available):
  // **Is it working?** **Who wins, who loses?** **What's the financial picture?**
  // **How does it compare?** **What's changing?** **What do citizens say?**
  // **What's debated?** **Should it be changed/removed?** **What are the alternatives?**
  analysis: text('analysis'),
  // highlights: Key facts extracted from artifacts for the provision card/header.
  // Shows at-a-glance metrics (e.g., "Tariffa: €7.50", "Veicoli/giorno: 95.000").
  highlights: jsonb('highlights')
    .$type<{ items: Array<{ label: string; value: string }> }>()
    .default({ items: [] })
    .notNull(),
  // changelog: Timeline of significant changes derived from gov_changes table.
  // Powers the provision history UI with human-readable event labels.
  changelog: jsonb('changelog')
    .$type<{ items: Array<{ timestamp: string; label: string }> }>()
    .default({ items: [] })
    .notNull(),
  // console: Widget-based evaluation dashboard for the provision detail header.
  // Aggregates analysis from multiple sources into typed widgets (score, impact,
  // financial, sentiment, etc.). All widgets optional. See EvaluationSummary type.
  console: jsonb('console').$type<EvaluationSummary>(),

  // Metadata fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const provisionTypeAssocs = pgTable(
  'gov_provision_type_assocs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provisionId: uuid('provision_id')
      .notNull()
      .references(() => provisions.id, { onDelete: 'cascade' }),
    typeId: uuid('type_id')
      .notNull()
      .references(() => provisionTypes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('gov_provision_type_assocs_unique').on(table.provisionId, table.typeId),
  ]
)

// Provision-Artifact junction table
export const provisionArtifacts = pgTable(
  'gov_provision_artifacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provisionId: uuid('provision_id')
      .notNull()
      .references(() => provisions.id, { onDelete: 'cascade' }),
    artifactId: uuid('artifact_id')
      .notNull()
      .references(() => artifacts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('gov_provision_artifacts_unique').on(table.provisionId, table.artifactId),
  ]
)

// ============================================================================
// HISTORY SUBSYSTEM (gov_changes)
// ============================================================================
// A "change" is a manually tracked record of a modification to a government
// target (provision, entity, or administration). Changes capture both:
// - Actual changes: modifications that have taken effect (e.g., "Area C price raised to €7.50")
// - Planned changes: announced future modifications (e.g., "Metro Line 4 extension scheduled for 2028")
//
// Changes are linked to events that document them, providing
// traceability to source documents. The effective_date indicates when the
// change takes/took effect (distinct from created_at which tracks when
// the record was created in the system).
export const changes = pgTable('gov_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration'],
  }).notNull(),
  targetId: uuid('target_id').notNull(),
  type: text('type', {
    enum: ['actual', 'planned'],
  })
    .notNull()
    .default('actual'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  relevance: integer('relevance'), // 1-10 scale, how significant is this change
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
