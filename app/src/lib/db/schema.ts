import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// User profiles table (extends Supabase auth.users)
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Post revisions table
export const postRevisions = pgTable('post_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull(),
  editorId: uuid('editor_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Audit log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id'),
  action: varchar('action', { length: 100 }).notNull(),
  subjectType: varchar('subject_type', { length: 50 }).notNull(),
  subjectId: uuid('subject_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(userProfiles, {
    fields: [posts.authorId],
    references: [userProfiles.id],
  }),
  revisions: many(postRevisions),
}))

export const postRevisionsRelations = relations(postRevisions, ({ one }) => ({
  post: one(posts, {
    fields: [postRevisions.postId],
    references: [posts.id],
  }),
  editor: one(userProfiles, {
    fields: [postRevisions.editorId],
    references: [userProfiles.id],
  }),
}))

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  posts: many(posts),
  postRevisions: many(postRevisions),
}))
