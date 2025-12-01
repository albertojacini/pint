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

// Provision extra data schemas (type-discriminated)
const OwnershipExtraDataSchema = z.object({
  type: z.literal('ownership'),
  assetType: z.enum(['company', 'property', 'infrastructure']).optional(),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  valuationAmount: z.number().optional(),
  valuationCurrency: z.string().optional(),
})

const ContractExtraDataSchema = z.object({
  type: z.literal('contract'),
  contractType: z.enum(['service', 'concession', 'partnership']).optional(),
  contractorName: z.string().optional(),
  contractValue: z.number().optional(),
  contractCurrency: z.string().optional(),
})

const RegulationExtraDataSchema = z.object({
  type: z.literal('regulation'),
  regulationType: z.enum(['rule', 'ordinance', 'code', 'standard']).optional(),
  enforcementLevel: z.enum(['mandatory', 'advisory']).optional(),
  penaltyAmount: z.number().optional(),
})

const TaxationExtraDataSchema = z.object({
  type: z.literal('taxation'),
  taxType: z.enum(['tax', 'fee', 'tariff']).optional(),
  rate: z.number().optional(),
  rateType: z.enum(['percentage', 'fixed']).optional(),
  revenueAmount: z.number().optional(),
})

const AllocationExtraDataSchema = z.object({
  type: z.literal('allocation'),
  allocationType: z.enum(['program', 'subsidy', 'budget', 'fund']).optional(),
  budgetAmount: z.number().optional(),
  currency: z.string().optional(),
  beneficiaryCount: z.number().optional(),
})

const DesignationExtraDataSchema = z.object({
  type: z.literal('designation'),
  designationType: z.enum(['zone', 'landmark', 'protected_area', 'institution']).optional(),
  areaSize: z.number().optional(),
  areaSizeUnit: z.string().optional(),
  protectionLevel: z.enum(['high', 'medium', 'low']).optional(),
})

export const ProvisionExtraDataSchema = z.discriminatedUnion('type', [
  OwnershipExtraDataSchema,
  ContractExtraDataSchema,
  RegulationExtraDataSchema,
  TaxationExtraDataSchema,
  AllocationExtraDataSchema,
  DesignationExtraDataSchema,
])

export type ProvisionExtraData = z.infer<typeof ProvisionExtraDataSchema>
export type OwnershipExtraData = z.infer<typeof OwnershipExtraDataSchema>
export type ContractExtraData = z.infer<typeof ContractExtraDataSchema>
export type RegulationExtraData = z.infer<typeof RegulationExtraDataSchema>
export type TaxationExtraData = z.infer<typeof TaxationExtraDataSchema>
export type AllocationExtraData = z.infer<typeof AllocationExtraDataSchema>
export type DesignationExtraData = z.infer<typeof DesignationExtraDataSchema>

// Provision schemas
export const ProvisionSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation']),
  status: z.enum(['active', 'repealed', 'suspended']).default('active'),
  effectiveFrom: z.string().optional(), // YYYY-MM-DD
  effectiveUntil: z.string().optional(), // YYYY-MM-DD
  ideaId: z.string().uuid().optional(),
  extraData: ProvisionExtraDataSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateProvisionSchema = ProvisionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateProvisionSchema = ProvisionSchema.partial().required({ id: true })

export type Provision = z.infer<typeof ProvisionSchema>
export type CreateProvision = z.infer<typeof CreateProvisionSchema>
export type UpdateProvision = z.infer<typeof UpdateProvisionSchema>

// API response types
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
