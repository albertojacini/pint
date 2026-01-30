'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { provisionDrafts, provisions, entities, provisionTypes, provisionTypeAssocs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import type { ApiResponse } from '@pint/types'

// Provision types
export type ProvisionType = 'ownership' | 'contract' | 'regulation' | 'taxation' | 'allocation' | 'designation' | 'infrastructure'
export type JobStatus = 'input' | 'prompt_generated' | 'researching' | 'research_complete' | 'generating_draft' | 'review' | 'completed' | 'failed'

export interface ProvisionDraft {
  id: string
  entityId: string
  entityName?: string
  entityLanguage?: string  // BCP 47 language tag (e.g., 'it-IT', 'en-US')
  createdBy: string | null
  inputDescription: string
  researchPrompt: string | null
  researchTaskId: string | null
  researchSummary: string | null
  jobStatus: JobStatus
  errorMessage: string | null
  title: string | null
  tagline: string | null
  description: string | null
  analysis: string | null
  provisionTypeCodes: string[] | null
  highlights: { items: Array<{ label: string; value: string }> } | null
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
      jobStatus: 'input',
    })
    .returning({ id: provisionDrafts.id })

  revalidatePath('/admin/provision-ingestion')
  return { ok: true, data: { id: draft.id } }
}

export async function updateDraft(
  id: string,
  data: Partial<{
    researchPrompt: string
    researchTaskId: string
    researchSummary: string
    jobStatus: JobStatus
    errorMessage: string
    title: string
    tagline: string
    description: string
    analysis: string
    provisionTypeCodes: string[]
    highlights: { items: Array<{ label: string; value: string }> }
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

  if (draft.jobStatus !== 'review' && draft.jobStatus !== 'completed') {
    return { ok: false, error: 'Draft is not ready for production' }
  }

  if (!draft.title || !draft.provisionTypeCodes || draft.provisionTypeCodes.length === 0) {
    return { ok: false, error: 'Draft is missing required fields (title or provision types)' }
  }

  const slug = generateSlug(draft.title)

  const [provision] = await db
    .insert(provisions)
    .values({
      entityId: draft.entityId,
      title: draft.title,
      slug,
      tagline: draft.tagline,
      description: draft.description,
      analysis: draft.analysis,
      status: 'active',
      relevance: draft.relevance,
      highlights: draft.highlights || { items: [] },
    })
    .returning({ id: provisions.id })

  // Create type associations from provisionTypeCodes
  for (const typeCode of draft.provisionTypeCodes) {
    const [typeResult] = await db
      .select({ id: provisionTypes.id })
      .from(provisionTypes)
      .where(eq(provisionTypes.code, typeCode))

    if (typeResult) {
      await db.insert(provisionTypeAssocs).values({
        provisionId: provision.id,
        typeId: typeResult.id,
      })
    }
  }

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
      entityName: entities.name,
      entityLanguage: entities.language,
      createdBy: provisionDrafts.createdBy,
      inputDescription: provisionDrafts.inputDescription,
      researchPrompt: provisionDrafts.researchPrompt,
      researchTaskId: provisionDrafts.researchTaskId,
      researchSummary: provisionDrafts.researchSummary,
      jobStatus: provisionDrafts.jobStatus,
      errorMessage: provisionDrafts.errorMessage,
      title: provisionDrafts.title,
      tagline: provisionDrafts.tagline,
      description: provisionDrafts.description,
      analysis: provisionDrafts.analysis,
      provisionTypeCodes: provisionDrafts.provisionTypeCodes,
      highlights: provisionDrafts.highlights,
      confidence: provisionDrafts.confidence,
      relevance: provisionDrafts.relevance,
      sourceUrls: provisionDrafts.sourceUrls,
      createdAt: provisionDrafts.createdAt,
      updatedAt: provisionDrafts.updatedAt,
    })
    .from(provisionDrafts)
    .leftJoin(entities, eq(provisionDrafts.entityId, entities.id))
    .orderBy(desc(provisionDrafts.createdAt))

  return drafts as ProvisionDraft[]
}

export async function getDraft(id: string): Promise<ProvisionDraft | null> {
  await requireUser()

  const [draft] = await db
    .select({
      id: provisionDrafts.id,
      entityId: provisionDrafts.entityId,
      entityName: entities.name,
      entityLanguage: entities.language,
      createdBy: provisionDrafts.createdBy,
      inputDescription: provisionDrafts.inputDescription,
      researchPrompt: provisionDrafts.researchPrompt,
      researchTaskId: provisionDrafts.researchTaskId,
      researchSummary: provisionDrafts.researchSummary,
      jobStatus: provisionDrafts.jobStatus,
      errorMessage: provisionDrafts.errorMessage,
      title: provisionDrafts.title,
      tagline: provisionDrafts.tagline,
      description: provisionDrafts.description,
      analysis: provisionDrafts.analysis,
      provisionTypeCodes: provisionDrafts.provisionTypeCodes,
      highlights: provisionDrafts.highlights,
      confidence: provisionDrafts.confidence,
      relevance: provisionDrafts.relevance,
      sourceUrls: provisionDrafts.sourceUrls,
      createdAt: provisionDrafts.createdAt,
      updatedAt: provisionDrafts.updatedAt,
    })
    .from(provisionDrafts)
    .leftJoin(entities, eq(provisionDrafts.entityId, entities.id))
    .where(eq(provisionDrafts.id, id))

  return draft as ProvisionDraft | null
}

export async function getEntities() {
  await requireUser()

  return db
    .select({
      id: entities.id,
      name: entities.name,
      type: entities.type,
      language: entities.language,
    })
    .from(entities)
    .orderBy(entities.name)
}
