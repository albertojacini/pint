import { pgTable, text, uuid, timestamp, date } from 'drizzle-orm/pg-core'

// ============================================================================
// EVENTS SUBSYSTEM (eve_)
// ============================================================================

export const events = pgTable('eve_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  descriptionShort: text('description_short'),
  description: text('description'),
  type: text('type').notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
