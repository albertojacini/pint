import { z } from 'zod'

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
  type: z.enum([
    'neighborhood',
    'district',
    'borough',
    'city',
    'region',
    'country',
    'supranational',
  ]),
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
export type UserProfile = z.infer<typeof UserProfileSchema>
export type PoliticalEntity = z.infer<typeof PoliticalEntitySchema>
export type CreatePoliticalEntity = z.infer<typeof CreatePoliticalEntitySchema>
export type UpdatePoliticalEntity = z.infer<typeof UpdatePoliticalEntitySchema>

// Provision extra data schemas (type-discriminated)
const OwnershipDataSchema = z.object({
  type: z.literal('ownership'),

  // Asset classification
  assetCategory: z
    .enum(['equity', 'real_estate', 'intellectual_property', 'infrastructure', 'other'])
    .optional(),
  assetName: z.string().optional(),

  // Ownership details
  ownershipPercentage: z.number().min(0).max(100).optional(),
  purpose: z
    .enum([
      'public_service',
      'strategic_infrastructure',
      'economic_development',
      'revenue_generation',
    ])
    .optional(),

  // Acquisition (what they paid)
  investmentAmount: z.number().optional(),
  investmentCurrency: z.string().optional(),
  acquisitionDate: z.string().optional(), // YYYY-MM-DD

  // Current value (what it's worth)
  valuationAmount: z.number().optional(),
  valuationCurrency: z.string().optional(),
  valuationDate: z.string().optional(), // YYYY-MM-DD

  // Annual financial impact (cash flow)
  annualCashFlow: z.number().optional(), // Positive = revenue, Negative = cost/subsidy
  annualCashFlowCurrency: z.string().optional(),
  annualCashFlowYear: z.string().optional(), // Fiscal year (YYYY)
})

const ContractDataSchema = z.object({
  type: z.literal('contract'),
  contractType: z.enum(['service', 'concession', 'partnership']).optional(),
})

const RegulationDataSchema = z.object({
  type: z.literal('regulation'),

  // Sub-type of regulation
  regulationType: z
    .enum(['ordinance', 'code', 'standard', 'permit_system', 'restriction', 'requirement', 'other'])
    .optional(),

  // Domain/sector the regulation applies to
  domain: z
    .enum([
      'housing',
      'land_use',
      'environment',
      'commerce',
      'transport',
      'public_space',
      'health_safety',
      'labor',
      'other',
    ])
    .optional(),

  // Complexity for affected parties (0 = trivial, 10 = extremely complex)
  complexity: z.number().min(0).max(10).optional(),

  // AI-generated summary
  summary_md: z.string().optional(),
})

const TaxationDataSchema = z.object({
  type: z.literal('taxation'),

  // Categorization
  taxType: z.enum(['tax', 'fee', 'tariff']).optional(),

  // Rate information (human-readable)
  rateDescription: z.string().optional(),

  // Annual financial data
  taxRevenueFiscalYear: z.string().optional(), // YYYY
  taxRevenueAmount: z.number().optional(),

  // Collection costs
  collectionCostAmount: z.number().optional(),
  collectionCostYear: z.string().optional(), // YYYY

  // Growth & trends
  revenueGrowth: z.number().optional(), // YoY % change
  revenueGrowthPreviousYear: z.string().optional(), // YYYY

  // Fiscal importance
  taxRevenueShare: z.number().min(0).max(100).optional(),

  // Tax design
  progressivity: z.enum(['regressive', 'proportional', 'progressive', 'mixed']).optional(),
})

const AllocationDataSchema = z.object({
  type: z.literal('allocation'),
})

const DesignationDataSchema = z.object({
  type: z.literal('designation'),
})

export const ProvisionExtraDataSchema = z.discriminatedUnion('type', [
  OwnershipDataSchema,
  ContractDataSchema,
  RegulationDataSchema,
  TaxationDataSchema,
  AllocationDataSchema,
  DesignationDataSchema,
])

export type OwnershipData = z.infer<typeof OwnershipDataSchema>
export type ContractData = z.infer<typeof ContractDataSchema>
export type RegulationData = z.infer<typeof RegulationDataSchema>
export type TaxationData = z.infer<typeof TaxationDataSchema>
export type AllocationData = z.infer<typeof AllocationDataSchema>
export type DesignationData = z.infer<typeof DesignationDataSchema>

// Provision schemas
export const ProvisionSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  title: z.string().min(1),
  descriptionShort: z.string().max(100, 'Short description must be at most 100 characters').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  summary_md: z.string().max(20000, 'Summary must be at most 20000 characters').optional(),
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

// ============================================================================
// EFFECTS DIAGRAM - Stakeholder Impact Visualization
// ============================================================================

// Effect sentiment (positive/negative)
const EffectSentimentEnum = z.enum(['positive', 'negative'])
export type EffectSentiment = z.infer<typeof EffectSentimentEnum>

// Individual effect on a stakeholder
const StakeholderEffectSchema = z.object({
  title: z.string().min(1, 'Effect title is required'),
  description: z.string().optional(),
  sentiment: EffectSentimentEnum,
  severity: z.number().int().min(1).max(5), // 1=minimal, 5=major impact
})

export type StakeholderEffect = z.infer<typeof StakeholderEffectSchema>

// Stakeholder group with their effects (references stakeholder_groups table)
const StakeholderGroupEffectsSchema = z.object({
  stakeholderGroupId: z.string().uuid(), // References public.stakeholder_groups.id
  subtitle: z.string().optional(),       // Contextual info like "≈40,000 daily users"
  effects: z.array(StakeholderEffectSchema).min(1, 'At least one effect is required'),
})

export type StakeholderGroupEffects = z.infer<typeof StakeholderGroupEffectsSchema>

// Complete effects diagram
export const EffectsDiagramSchema = z.object({
  stakeholderGroups: z.array(StakeholderGroupEffectsSchema).min(1, 'At least one stakeholder group is required'),
})

export type EffectsDiagram = z.infer<typeof EffectsDiagramSchema>

// Stakeholder Group schema (for the database table)
export const StakeholderGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type StakeholderGroup = z.infer<typeof StakeholderGroupSchema>

// Idea schema (complete schema including effectsDiagram)
export const IdeaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  effectsDiagram: EffectsDiagramSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Idea = z.infer<typeof IdeaSchema>

// API response types
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
