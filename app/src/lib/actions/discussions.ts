'use server'

import { db } from '@/lib/db/client'
import { discPosts, discComments, discVotes, discProposalVotes, profiles } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// Types

export type PostSummary = {
  id: string
  title: string
  body: string | null
  postType: string
  score: number
  commentCount: number
  isPinned: boolean
  createdAt: Date
  authorName: string | null
  authorId: string
}

export type PostDetail = PostSummary & {
  comments: CommentNode[]
  proposalCounts: { agree: number; disagree: number; abstain: number } | null
}

export type CommentNode = {
  id: string
  body: string
  score: number
  depth: number
  createdAt: Date
  authorName: string | null
  authorId: string
  children: CommentNode[]
}

// Posts

export async function createPost(
  targetType: 'provision' | 'entity' | 'idea',
  targetId: string,
  authorId: string,
  title: string,
  body: string | null,
  postType: 'discussion' | 'question' | 'proposal' | 'analysis',
) {
  const [post] = await db
    .insert(discPosts)
    .values({ targetType, targetId, authorId, title, body, postType })
    .returning({ id: discPosts.id })
  return post
}

export async function getPosts(
  targetType: 'provision' | 'entity' | 'idea',
  targetId: string,
  sort: 'score' | 'recent' | 'active' = 'recent',
  filterType?: 'discussion' | 'question' | 'proposal' | 'analysis',
): Promise<PostSummary[]> {
  const conditions = [
    eq(discPosts.targetType, targetType),
    eq(discPosts.targetId, targetId),
  ]
  if (filterType) {
    conditions.push(eq(discPosts.postType, filterType))
  }

  let orderBy
  switch (sort) {
    case 'score':
      orderBy = [desc(discPosts.isPinned), desc(discPosts.score), desc(discPosts.createdAt)]
      break
    case 'active':
      orderBy = [desc(discPosts.isPinned), desc(discPosts.updatedAt)]
      break
    default: // recent
      orderBy = [desc(discPosts.isPinned), desc(discPosts.createdAt)]
  }

  const rows = await db
    .select({
      id: discPosts.id,
      title: discPosts.title,
      body: discPosts.body,
      postType: discPosts.postType,
      score: discPosts.score,
      commentCount: discPosts.commentCount,
      isPinned: discPosts.isPinned,
      createdAt: discPosts.createdAt,
      authorName: profiles.fullName,
      authorId: discPosts.authorId,
    })
    .from(discPosts)
    .leftJoin(profiles, eq(discPosts.authorId, profiles.id))
    .where(and(...conditions))
    .orderBy(...orderBy)

  return rows
}

export async function getPostWithComments(postId: string): Promise<PostDetail | null> {
  const [post] = await db
    .select({
      id: discPosts.id,
      title: discPosts.title,
      body: discPosts.body,
      postType: discPosts.postType,
      score: discPosts.score,
      commentCount: discPosts.commentCount,
      isPinned: discPosts.isPinned,
      createdAt: discPosts.createdAt,
      authorName: profiles.fullName,
      authorId: discPosts.authorId,
    })
    .from(discPosts)
    .leftJoin(profiles, eq(discPosts.authorId, profiles.id))
    .where(eq(discPosts.id, postId))

  if (!post) return null

  // Fetch all comments for this post
  const allComments = await db
    .select({
      id: discComments.id,
      body: discComments.body,
      score: discComments.score,
      depth: discComments.depth,
      parentId: discComments.parentId,
      createdAt: discComments.createdAt,
      authorName: profiles.fullName,
      authorId: discComments.authorId,
    })
    .from(discComments)
    .leftJoin(profiles, eq(discComments.authorId, profiles.id))
    .where(eq(discComments.postId, postId))
    .orderBy(desc(discComments.score), discComments.createdAt)

  // Build comment tree
  const commentMap = new Map<string, CommentNode>()
  const roots: CommentNode[] = []

  for (const c of allComments) {
    commentMap.set(c.id, {
      id: c.id,
      body: c.body,
      score: c.score,
      depth: c.depth,
      createdAt: c.createdAt,
      authorName: c.authorName,
      authorId: c.authorId,
      children: [],
    })
  }

  for (const c of allComments) {
    const node = commentMap.get(c.id)!
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // Fetch proposal counts if this is a proposal post
  let proposalCounts: { agree: number; disagree: number; abstain: number } | null = null
  if (post.postType === 'proposal') {
    const counts = await db
      .select({
        position: discProposalVotes.position,
        count: sql<number>`count(*)::int`,
      })
      .from(discProposalVotes)
      .where(eq(discProposalVotes.postId, postId))
      .groupBy(discProposalVotes.position)

    proposalCounts = { agree: 0, disagree: 0, abstain: 0 }
    for (const row of counts) {
      if (row.position === 'agree' || row.position === 'disagree' || row.position === 'abstain') {
        proposalCounts[row.position] = row.count
      }
    }
  }

  return { ...post, comments: roots, proposalCounts }
}

// Comments

export async function createComment(
  postId: string,
  authorId: string,
  body: string,
  parentId?: string,
) {
  // Determine depth
  let depth = 0
  if (parentId) {
    const [parent] = await db
      .select({ depth: discComments.depth })
      .from(discComments)
      .where(eq(discComments.id, parentId))
    if (parent) depth = Math.min(parent.depth + 1, 5) // max depth 5
  }

  const [comment] = await db
    .insert(discComments)
    .values({ postId, parentId: parentId ?? null, authorId, body, depth })
    .returning({ id: discComments.id })

  // Increment comment count on the post
  await db
    .update(discPosts)
    .set({ commentCount: sql`${discPosts.commentCount} + 1` })
    .where(eq(discPosts.id, postId))

  return comment
}

// Votes (upvote toggle)

export async function toggleVote(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
) {
  // Check existing vote
  const [existing] = await db
    .select({ id: discVotes.id })
    .from(discVotes)
    .where(
      and(
        eq(discVotes.userId, userId),
        eq(discVotes.targetType, targetType),
        eq(discVotes.targetId, targetId),
      )
    )

  if (existing) {
    // Remove vote
    await db.delete(discVotes).where(eq(discVotes.id, existing.id))
    // Decrement score
    if (targetType === 'post') {
      await db
        .update(discPosts)
        .set({ score: sql`${discPosts.score} - 1` })
        .where(eq(discPosts.id, targetId))
    } else {
      await db
        .update(discComments)
        .set({ score: sql`${discComments.score} - 1` })
        .where(eq(discComments.id, targetId))
    }
    return { voted: false }
  } else {
    // Add vote
    await db.insert(discVotes).values({ userId, targetType, targetId })
    // Increment score
    if (targetType === 'post') {
      await db
        .update(discPosts)
        .set({ score: sql`${discPosts.score} + 1` })
        .where(eq(discPosts.id, targetId))
    } else {
      await db
        .update(discComments)
        .set({ score: sql`${discComments.score} + 1` })
        .where(eq(discComments.id, targetId))
    }
    return { voted: true }
  }
}

// Proposal positions

export async function setProposalPosition(
  postId: string,
  userId: string,
  position: 'agree' | 'disagree' | 'abstain',
) {
  // Upsert: insert or update position
  const [existing] = await db
    .select({ id: discProposalVotes.id })
    .from(discProposalVotes)
    .where(
      and(
        eq(discProposalVotes.postId, postId),
        eq(discProposalVotes.userId, userId),
      )
    )

  if (existing) {
    await db
      .update(discProposalVotes)
      .set({ position })
      .where(eq(discProposalVotes.id, existing.id))
  } else {
    await db
      .insert(discProposalVotes)
      .values({ postId, userId, position })
  }

  return { position }
}
