'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { eiSources, eiCandidates, eiCandidateSources, eiCandidateChanges, events, changes, provisions, politicalEntities, administrations } from '@/lib/db/schema'
import type { EiExtractedData, EiProposedData } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import type { ApiResponse } from '@pint/types'

// Types
export type SourceType = 'news' | 'official_gazette' | 'press_release' | 'council_minutes' | 'social' | 'manual'
export type FetchStatus = 'pending' | 'fetching' | 'fetched' | 'failed'
export type ProcessingStatus = 'unprocessed' | 'processing' | 'processed' | 'discarded'
export type CandidateStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'merged'
export type ChangeAction = 'create' | 'update' | 'delete'
export type ChangeStatus = 'pending' | 'approved' | 'rejected' | 'modified'

export interface EiSource {
  id: string
  url: string | null
  title: string | null
  sourceType: SourceType
  sourceName: string | null
  publishedAt: Date | null
  rawContent: string | null
  fetchStatus: FetchStatus
  fetchError: string | null
  fetchedAt: Date | null
  processingStatus: ProcessingStatus
  aiSummary: string | null
  aiExtractedData: EiExtractedData | null
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface EiCandidate {
  id: string
  title: string | null
  description: string | null
  eventType: string | null
  occurredAt: Date | null
  detectedEntityId: string | null
  detectedEntityName?: string | null
  detectedAdministrationId: string | null
  confidenceScore: string | null
  aiReasoning: string | null
  status: CandidateStatus
  mergedIntoId: string | null
  eventId: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
  sources?: EiSource[]
  changes?: EiCandidateChange[]
}

export interface EiCandidateChange {
  id: string
  candidateId: string
  targetType: 'provision' | 'entity' | 'administration'
  targetId: string | null
  targetTitle?: string | null
  action: ChangeAction
  proposedData: EiProposedData
  description: string | null
  effectiveAt: Date | null
  status: ChangeStatus
  changeId: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SOURCES
// ============================================================================

export async function createSource(input: {
  url?: string
  title?: string
  sourceType: SourceType
  sourceName?: string
  publishedAt?: Date
  rawContent?: string
}): Promise<ApiResponse<{ id: string }>> {
  const user = await requireUser()

  const [source] = await db
    .insert(eiSources)
    .values({
      url: input.url,
      title: input.title,
      sourceType: input.sourceType,
      sourceName: input.sourceName,
      publishedAt: input.publishedAt,
      rawContent: input.rawContent,
      fetchStatus: input.rawContent ? 'fetched' : (input.url ? 'pending' : 'fetched'),
      fetchedAt: input.rawContent ? new Date() : null,
      createdBy: user.id,
    })
    .returning({ id: eiSources.id })

  revalidatePath('/admin/event-ingestion/sources')
  return { ok: true, data: { id: source.id } }
}

export async function updateSource(
  id: string,
  data: Partial<{
    url: string
    title: string
    sourceType: SourceType
    sourceName: string
    publishedAt: Date
    rawContent: string
    fetchStatus: FetchStatus
    fetchError: string
    fetchedAt: Date
    processingStatus: ProcessingStatus
    aiSummary: string
    aiExtractedData: EiExtractedData
  }>
): Promise<ApiResponse> {
  await requireUser()

  await db
    .update(eiSources)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(eiSources.id, id))

  revalidatePath('/admin/event-ingestion/sources')
  revalidatePath(`/admin/event-ingestion/sources/${id}`)
  return { ok: true }
}

export async function deleteSource(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(eiSources).where(eq(eiSources.id, id))

  revalidatePath('/admin/event-ingestion/sources')
  return { ok: true }
}

export async function getSources(): Promise<EiSource[]> {
  await requireUser()

  const sources = await db
    .select()
    .from(eiSources)
    .orderBy(desc(eiSources.createdAt))

  return sources as EiSource[]
}

export async function getSource(id: string): Promise<EiSource | null> {
  await requireUser()

  const [source] = await db
    .select()
    .from(eiSources)
    .where(eq(eiSources.id, id))

  return source as EiSource | null
}

// ============================================================================
// CANDIDATES
// ============================================================================

export async function createCandidate(input: {
  title?: string
  description?: string
  eventType?: string
  occurredAt?: Date
  detectedEntityId?: string
  detectedAdministrationId?: string
  confidenceScore?: number
  aiReasoning?: string
  sourceIds: string[]
}): Promise<ApiResponse<{ id: string }>> {
  await requireUser()

  const [candidate] = await db
    .insert(eiCandidates)
    .values({
      title: input.title,
      description: input.description,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
      detectedEntityId: input.detectedEntityId,
      detectedAdministrationId: input.detectedAdministrationId,
      confidenceScore: input.confidenceScore?.toString(),
      aiReasoning: input.aiReasoning,
      status: 'pending',
    })
    .returning({ id: eiCandidates.id })

  // Link sources to candidate
  for (const sourceId of input.sourceIds) {
    await db.insert(eiCandidateSources).values({
      candidateId: candidate.id,
      sourceId,
      relevance: 'primary',
    })
  }

  revalidatePath('/admin/event-ingestion/candidates')
  revalidatePath('/admin/event-ingestion/sources')
  return { ok: true, data: { id: candidate.id } }
}

export async function updateCandidate(
  id: string,
  data: Partial<{
    title: string
    description: string
    eventType: string
    occurredAt: Date
    detectedEntityId: string
    detectedAdministrationId: string
    confidenceScore: string
    aiReasoning: string
    status: CandidateStatus
    mergedIntoId: string
    rejectionReason: string
  }>
): Promise<ApiResponse> {
  const user = await requireUser()

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  }

  // Set review metadata if status is changing to approved/rejected
  if (data.status === 'approved' || data.status === 'rejected') {
    updateData.reviewedBy = user.id
    updateData.reviewedAt = new Date()
  }

  await db
    .update(eiCandidates)
    .set(updateData)
    .where(eq(eiCandidates.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  revalidatePath(`/admin/event-ingestion/candidates/${id}`)
  return { ok: true }
}

export async function deleteCandidate(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(eiCandidates).where(eq(eiCandidates.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  return { ok: true }
}

export async function getCandidates(): Promise<EiCandidate[]> {
  await requireUser()

  const candidates = await db
    .select({
      id: eiCandidates.id,
      title: eiCandidates.title,
      description: eiCandidates.description,
      eventType: eiCandidates.eventType,
      occurredAt: eiCandidates.occurredAt,
      detectedEntityId: eiCandidates.detectedEntityId,
      detectedEntityName: politicalEntities.name,
      detectedAdministrationId: eiCandidates.detectedAdministrationId,
      confidenceScore: eiCandidates.confidenceScore,
      aiReasoning: eiCandidates.aiReasoning,
      status: eiCandidates.status,
      mergedIntoId: eiCandidates.mergedIntoId,
      eventId: eiCandidates.eventId,
      reviewedBy: eiCandidates.reviewedBy,
      reviewedAt: eiCandidates.reviewedAt,
      rejectionReason: eiCandidates.rejectionReason,
      createdAt: eiCandidates.createdAt,
      updatedAt: eiCandidates.updatedAt,
    })
    .from(eiCandidates)
    .leftJoin(politicalEntities, eq(eiCandidates.detectedEntityId, politicalEntities.id))
    .orderBy(desc(eiCandidates.createdAt))

  return candidates as EiCandidate[]
}

export async function getCandidate(id: string): Promise<EiCandidate | null> {
  await requireUser()

  const [candidate] = await db
    .select({
      id: eiCandidates.id,
      title: eiCandidates.title,
      description: eiCandidates.description,
      eventType: eiCandidates.eventType,
      occurredAt: eiCandidates.occurredAt,
      detectedEntityId: eiCandidates.detectedEntityId,
      detectedEntityName: politicalEntities.name,
      detectedAdministrationId: eiCandidates.detectedAdministrationId,
      confidenceScore: eiCandidates.confidenceScore,
      aiReasoning: eiCandidates.aiReasoning,
      status: eiCandidates.status,
      mergedIntoId: eiCandidates.mergedIntoId,
      eventId: eiCandidates.eventId,
      reviewedBy: eiCandidates.reviewedBy,
      reviewedAt: eiCandidates.reviewedAt,
      rejectionReason: eiCandidates.rejectionReason,
      createdAt: eiCandidates.createdAt,
      updatedAt: eiCandidates.updatedAt,
    })
    .from(eiCandidates)
    .leftJoin(politicalEntities, eq(eiCandidates.detectedEntityId, politicalEntities.id))
    .where(eq(eiCandidates.id, id))

  if (!candidate) return null

  // Get linked sources
  const sourceLinks = await db
    .select({ sourceId: eiCandidateSources.sourceId })
    .from(eiCandidateSources)
    .where(eq(eiCandidateSources.candidateId, id))

  const sourceIds = sourceLinks.map(s => s.sourceId)
  let sources: EiSource[] = []
  if (sourceIds.length > 0) {
    sources = await db
      .select()
      .from(eiSources)
      .where(inArray(eiSources.id, sourceIds)) as EiSource[]
  }

  // Get candidate changes
  const candidateChanges = await db
    .select()
    .from(eiCandidateChanges)
    .where(eq(eiCandidateChanges.candidateId, id))

  return {
    ...candidate,
    sources,
    changes: candidateChanges as EiCandidateChange[],
  } as EiCandidate
}

// ============================================================================
// CANDIDATE CHANGES
// ============================================================================

export async function createCandidateChange(input: {
  candidateId: string
  targetType: 'provision' | 'entity' | 'administration'
  targetId?: string
  action: ChangeAction
  proposedData: EiProposedData
  description?: string
  effectiveAt?: Date
}): Promise<ApiResponse<{ id: string }>> {
  await requireUser()

  const [change] = await db
    .insert(eiCandidateChanges)
    .values({
      candidateId: input.candidateId,
      targetType: input.targetType,
      targetId: input.targetId,
      action: input.action,
      proposedData: input.proposedData,
      description: input.description,
      effectiveAt: input.effectiveAt,
      status: 'pending',
    })
    .returning({ id: eiCandidateChanges.id })

  revalidatePath(`/admin/event-ingestion/candidates/${input.candidateId}`)
  return { ok: true, data: { id: change.id } }
}

export async function updateCandidateChange(
  id: string,
  data: Partial<{
    targetId: string
    action: ChangeAction
    proposedData: EiProposedData
    description: string
    effectiveAt: Date
    status: ChangeStatus
  }>
): Promise<ApiResponse> {
  await requireUser()

  await db
    .update(eiCandidateChanges)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(eiCandidateChanges.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  return { ok: true }
}

export async function deleteCandidateChange(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(eiCandidateChanges).where(eq(eiCandidateChanges.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  return { ok: true }
}

// ============================================================================
// PROMOTION (Candidate → Event + Changes + Updates)
// ============================================================================

export async function approveCandidate(candidateId: string): Promise<ApiResponse<{ eventId: string }>> {
  await requireUser()

  const candidate = await getCandidate(candidateId)
  if (!candidate) {
    return { ok: false, error: 'Candidate not found' }
  }

  if (!candidate.title || !candidate.eventType || !candidate.occurredAt) {
    return { ok: false, error: 'Candidate is missing required fields (title, eventType, occurredAt)' }
  }

  // 1. Create the event
  const [event] = await db
    .insert(events)
    .values({
      administrationId: candidate.detectedAdministrationId,
      title: candidate.title,
      description: candidate.description,
      type: candidate.eventType,
      occurredAt: candidate.occurredAt,
    })
    .returning({ id: events.id })

  // 2. Process approved changes
  const approvedChanges = candidate.changes?.filter(c => c.status === 'approved') || []

  for (const candidateChange of approvedChanges) {
    // Create the change record
    const [changeRecord] = await db
      .insert(changes)
      .values({
        eventId: event.id,
        targetType: candidateChange.targetType,
        targetId: candidateChange.targetId!,
        description: candidateChange.description,
        effectiveAt: candidateChange.effectiveAt,
      })
      .returning({ id: changes.id })

    // Update the ei_candidate_changes with the new change_id
    await db
      .update(eiCandidateChanges)
      .set({ changeId: changeRecord.id })
      .where(eq(eiCandidateChanges.id, candidateChange.id))

    // Apply the change to the target
    if (candidateChange.action === 'update' && candidateChange.targetId) {
      if (candidateChange.targetType === 'provision') {
        const updateData: Record<string, unknown> = { ...candidateChange.proposedData }

        // Handle display_changes append
        if (candidateChange.proposedData.displayChanges) {
          const [currentProvision] = await db
            .select({ displayChanges: provisions.displayChanges })
            .from(provisions)
            .where(eq(provisions.id, candidateChange.targetId))

          const currentItems = currentProvision?.displayChanges?.items || []
          const newItems = candidateChange.proposedData.displayChanges.items || []
          updateData.displayChanges = { items: [...currentItems, ...newItems] }
        }

        await db
          .update(provisions)
          .set(updateData)
          .where(eq(provisions.id, candidateChange.targetId))
      }
      // Add handlers for 'entity' and 'administration' as needed
    }
  }

  // 3. Update candidate status
  await db
    .update(eiCandidates)
    .set({
      status: 'approved',
      eventId: event.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(eiCandidates.id, candidateId))

  revalidatePath('/admin/event-ingestion/candidates')
  revalidatePath(`/admin/event-ingestion/candidates/${candidateId}`)
  revalidatePath('/pe') // Provision explorer
  return { ok: true, data: { eventId: event.id } }
}

// ============================================================================
// HELPERS
// ============================================================================

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

export async function getAdministrations() {
  await requireUser()

  return db
    .select({
      id: administrations.id,
      name: administrations.name,
      entityId: administrations.entityId,
    })
    .from(administrations)
    .orderBy(administrations.name)
}

export async function getProvisions() {
  await requireUser()

  return db
    .select({
      id: provisions.id,
      title: provisions.title,
      entityId: provisions.entityId,
    })
    .from(provisions)
    .orderBy(provisions.title)
}

export async function linkSourceToCandidate(
  candidateId: string,
  sourceId: string,
  relevance: 'primary' | 'supporting' | 'related' = 'supporting'
): Promise<ApiResponse> {
  await requireUser()

  await db.insert(eiCandidateSources).values({
    candidateId,
    sourceId,
    relevance,
  })

  revalidatePath(`/admin/event-ingestion/candidates/${candidateId}`)
  return { ok: true }
}

export async function unlinkSourceFromCandidate(
  candidateId: string,
  sourceId: string
): Promise<ApiResponse> {
  await requireUser()

  await db
    .delete(eiCandidateSources)
    .where(
      eq(eiCandidateSources.candidateId, candidateId)
    )

  revalidatePath(`/admin/event-ingestion/candidates/${candidateId}`)
  return { ok: true }
}
