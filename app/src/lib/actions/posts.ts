'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { PostEditSchema, CreatePostSchema } from '@pint/types'
import type { ApiResponse } from '@pint/types'

export async function createPost(
  input: unknown
): Promise<ApiResponse<{ id: string }>> {
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

  revalidatePath('/posts')
  return { ok: true, data: { id: post.id } }
}

export async function updatePost(input: unknown): Promise<ApiResponse> {
  const user = await requireUser()
  const data = PostEditSchema.parse(input)

  const [currentPost] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, data.id))

  if (!currentPost) {
    return { ok: false, error: 'Post not found' }
  }

  if (currentPost.authorId !== user.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  await db
    .update(posts)
    .set({
      title: data.title,
      content: data.content,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, data.id))

  revalidatePath('/posts')
  revalidatePath(`/posts/${data.id}`)
  return { ok: true }
}

export async function deletePost(postId: string): Promise<ApiResponse> {
  const user = await requireUser()

  const [post] = await db.select().from(posts).where(eq(posts.id, postId))

  if (!post) {
    return { ok: false, error: 'Post not found' }
  }

  if (post.authorId !== user.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  await db.delete(posts).where(eq(posts.id, postId))

  revalidatePath('/posts')
  return { ok: true }
}

export async function publishPost(postId: string): Promise<ApiResponse> {
  const user = await requireUser()

  const [post] = await db.select().from(posts).where(eq(posts.id, postId))

  if (!post) {
    return { ok: false, error: 'Post not found' }
  }

  if (post.authorId !== user.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  await db
    .update(posts)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(posts.id, postId))

  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  return { ok: true }
}

export async function getPosts() {
  const user = await requireUser()
  return db.select().from(posts).where(eq(posts.authorId, user.id)).orderBy(desc(posts.createdAt))
}

export async function getPost(postId: string) {
  const user = await requireUser()
  const [post] = await db.select().from(posts).where(eq(posts.id, postId))

  if (!post) {
    return null
  }

  if (post.authorId !== user.id) {
    throw new Error('Unauthorized')
  }

  return post
}
