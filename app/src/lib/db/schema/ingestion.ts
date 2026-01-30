import { pgTable, text, uuid, timestamp, numeric, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { entities, administrations, changes } from './government'
import { documents } from './sources'

// ============================================================================
// INGESTION SUBSYSTEM (ing_)
// ============================================================================

export type SourceExtractedData = {
  topics?: string[]
  entitiesMentioned?: string[]
  datesMentioned?: string[]
  eventTypeHints?: string[]
  peopleMentioned?: string[]
}

export const sources = pgTable('ing_sources', {
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
  aiExtractedData: jsonb('ai_extracted_data').$type<SourceExtractedData>().default({}),

  // Promotion to sou_documents
  promotedDocumentId: uuid('promoted_document_id').references(() => documents.id, { onDelete: 'set null' }),

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

export const eventDocuments = pgTable('ing_event_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  relevance: text('relevance', {
    enum: ['primary', 'supporting', 'related']
  }).notNull().default('primary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueEventDocument: uniqueIndex('ing_event_documents_unique').on(table.eventId, table.documentId),
}))

// ============================================================================
// INGESTION PIPELINE SUBSYSTEM (ingpl_)
// ============================================================================

export const eventCandidates = pgTable('ingpl_event_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Draft event data
  title: text('title'),
  description: text('description'),
  eventType: text('event_type'),

  // Classification (AI-detected)
  detectedEntityId: uuid('detected_entity_id').references(() => entities.id, { onDelete: 'set null' }),
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

export const candidateDocuments = pgTable('ingpl_candidate_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => eventCandidates.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  relevance: text('relevance', {
    enum: ['primary', 'supporting', 'related']
  }).notNull().default('primary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueCandidateDocument: uniqueIndex('ingpl_candidate_documents_unique').on(table.candidateId, table.documentId),
}))

export type CandidateProposedData = {
  // For provisions
  title?: string
  description?: string
  tagline?: string
  analysis?: string
  highlights?: { items: Array<{ label: string; value: string }> }
  changelog?: { items: Array<{ timestamp: string; label: string }> }
  // For other targets - extensible
  [key: string]: unknown
}

export const changeCandidates = pgTable('ingpl_change_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => eventCandidates.id, { onDelete: 'cascade' }),

  // Target specification
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'administration']
  }).notNull(),
  targetId: uuid('target_id'),

  // Proposed change
  action: text('action', {
    enum: ['create', 'update', 'delete']
  }).notNull(),
  proposedData: jsonb('proposed_data').$type<CandidateProposedData>().default({}).notNull(),
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
