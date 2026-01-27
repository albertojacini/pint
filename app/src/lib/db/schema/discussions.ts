import { pgTable, text, uuid, timestamp, integer, boolean, uniqueIndex, index, type AnyPgColumn } from 'drizzle-orm/pg-core'
import { profiles } from './accounts'

// ============================================================================
// DISCUSSIONS SUBSYSTEM (disc_)
// Reddit/Loomio-inspired discussion system. Posts attach to any target type
// (provision, entity, idea) via polymorphic targetType + targetId.
// ============================================================================

export const posts = pgTable('disc_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetType: text('target_type', {
    enum: ['provision', 'entity', 'idea'],
  }).notNull(),
  targetId: uuid('target_id').notNull(), // polymorphic, no FK
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body'),
  postType: text('post_type', {
    enum: ['discussion', 'question', 'proposal', 'analysis'],
  }).notNull(),
  score: integer('score').notNull().default(0), // cached upvote count
  commentCount: integer('comment_count').notNull().default(0), // cached comment count
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  targetIdx: index('disc_posts_target_idx').on(table.targetType, table.targetId),
}))

export const comments = pgTable('disc_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  score: integer('score').notNull().default(0), // cached upvote count
  depth: integer('depth').notNull().default(0), // nesting level, 0 = top-level
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  postIdx: index('disc_comments_post_idx').on(table.postId),
}))

export const votes = pgTable('disc_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  targetType: text('target_type', {
    enum: ['post', 'comment'],
  }).notNull(),
  targetId: uuid('target_id').notNull(), // polymorphic: post or comment id
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueVote: uniqueIndex('disc_votes_unique').on(table.userId, table.targetType, table.targetId),
}))

export const proposalVotes = pgTable('disc_proposal_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  position: text('position', {
    enum: ['agree', 'disagree', 'abstain'],
  }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProposalVote: uniqueIndex('disc_proposal_votes_unique').on(table.userId, table.postId),
}))
