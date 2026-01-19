import { pgTable, text, uuid, timestamp, integer, jsonb, uniqueIndex, numeric } from 'drizzle-orm/pg-core'
import { customType } from 'drizzle-orm/pg-core'

// Custom type for pgvector
const vector = customType<{ data: number[]; dpiverName: 'vector' }>({
  dataType() {
    return 'vector(1536)'
  },
})

// ============================================================================
// SOURCES SUBSYSTEM (sou_)
// ============================================================================

export const publishers = pgTable('sou_publishers', {
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

export const documents = pgTable('sou_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  publisherId: uuid('publisher_id').references(() => publishers.id, { onDelete: 'set null' }),
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

export const documentChunks = pgTable('sou_document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  contentTokens: integer('content_tokens'),
  embedding: vector('embedding'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueDocumentChunk: uniqueIndex('sou_document_chunks_unique').on(table.documentId, table.chunkIndex),
}))
