import { pgTable, text, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { documents } from './sources'

// ============================================================================
// KNOWLEDGE SUBSYSTEM (kno_)
// ============================================================================

export const artifacts = pgTable('kno_artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  artifactType: text('artifact_type', {
    enum: ['evolution', 'distribution', 'table', 'parameters', 'narrative']
  }).notNull(),
  content: text('content'),
  state: text('state', {
    enum: ['draft', 'partial', 'complete', 'stale']
  }).notNull().default('draft'),
  stateNotes: text('state_notes'),
  dataQuality: text('data_quality', {
    enum: ['verified', 'estimated', 'placeholder']
  }).notNull().default('verified'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const artifactSources = pgTable('kno_artifact_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueArtifactDocument: uniqueIndex('kno_artifact_sources_unique').on(table.artifactId, table.documentId),
}))
