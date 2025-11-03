'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { posts, postRevisions, auditLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { PostEditSchema, CreatePostSchema } from '@pint/types'
import type { ApiResponse } from '@pint/types'

export async function createPost(
  input: unknown
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireUser()
    const data = CreatePostSchema.parse(input)

    const [post] = await db
      .insert(posts)
      .values({
        authorId: user.id,
        title: data.title,
        content: data.content,
        status: data.status || 'draft',
      })
      .returning({ id: posts.id })

    // Log to audit log
    await db.insert(auditLog).values({
      actorId: user.id,
      action: 'post.created',
      subjectType: 'post',
      subjectId: post.id,
    })

    revalidatePath('/posts')
    return { ok: true, data: { id: post.id } }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create post',
    }
  }
}

export async function updatePost(input: unknown): Promise<ApiResponse> {
  try {
    const user = await requireUser()
    const data = PostEditSchema.parse(input)

    // Get the current post to create a revision
    const [currentPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, data.id))

    if (!currentPost) {
      return { ok: false, error: 'Post not found' }
    }

    // RLS will handle authorization, but we check here too for better UX
    if (currentPost.authorId !== user.id) {
      return { ok: false, error: 'Unauthorized' }
    }

    // Create revision before updating
    await db.insert(postRevisions).values({
      postId: data.id,
      editorId: user.id,
      title: currentPost.title,
      content: currentPost.content,
    })

    // Update the post
    await db
      .update(posts)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.id))

    // Log to audit log
    await db.insert(auditLog).values({
      actorId: user.id,
      action: 'post.updated',
      subjectType: 'post',
      subjectId: data.id,
    })

    revalidatePath('/posts')
    revalidatePath(`/posts/${data.id}`)
    return { ok: true }
  } catch (error) {
    console.error('Error updating post:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update post',
    }
  }
}

export async function deletePost(postId: string): Promise<ApiResponse> {
  try {
    const user = await requireUser()

    // Get the post first
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))

    if (!post) {
      return { ok: false, error: 'Post not found' }
    }

    // Check authorization
    if (post.authorId !== user.id) {
      return { ok: false, error: 'Unauthorized' }
    }

    // Log before deleting
    await db.insert(auditLog).values({
      actorId: user.id,
      action: 'post.deleted',
      subjectType: 'post',
      subjectId: postId,
    })

    // Delete (cascade will handle revisions)
    await db.delete(posts).where(eq(posts.id, postId))

    revalidatePath('/posts')
    return { ok: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to delete post',
    }
  }
}

export async function publishPost(postId: string): Promise<ApiResponse> {
  try {
    const user = await requireUser()

    // Get the post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))

    if (!post) {
      return { ok: false, error: 'Post not found' }
    }

    // Check authorization
    if (post.authorId !== user.id) {
      return { ok: false, error: 'Unauthorized' }
    }

    // Update status
    await db
      .update(posts)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(posts.id, postId))

    // Log
    await db.insert(auditLog).values({
      actorId: user.id,
      action: 'post.published',
      subjectType: 'post',
      subjectId: postId,
    })

    revalidatePath('/posts')
    revalidatePath(`/posts/${postId}`)
    return { ok: true }
  } catch (error) {
    console.error('Error publishing post:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to publish post',
    }
  }
}
