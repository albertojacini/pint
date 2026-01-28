/**
 * Discussions Domain Seeder
 * Seeds discussion posts, comments, votes, and proposal votes
 * Dependencies: provisions (for target IDs), auth-domain (for author profiles)
 */

import { loadData } from '../utils/data-loader.mjs'
import { logger } from '../utils/logger.mjs'
import { generateUUID } from '../utils/uuid.mjs'
import { hasData, insertQuery } from '../utils/db-helpers.mjs'

/**
 * Seed discussions domain
 * @param {import('pg').Client} client - PostgreSQL client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client for creating auth users
 * @param {object} idMaps - ID mapping object for foreign key references
 */
export async function seedDiscussions(client, supabase, idMaps) {
  const {
    discussionProfiles,
    discussionPosts,
    discussionComments,
    discussionPostVotes,
    discussionProposalVotes,
  } = await loadData('discussions-data.mjs')

  // ===== DISCUSSION PROFILES =====
  // Profiles are created via Supabase Auth (handle_new_user trigger auto-creates acc_profiles)
  logger.startSection('discussion profiles')

  let profileCount = 0

  for (const profile of discussionProfiles) {
    // Check if profile already exists
    const existing = await client.query(
      'SELECT id FROM acc_profiles WHERE email = $1',
      [profile.email]
    )

    if (existing.rows.length > 0) {
      idMaps.discProfiles.set(profile.key, existing.rows[0].id)
      profileCount++
      continue
    }

    if (!supabase) {
      logger.warning(`Skipping profile "${profile.key}" - Supabase client not available`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: profile.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: profile.fullName },
    })

    if (error) {
      logger.warning(`Failed to create user "${profile.key}": ${error.message}`)
      continue
    }

    if (data?.user) {
      idMaps.discProfiles.set(profile.key, data.user.id)
      profileCount++
    }
  }

  logger.endSection('discussion profiles', profileCount)

  // ===== DISCUSSION POSTS =====
  logger.startSection('discussion posts')

  let postCount = 0
  let postSkipped = 0
  const postIds = [] // indexed by data array position

  if (await hasData(client, 'disc_posts')) {
    logger.skipSection('Discussion Posts')
  } else {
    for (let i = 0; i < discussionPosts.length; i++) {
      const post = discussionPosts[i]

      // Resolve provision ID
      const provisionId = idMaps.provisions.get(post.provision)
      if (!provisionId) {
        logger.warning(`Skipping post "${post.title}" - provision not found: ${post.provision}`)
        postIds.push(null)
        postSkipped++
        continue
      }

      // Resolve author ID
      const authorId = idMaps.discProfiles.get(post.author)
      if (!authorId) {
        logger.warning(`Skipping post "${post.title}" - author not found: ${post.author}`)
        postIds.push(null)
        postSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'disc_posts',
        columns: ['id', 'target_type', 'target_id', 'author_id', 'title', 'body', 'post_type', 'is_pinned'],
        values: [
          id,
          'provision',
          provisionId,
          authorId,
          post.title,
          post.body || null,
          post.postType,
          post.isPinned || false,
        ],
      })

      postIds.push(id)
      postCount++
    }

    if (postSkipped > 0) {
      logger.warning(`Skipped ${postSkipped} posts due to missing dependencies`)
    }

    logger.endSection('discussion posts', postCount)
  }

  // If posts were skipped (already existed), load existing post IDs
  if (postIds.length === 0 || postIds.every(id => id === null)) {
    // Posts already existed, query them by title to get IDs
    for (let i = 0; i < discussionPosts.length; i++) {
      const post = discussionPosts[i]
      const result = await client.query(
        'SELECT id FROM disc_posts WHERE title = $1',
        [post.title]
      )
      postIds[i] = result.rows.length > 0 ? result.rows[0].id : null
    }
  }

  // ===== DISCUSSION COMMENTS =====
  logger.startSection('discussion comments')

  let commentCount = 0
  let commentSkipped = 0
  const commentIds = [] // indexed by data array position

  if (await hasData(client, 'disc_comments')) {
    logger.skipSection('Discussion Comments')
  } else {
    for (let i = 0; i < discussionComments.length; i++) {
      const comment = discussionComments[i]

      const postId = postIds[comment.postIndex]
      if (!postId) {
        logger.warning(`Skipping comment - post at index ${comment.postIndex} not found`)
        commentIds.push(null)
        commentSkipped++
        continue
      }

      const authorId = idMaps.discProfiles.get(comment.author)
      if (!authorId) {
        logger.warning(`Skipping comment - author not found: ${comment.author}`)
        commentIds.push(null)
        commentSkipped++
        continue
      }

      // Resolve parent comment ID for threaded replies
      let parentId = null
      if (comment.parentCommentIndex !== undefined) {
        parentId = commentIds[comment.parentCommentIndex] || null
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'disc_comments',
        columns: ['id', 'post_id', 'parent_id', 'author_id', 'body', 'depth'],
        values: [id, postId, parentId, authorId, comment.body, comment.depth],
      })

      commentIds.push(id)
      commentCount++
    }

    // Update comment_count on posts
    await client.query(`
      UPDATE disc_posts SET comment_count = (
        SELECT COUNT(*) FROM disc_comments WHERE disc_comments.post_id = disc_posts.id
      )
    `)

    if (commentSkipped > 0) {
      logger.warning(`Skipped ${commentSkipped} comments due to missing dependencies`)
    }

    logger.endSection('discussion comments', commentCount)
  }

  // ===== DISCUSSION VOTES (on posts) =====
  logger.startSection('discussion votes')

  let voteCount = 0
  let voteSkipped = 0

  if (await hasData(client, 'disc_votes')) {
    logger.skipSection('Discussion Votes')
  } else {
    for (const vote of discussionPostVotes) {
      const postId = postIds[vote.postIndex]
      const userId = idMaps.discProfiles.get(vote.voter)

      if (!postId || !userId) {
        voteSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'disc_votes',
        columns: ['id', 'user_id', 'target_type', 'target_id'],
        values: [id, userId, 'post', postId],
      })

      voteCount++
    }

    // Update score on posts
    await client.query(`
      UPDATE disc_posts SET score = (
        SELECT COUNT(*) FROM disc_votes
        WHERE disc_votes.target_type = 'post' AND disc_votes.target_id = disc_posts.id
      )
    `)

    if (voteSkipped > 0) {
      logger.warning(`Skipped ${voteSkipped} votes due to missing dependencies`)
    }

    logger.endSection('discussion votes', voteCount)
  }

  // ===== PROPOSAL VOTES =====
  logger.startSection('proposal votes')

  let proposalVoteCount = 0
  let proposalVoteSkipped = 0

  if (await hasData(client, 'disc_proposal_votes')) {
    logger.skipSection('Proposal Votes')
  } else {
    for (const vote of discussionProposalVotes) {
      const postId = postIds[vote.postIndex]
      const userId = idMaps.discProfiles.get(vote.voter)

      if (!postId || !userId) {
        proposalVoteSkipped++
        continue
      }

      const id = generateUUID()

      await insertQuery(client, {
        table: 'disc_proposal_votes',
        columns: ['id', 'post_id', 'user_id', 'position'],
        values: [id, postId, userId, vote.position],
      })

      proposalVoteCount++
    }

    if (proposalVoteSkipped > 0) {
      logger.warning(`Skipped ${proposalVoteSkipped} proposal votes due to missing dependencies`)
    }

    logger.endSection('proposal votes', proposalVoteCount)
  }

  return idMaps
}
