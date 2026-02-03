import { pgTable, text, uuid, timestamp, integer, uniqueIndex, index, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { profiles } from './accounts'
import { entities } from './government'

// ============================================================================
// VOTER BUDGET GAME (gamvot_)
// A participatory budgeting game where users allocate €100 across ideas,
// likes, and dislikes for their city.
// ============================================================================

// Items that users can vote on (shared pool per entity)
export const items = pgTable('gamvot_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  dimension: text('dimension', {
    enum: ['ideas', 'likes', 'dislikes'],
  }).notNull(),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  entityDimensionIdx: index('gamvot_items_entity_dimension').on(table.entityId, table.dimension),
  uniqueItem: uniqueIndex('gamvot_items_unique').on(table.entityId, table.dimension, table.text),
}))

// A user's game session
export const sessions = pgTable('gamvot_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id),
  anonymousId: text('anonymous_id'),
  status: text('status', {
    enum: ['in_progress', 'completed'],
  }).notNull().default('in_progress'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => ({
  entityIdx: index('gamvot_sessions_entity').on(table.entityId),
  statusIdx: index('gamvot_sessions_status').on(table.status),
  userOrAnon: check('user_or_anon', sql`${table.userId} IS NOT NULL OR ${table.anonymousId} IS NOT NULL`),
}))

// Individual votes within a session
export const votes = pgTable('gamvot_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  itemIdx: index('gamvot_votes_item').on(table.itemId),
  uniqueVote: uniqueIndex('gamvot_votes_unique').on(table.sessionId, table.itemId),
  amountRange: check('amount_range', sql`${table.amount} >= 5 AND ${table.amount} <= 100`),
}))
