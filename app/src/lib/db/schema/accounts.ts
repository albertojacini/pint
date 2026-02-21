import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'

// ============================================================================
// ACCOUNTS SUBSYSTEM (acc_)
// ============================================================================

export const profiles = pgTable('acc_profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const accessRequests = pgTable('acc_access_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  message: text('message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
