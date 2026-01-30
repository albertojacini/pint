import { pgTable, text, uuid, timestamp, integer, numeric, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'
import { entities } from './government'
import { documents } from './sources'

// ============================================================================
// PROVISION PIPELINE SUBSYSTEM (propl_)
// ============================================================================

export const provisionDrafts = pgTable('propl_provision_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by'),

  inputDescription: text('input_description').notNull(),

  // Prompt generation phase
  researchPrompt: text('research_prompt'),

  // Research phase (loose coupling via research_id)
  researchTaskId: uuid('research_id'), // Links to resag_researches (no FK)
  researchSummary: text('research_summary'),

  // Simplified job status (no classification steps)
  jobStatus: text('job_status', {
    enum: ['input', 'prompt_generated', 'researching', 'research_complete', 'generating_draft', 'review', 'completed', 'failed']
  }).notNull().default('input'),
  errorMessage: text('error_message'),

  // Draft content (populated by LLM after research)
  title: text('title'),
  tagline: text('tagline'),
  description: text('description'),
  analysis: text('analysis'),
  provisionTypeCodes: text('provision_type_codes').array(), // Array of provision type codes
  highlights: jsonb('highlights').$type<{ items: Array<{ label: string; value: string }> }>().default({ items: [] }).notNull(),
  changelog: jsonb('changelog').$type<{ items: Array<{ timestamp: string; label: string }> }>().default({ items: [] }).notNull(),

  // Metadata
  confidence: numeric('confidence'),
  sourceUrls: text('source_urls').array(),
  relevance: integer('relevance'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const draftDocuments = pgTable('propl_draft_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  draftId: uuid('draft_id').notNull().references(() => provisionDrafts.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  relevance: text('relevance', {
    enum: ['primary', 'supporting', 'reference']
  }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueDraftDocument: uniqueIndex('propl_draft_documents_unique').on(table.draftId, table.documentId),
}))
