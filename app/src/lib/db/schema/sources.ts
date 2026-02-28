import { pgTable, text, uuid, timestamp, integer, jsonb, uniqueIndex, numeric, boolean, index } from 'drizzle-orm/pg-core'
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
    enum: ['official', 'news', 'academic', 'social', 'open_data', 'gazette', 'administration', 'academia', 'organization', 'other']
  }).notNull(),
  language: text('language'),
  reliabilityScore: numeric('reliability_score'),
  reliabilityTier: text('reliability_tier', {
    enum: ['official', 'verified', 'unverified']
  }).notNull().default('unverified'),
  updateFrequency: text('update_frequency'),
  accessMethod: text('access_method'),
  isActive: boolean('is_active').notNull().default(true),
  coverage: jsonb('coverage').$type<Record<string, unknown>>().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('idx_sou_publishers_type').on(table.publisherType),
  activeIdx: index('idx_sou_publishers_active').on(table.isActive),
  reliabilityIdx: index('idx_sou_publishers_reliability').on(table.reliabilityScore),
}))

export const documents = pgTable('sou_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  publisherId: uuid('publisher_id').references(() => publishers.id, { onDelete: 'set null' }),
  url: text('url'),
  title: text('title'),
  documentType: text('document_type', {
    enum: ['article', 'pdf', 'html', 'post', 'gazette_issue', 'press_release', 'minutes', 'report', 'legislation', 'other']
  }).notNull(),
  documentCategory: text('document_category', {
    enum: ['budget', 'regulation', 'contract', 'report', 'minutes', 'announcement', 'other']
  }),
  administrativeLevel: text('administrative_level', {
    enum: ['municipal', 'regional', 'national', 'eu', 'other']
  }),
  fiscalYear: integer('fiscal_year'),
  classificationMethod: text('classification_method', {
    enum: ['manual', 'auto', 'llm']
  }),
  language: text('language'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  rawContent: text('raw_content'),
  contentHash: text('content_hash'),
  filePath: text('file_path'),
  fetchStatus: text('fetch_status', {
    enum: ['pending', 'fetching', 'fetched', 'failed']
  }).notNull().default('pending'),
  fetchError: text('fetch_error'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
  processingStatus: text('processing_status', {
    enum: ['unprocessed', 'processing', 'processed', 'discarded', 'failed']
  }).notNull().default('unprocessed'),
  embeddingStatus: text('embedding_status', {
    enum: ['pending', 'processing', 'completed', 'failed']
  }).notNull().default('pending'),
  chunkCount: integer('chunk_count').default(0),
  summary: text('summary'),
  extractedData: jsonb('extracted_data').$type<Record<string, unknown>>().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  publisherIdx: index('idx_sou_documents_publisher').on(table.publisherId),
  typeIdx: index('idx_sou_documents_type').on(table.documentType),
  fetchStatusIdx: index('idx_sou_documents_fetch_status').on(table.fetchStatus),
  processingStatusIdx: index('idx_sou_documents_processing_status').on(table.processingStatus),
  publishedAtIdx: index('idx_sou_documents_published_at').on(table.publishedAt),
  urlIdx: index('idx_sou_documents_url').on(table.url),
  contentHashIdx: index('idx_sou_documents_content_hash').on(table.contentHash),
}))

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
