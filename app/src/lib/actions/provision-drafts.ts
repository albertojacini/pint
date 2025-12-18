'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { provisionDrafts, provisions, politicalEntities } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import type { ApiResponse } from '@pint/types'

// Provision types
export type ProvisionType = 'ownership' | 'contract' | 'regulation' | 'taxation' | 'allocation' | 'designation'
export type JobStatus = 'pending' | 'classifying' | 'classified' | 'researching' | 'completed' | 'failed'

export interface ProvisionDraft {
  id: string
  entityId: string
  entityName?: string
  createdBy: string | null
  inputDescription: string
  suggestedType: ProvisionType | null
  confirmedType: ProvisionType | null
  jobId: string | null
  jobStatus: JobStatus
  errorMessage: string | null
  title: string | null
  descriptionShort: string | null
  description: string | null
  summary: string | null
  extraData: Record<string, unknown> | null
  confidence: string | null
  relevance: number | null
  sourceUrls: string[] | null
  createdAt: Date
  updatedAt: Date
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function createDraft(input: {
  entityId: string
  description: string
}): Promise<ApiResponse<{ id: string }>> {
  const user = await requireUser()

  const [draft] = await db
    .insert(provisionDrafts)
    .values({
      entityId: input.entityId,
      createdBy: user.id,
      inputDescription: input.description,
      jobStatus: 'pending',
    })
    .returning({ id: provisionDrafts.id })

  revalidatePath('/admin/provision-ingestion')
  return { ok: true, data: { id: draft.id } }
}

export async function updateDraft(
  id: string,
  data: Partial<{
    suggestedType: ProvisionType
    confirmedType: ProvisionType
    jobId: string
    jobStatus: JobStatus
    errorMessage: string
    title: string
    descriptionShort: string
    description: string
    summary: string
    extraData: Record<string, unknown>
    confidence: string
    relevance: number
    sourceUrls: string[]
  }>
): Promise<ApiResponse> {
  await requireUser()

  await db
    .update(provisionDrafts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(provisionDrafts.id, id))

  revalidatePath('/admin/provision-ingestion')
  revalidatePath(`/admin/provision-ingestion/${id}`)
  return { ok: true }
}

export async function deleteDraft(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(provisionDrafts).where(eq(provisionDrafts.id, id))

  revalidatePath('/admin/provision-ingestion')
  return { ok: true }
}

export async function saveDraftToProduction(draftId: string): Promise<ApiResponse<{ id: string }>> {
  await requireUser()

  const [draft] = await db
    .select()
    .from(provisionDrafts)
    .where(eq(provisionDrafts.id, draftId))

  if (!draft) {
    return { ok: false, error: 'Draft not found' }
  }

  if (draft.jobStatus !== 'completed') {
    return { ok: false, error: 'Draft is not complete' }
  }

  if (!draft.title || !draft.confirmedType) {
    return { ok: false, error: 'Draft is missing required fields' }
  }

  const slug = generateSlug(draft.title)

  const [provision] = await db
    .insert(provisions)
    .values({
      entityId: draft.entityId,
      title: draft.title,
      slug,
      descriptionShort: draft.descriptionShort,
      description: draft.description,
      summary: draft.summary,
      type: draft.confirmedType,
      status: 'active',
      relevance: draft.relevance,
      extraData: draft.extraData || {},
    })
    .returning({ id: provisions.id })

  // Delete the draft
  await db.delete(provisionDrafts).where(eq(provisionDrafts.id, draftId))

  revalidatePath('/admin/provision-ingestion')
  revalidatePath('/pe')
  return { ok: true, data: { id: provision.id } }
}

export async function getDrafts(): Promise<ProvisionDraft[]> {
  await requireUser()

  const drafts = await db
    .select({
      id: provisionDrafts.id,
      entityId: provisionDrafts.entityId,
      entityName: politicalEntities.name,
      createdBy: provisionDrafts.createdBy,
      inputDescription: provisionDrafts.inputDescription,
      suggestedType: provisionDrafts.suggestedType,
      confirmedType: provisionDrafts.confirmedType,
      jobId: provisionDrafts.jobId,
      jobStatus: provisionDrafts.jobStatus,
      errorMessage: provisionDrafts.errorMessage,
      title: provisionDrafts.title,
      descriptionShort: provisionDrafts.descriptionShort,
      description: provisionDrafts.description,
      summary: provisionDrafts.summary,
      extraData: provisionDrafts.extraData,
      confidence: provisionDrafts.confidence,
      sourceUrls: provisionDrafts.sourceUrls,
      createdAt: provisionDrafts.createdAt,
      updatedAt: provisionDrafts.updatedAt,
    })
    .from(provisionDrafts)
    .leftJoin(politicalEntities, eq(provisionDrafts.entityId, politicalEntities.id))
    .orderBy(desc(provisionDrafts.createdAt))

  return drafts as ProvisionDraft[]
}

export async function getDraft(id: string): Promise<ProvisionDraft | null> {
  await requireUser()

  const [draft] = await db
    .select({
      id: provisionDrafts.id,
      entityId: provisionDrafts.entityId,
      entityName: politicalEntities.name,
      createdBy: provisionDrafts.createdBy,
      inputDescription: provisionDrafts.inputDescription,
      suggestedType: provisionDrafts.suggestedType,
      confirmedType: provisionDrafts.confirmedType,
      jobId: provisionDrafts.jobId,
      jobStatus: provisionDrafts.jobStatus,
      errorMessage: provisionDrafts.errorMessage,
      title: provisionDrafts.title,
      descriptionShort: provisionDrafts.descriptionShort,
      description: provisionDrafts.description,
      summary: provisionDrafts.summary,
      extraData: provisionDrafts.extraData,
      confidence: provisionDrafts.confidence,
      sourceUrls: provisionDrafts.sourceUrls,
      createdAt: provisionDrafts.createdAt,
      updatedAt: provisionDrafts.updatedAt,
    })
    .from(provisionDrafts)
    .leftJoin(politicalEntities, eq(provisionDrafts.entityId, politicalEntities.id))
    .where(eq(provisionDrafts.id, id))

  return draft as ProvisionDraft | null
}

export async function getEntities() {
  await requireUser()

  return db
    .select({
      id: politicalEntities.id,
      name: politicalEntities.name,
      type: politicalEntities.type,
    })
    .from(politicalEntities)
    .orderBy(politicalEntities.name)
}
