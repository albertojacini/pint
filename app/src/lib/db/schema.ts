import { pgTable, text, uuid, timestamp, integer, uniqueIndex, numeric, jsonb, type AnyPgColumn } from 'drizzle-orm/pg-core'
import type { EffectsDiagram } from '@pint/types'

// ============================================================================
// ACCOUNTS SUBSYSTEM (acc_)
// ============================================================================

export const userProfiles = pgTable('acc_profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// GOVERNMENT SUBSYSTEM (gov_)
// ============================================================================

// Territory
export const politicalEntities = pgTable('gov_entities', {
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

export const entityRelationships = pgTable('gov_entity_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  relatedEntityId: uuid('related_entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
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

export const administrationMembers = pgTable('gov_members', {
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
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
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

export const provisionTypeAssociations = pgTable('gov_provision_type_assocs', {
  id: uuid('id').primaryKey().defaultRandom(),
  provisionId: uuid('provision_id').notNull().references(() => provisions.id, { onDelete: 'cascade' }),
  typeId: uuid('type_id').notNull().references(() => provisionTypes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueAssociation: uniqueIndex('gov_provision_type_assocs_unique').on(table.provisionId, table.typeId),
}))

// History
export const changes = pgTable('gov_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration']
  }).notNull(),
  targetId: uuid('target_id').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// TAXONOMY SUBSYSTEM (tax_)
// ============================================================================

export const categories = pgTable('tax_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().default(0),
  onlyEntitiesWithTypes: text('only_entities_with_types').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tags = pgTable('tax_tags', {
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

export const taggables = pgTable('tax_taggables', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  taggableType: text('taggable_type').notNull(), // 'entity', 'provision', 'idea', 'event', 'administration'
  taggableId: uuid('taggable_id').notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTaggable: uniqueIndex('tax_taggables_unique').on(table.tagId, table.taggableType, table.taggableId),
}))

// ============================================================================
// POLICY SUBSYSTEM (pol_)
// ============================================================================

export const goals = pgTable('pol_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  maslowLevel: text('maslow_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const measurables = pgTable('pol_measurables', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  unit: text('unit').notNull(),
  dataSource: text('data_source'),
  measurementFrequency: text('measurement_frequency'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ideas = pgTable('pol_ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  effectsDiagram: jsonb('effects_diagram').$type<EffectsDiagram>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const effects = pgTable('pol_effects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  mechanism: text('mechanism'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const contributions = pgTable('pol_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  measurableId: uuid('measurable_id').notNull().references(() => measurables.id, { onDelete: 'cascade' }),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  contributionType: text('contribution_type', { enum: ['direct', 'indirect', 'supporting'] }).notNull(),
  weight: numeric('weight'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMeasurableGoal: uniqueIndex('pol_contributions_unique').on(table.measurableId, table.goalId),
}))

export const stakeholderGroups = pgTable('pol_stakeholders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  title: text('title').notNull(),
  category: text('category'),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// SOURCES SUBSYSTEM (sou_)
// ============================================================================

export const souPublishers = pgTable('sou_publishers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url'),
  feedUrl: text('feed_url'),
  publisherType: text('publisher_type', {
    enum: ['official', 'news', 'academic', 'social', 'open_data', 'gazette']
  }).notNull(),
  language: text('language'),
  reliabilityScore: numeric('reliability_score'),
  updateFrequency: text('update_frequency'),
  accessMethod: text('access_method'),
  isActive: text('is_active').notNull().default('true'),
  coverage: jsonb('coverage').$type<Record<string, unknown>>().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const souDocuments = pgTable('sou_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  publisherId: uuid('publisher_id').references(() => souPublishers.id, { onDelete: 'set null' }),
  url: text('url'),
  title: text('title'),
  documentType: text('document_type', {
    enum: ['article', 'pdf', 'post', 'gazette_issue', 'press_release', 'minutes', 'other']
  }).notNull(),
  language: text('language'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  rawContent: text('raw_content'),
  contentHash: text('content_hash'),
  summary: text('summary'),
  extractedData: jsonb('extracted_data').$type<Record<string, unknown>>().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  fetchStatus: text('fetch_status', {
    enum: ['pending', 'fetching', 'fetched', 'failed']
  }).notNull().default('pending'),
  processingStatus: text('processing_status', {
    enum: ['unprocessed', 'processing', 'processed', 'failed']
  }).notNull().default('unprocessed'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// INGESTION SUBSYSTEM (ing_)
// ============================================================================

export type EiExtractedData = {
  topics?: string[]
  entitiesMentioned?: string[]
  datesMentioned?: string[]
  eventTypeHints?: string[]
  peopleMentioned?: string[]
}

export const eiSources = pgTable('ing_sources', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Source identification
  url: text('url'),
  title: text('title'),
  sourceType: text('source_type', {
    enum: ['news', 'official_gazette', 'press_release', 'council_minutes', 'social', 'manual']
  }).notNull(),
  sourceName: text('source_name'),
  publishedAt: timestamp('published_at', { withTimezone: true }),

  // Content
  rawContent: text('raw_content'),

  // Fetch status
  fetchStatus: text('fetch_status', {
    enum: ['pending', 'fetching', 'fetched', 'failed']
  }).notNull().default('pending'),
  fetchError: text('fetch_error'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),

  // Processing status
  processingStatus: text('processing_status', {
    enum: ['unprocessed', 'processing', 'processed', 'discarded']
  }).notNull().default('unprocessed'),

  // AI-generated fields
  aiSummary: text('ai_summary'),
  aiExtractedData: jsonb('ai_extracted_data').$type<EiExtractedData>().default({}),

  // Promotion to sou_documents
  promotedDocumentId: uuid('promoted_document_id').references(() => souDocuments.id, { onDelete: 'set null' }),

  // Metadata
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const events = pgTable('ing_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  administrationId: uuid('administration_id').references(() => administrations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  descriptionShort: text('description_short'),
  description: text('description'),
  type: text('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// INGESTION PIPELINE SUBSYSTEM (ingpl_)
// ============================================================================

export const eiCandidates = pgTable('ingpl_event_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Draft event data
  title: text('title'),
  description: text('description'),
  eventType: text('event_type'),

  // Classification (AI-detected)
  detectedEntityId: uuid('detected_entity_id').references(() => politicalEntities.id, { onDelete: 'set null' }),
  detectedAdministrationId: uuid('detected_administration_id').references(() => administrations.id, { onDelete: 'set null' }),

  // AI metadata
  confidenceScore: numeric('confidence_score'),
  aiReasoning: text('ai_reasoning'),

  // Pipeline status
  status: text('status', {
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'merged']
  }).notNull().default('pending'),
  mergedIntoId: uuid('merged_into_id'),

  // Output (populated on approval)
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),

  // Review audit
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const eiCandidateDocuments = pgTable('ingpl_candidate_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => eiCandidates.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => souDocuments.id, { onDelete: 'cascade' }),
  relevance: text('relevance', {
    enum: ['primary', 'supporting', 'related']
  }).notNull().default('primary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueCandidateDocument: uniqueIndex('ingpl_candidate_documents_unique').on(table.candidateId, table.documentId),
}))

export type EiProposedData = {
  // For provisions
  title?: string
  description?: string
  descriptionShort?: string
  summaryMd?: string
  displayData?: { items: Array<{ label: string; value: string }> }
  displayChanges?: { items: Array<{ timestamp: string; label: string }> }
  // For other targets - extensible
  [key: string]: unknown
}

export const eiCandidateChanges = pgTable('ingpl_change_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => eiCandidates.id, { onDelete: 'cascade' }),

  // Target specification
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration']
  }).notNull(),
  targetId: uuid('target_id'),

  // Proposed change
  action: text('action', {
    enum: ['create', 'update', 'delete']
  }).notNull(),
  proposedData: jsonb('proposed_data').$type<EiProposedData>().default({}).notNull(),
  description: text('description'),

  // Review status
  status: text('status', {
    enum: ['pending', 'approved', 'rejected', 'modified']
  }).notNull().default('pending'),

  // Output (populated on approval)
  changeId: uuid('change_id').references(() => changes.id, { onDelete: 'set null' }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// PROVISION PIPELINE SUBSYSTEM (propl_)
// ============================================================================

export const provisionDrafts = pgTable('propl_provision_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => politicalEntities.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by'),

  inputDescription: text('input_description').notNull(),

  // Prompt generation phase
  researchPrompt: text('research_prompt'),

  // Research phase (loose coupling via research_id)
  researchTaskId: uuid('research_id'),           // Links to resag_researches (no FK)
  researchSummary: text('research_summary'),

  // Simplified job status (no classification steps)
  jobStatus: text('job_status', {
    enum: ['input', 'prompt_generated', 'researching', 'research_complete', 'generating_draft', 'review', 'completed', 'failed']
  }).notNull().default('input'),
  errorMessage: text('error_message'),

  // Draft content (populated by LLM after research)
  title: text('title'),
  descriptionShort: text('description_short'),
  description: text('description'),
  summaryMd: text('summary_md'),
  provisionTypeCodes: text('provision_type_codes').array(), // Array of provision type codes
  displayData: jsonb('display_data').$type<{ items: Array<{ label: string; value: string }> }>().default({ items: [] }).notNull(),
  displayChanges: jsonb('display_changes').$type<{ items: Array<{ timestamp: string; label: string }> }>().default({ items: [] }).notNull(),

  // Metadata
  confidence: numeric('confidence'),
  sourceUrls: text('source_urls').array(),
  relevance: integer('relevance'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// RESEARCH AGENT SUBSYSTEM (resag_)
// ============================================================================

export const resagResearches = pgTable('resag_researches', {
  id: uuid('id').primaryKey().defaultRandom(),
  input: text('input').notNull(),
  summary: text('summary'),
  status: text('status', {
    enum: ['pending', 'researching', 'completed', 'failed']
  }).notNull().default('researching'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const resagSources = pgTable('resag_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  researchId: uuid('research_id').notNull().references(() => resagResearches.id, { onDelete: 'cascade' }),
  url: text('url'),
  title: text('title'),
  researcherId: text('researcher_id'),
  rawContent: text('raw_content'),
  sourceSummary: text('source_summary'),
  sourceType: text('source_type', {
    enum: ['wikipedia', 'web', 'pdf', 'other']
  }),
  contentQuality: text('content_quality', {
    enum: ['good', 'partial', 'failed']
  }),
  fetchStatus: text('fetch_status', {
    enum: ['pending', 'fetching', 'completed', 'failed', 'skipped']
  }).notNull().default('pending'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
  relevanceScore: numeric('relevance_score'),
  reliabilityScore: numeric('reliability_score'),
  evaluationNotes: text('evaluation_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================================
// KNOWLEDGE SUBSYSTEM (kno_)
// ============================================================================

export const knoArtifacts = pgTable('kno_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  artifactType: text('artifact_type', {
    enum: ['time_series', 'evolution', 'breakdown', 'parameters', 'narrative', 'dataset', 'table']
  }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const knoArtifactSources = pgTable('kno_artifact_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  artifactId: uuid('artifact_id').notNull().references(() => knoArtifacts.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => souDocuments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueArtifactDocument: uniqueIndex('kno_artifact_sources_unique').on(table.artifactId, table.documentId),
}))

export const govProvisionArtifacts = pgTable('gov_provision_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  provisionId: uuid('provision_id').notNull().references(() => provisions.id, { onDelete: 'cascade' }),
  artifactId: uuid('artifact_id').notNull().references(() => knoArtifacts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProvisionArtifact: uniqueIndex('gov_provision_artifacts_unique').on(table.provisionId, table.artifactId),
}))

