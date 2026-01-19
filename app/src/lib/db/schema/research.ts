import { pgTable, text, uuid, timestamp, numeric } from 'drizzle-orm/pg-core'

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
})

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
  relevanceScore: numeric('relevance_score'),
  reliabilityScore: numeric('reliability_score'),
  evaluationNotes: text('evaluation_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
