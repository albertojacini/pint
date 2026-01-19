import { pgTable, text, uuid, timestamp, integer, uniqueIndex, jsonb, type AnyPgColumn } from 'drizzle-orm/pg-core'
import { profiles } from './accounts'

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
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTaggable: uniqueIndex('tax_taggables_unique').on(table.tagId, table.taggableType, table.taggableId),
}))
