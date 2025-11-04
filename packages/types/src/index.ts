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

// Political entity schemas
export const PoliticalEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  nativeName: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  type: z.enum(['neighborhood', 'district', 'borough', 'city', 'region', 'country', 'supranational']),
  population: z.number().int().positive().optional(),
  scoreInnovation: z.number().int().min(0).max(10).optional(),
  scoreSustainability: z.number().int().min(0).max(10).optional(),
  scoreImpact: z.number().int().min(0).max(10).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePoliticalEntitySchema = PoliticalEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePoliticalEntitySchema = PoliticalEntitySchema.partial().required({ id: true })

// Type exports
export type Post = z.infer<typeof PostSchema>
export type CreatePost = z.infer<typeof CreatePostSchema>
export type UpdatePost = z.infer<typeof UpdatePostSchema>
export type PostEdit = z.infer<typeof PostEditSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type PoliticalEntity = z.infer<typeof PoliticalEntitySchema>
export type CreatePoliticalEntity = z.infer<typeof CreatePoliticalEntitySchema>
export type UpdatePoliticalEntity = z.infer<typeof UpdatePoliticalEntitySchema>

// API response types
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
