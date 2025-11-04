import { z } from 'zod'

// Post schemas
export const PostSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePostSchema = PostSchema.omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePostSchema = PostSchema.partial().required({ id: true })

export const PostEditSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

// User profile schemas
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type exports
export type Post = z.infer<typeof PostSchema>
export type CreatePost = z.infer<typeof CreatePostSchema>
export type UpdatePost = z.infer<typeof UpdatePostSchema>
export type PostEdit = z.infer<typeof PostEditSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>

// API response types
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
