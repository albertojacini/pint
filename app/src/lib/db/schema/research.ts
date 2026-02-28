import { pgTable, text, uuid, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core'
import { documents } from './sources'

// ============================================================================
// RESEARCH AGENT SUBSYSTEM (resag_)
// ============================================================================

export const researches = pgTable('resag_researches', {
  id: uuid('id').primaryKey().defaultRandom(),
  input: text('input').notNull(),
  summary: text('summary'),
  status: text('status', {
    enum: ['pending', 'researching', 'completed', 'failed']
  }).notNull().default('researching'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('idx_resag_researches_status').on(table.status),
}))

export const sources = pgTable('resag_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  researchId: uuid('research_id').notNull().references(() => researches.id, { onDelete: 'cascade' }),
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
  relevanceScore: doublePrecision('relevance_score'),
  reliabilityScore: doublePrecision('reliability_score'),
  evaluationNotes: text('evaluation_notes'),
  promotedDocumentId: uuid('promoted_document_id').references(() => documents.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  researchIdIdx: index('idx_resag_sources_research_id').on(table.researchId),
  fetchStatusIdx: index('idx_resag_sources_fetch_status').on(table.fetchStatus),
  urlIdx: index('idx_resag_sources_url').on(table.url),
}))
