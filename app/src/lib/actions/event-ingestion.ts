'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { ingSources, eventCandidates, candidateDocuments, changeCandidates, documents, events, changes, provisions, entities, administrations } from '@/lib/db/schema'
import type { SourceExtractedData, CandidateProposedData } from '@/lib/db/schema'
export type { CandidateProposedData }
import { eq, desc, inArray } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import type { ApiResponse } from '@pint/types'

// Types
export type SourceType = 'news' | 'official_gazette' | 'press_release' | 'council_minutes' | 'social' | 'manual'
export type FetchStatus = 'pending' | 'fetching' | 'fetched' | 'failed'
export type ProcessingStatus = 'unprocessed' | 'processing' | 'processed' | 'discarded'
export type CandidateStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'merged'
export type ChangeAction = 'update'  // Only updates allowed - no create/delete through event ingestion
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
  aiExtractedData: SourceExtractedData | null
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface EiDocument {
  id: string
  url: string | null
  title: string | null
  documentType: string
}

export interface EiCandidate {
  id: string
  title: string | null
  description: string | null
  eventType: string | null
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
  documents?: EiDocument[]
  changes?: EiCandidateChange[]
}

export interface EiCandidateChange {
  id: string
  candidateId: string
  targetType: 'provision' | 'entity' | 'administration'
  targetId: string | null
  targetTitle?: string | null
  action: ChangeAction
  proposedData: CandidateProposedData
  description: string | null
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
    .insert(ingSources)
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
    .returning({ id: ingSources.id })

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
    aiExtractedData: SourceExtractedData
  }>
): Promise<ApiResponse> {
  await requireUser()

  await db
    .update(ingSources)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(ingSources.id, id))

  revalidatePath('/admin/event-ingestion/sources')
  revalidatePath(`/admin/event-ingestion/sources/${id}`)
  return { ok: true }
}

export async function deleteSource(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(ingSources).where(eq(ingSources.id, id))

  revalidatePath('/admin/event-ingestion/sources')
  return { ok: true }
}

export async function getSources(): Promise<EiSource[]> {
  await requireUser()

  const sources = await db
    .select()
    .from(ingSources)
    .orderBy(desc(ingSources.createdAt))

  return sources as EiSource[]
}

export async function getSource(id: string): Promise<EiSource | null> {
  await requireUser()

  const [source] = await db
    .select()
    .from(ingSources)
    .where(eq(ingSources.id, id))

  return source as EiSource | null
}

// ============================================================================
// CANDIDATES
// ============================================================================

export async function createCandidate(input: {
  title?: string
  description?: string
  eventType?: string
  detectedEntityId?: string
  detectedAdministrationId?: string
  confidenceScore?: number
  aiReasoning?: string
  sourceIds: string[]
}): Promise<ApiResponse<{ id: string }>> {
  await requireUser()

  const [candidate] = await db
    .insert(eventCandidates)
    .values({
      title: input.title,
      description: input.description,
      eventType: input.eventType,
      detectedEntityId: input.detectedEntityId,
      detectedAdministrationId: input.detectedAdministrationId,
      confidenceScore: input.confidenceScore?.toString(),
      aiReasoning: input.aiReasoning,
      status: 'pending',
    })
    .returning({ id: eventCandidates.id })

  // Note: Sources are now linked via documents (sou_documents)
  // The backend promotes ing_sources → sou_documents before candidate creation
  // Document IDs would be passed separately via the API
  // This function is for manual candidate creation without source linking

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
    .update(eventCandidates)
    .set(updateData)
    .where(eq(eventCandidates.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  revalidatePath(`/admin/event-ingestion/candidates/${id}`)
  return { ok: true }
}

export async function deleteCandidate(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(eventCandidates).where(eq(eventCandidates.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  return { ok: true }
}

export async function getCandidates(): Promise<EiCandidate[]> {
  await requireUser()

  const candidates = await db
    .select({
      id: eventCandidates.id,
      title: eventCandidates.title,
      description: eventCandidates.description,
      eventType: eventCandidates.eventType,
      detectedEntityId: eventCandidates.detectedEntityId,
      detectedEntityName: entities.name,
      detectedAdministrationId: eventCandidates.detectedAdministrationId,
      confidenceScore: eventCandidates.confidenceScore,
      aiReasoning: eventCandidates.aiReasoning,
      status: eventCandidates.status,
      mergedIntoId: eventCandidates.mergedIntoId,
      eventId: eventCandidates.eventId,
      reviewedBy: eventCandidates.reviewedBy,
      reviewedAt: eventCandidates.reviewedAt,
      rejectionReason: eventCandidates.rejectionReason,
      createdAt: eventCandidates.createdAt,
      updatedAt: eventCandidates.updatedAt,
    })
    .from(eventCandidates)
    .leftJoin(entities, eq(eventCandidates.detectedEntityId, entities.id))
    .orderBy(desc(eventCandidates.createdAt))

  return candidates as EiCandidate[]
}

export async function getCandidate(id: string): Promise<EiCandidate | null> {
  await requireUser()

  const [candidate] = await db
    .select({
      id: eventCandidates.id,
      title: eventCandidates.title,
      description: eventCandidates.description,
      eventType: eventCandidates.eventType,
      detectedEntityId: eventCandidates.detectedEntityId,
      detectedEntityName: entities.name,
      detectedAdministrationId: eventCandidates.detectedAdministrationId,
      confidenceScore: eventCandidates.confidenceScore,
      aiReasoning: eventCandidates.aiReasoning,
      status: eventCandidates.status,
      mergedIntoId: eventCandidates.mergedIntoId,
      eventId: eventCandidates.eventId,
      reviewedBy: eventCandidates.reviewedBy,
      reviewedAt: eventCandidates.reviewedAt,
      rejectionReason: eventCandidates.rejectionReason,
      createdAt: eventCandidates.createdAt,
      updatedAt: eventCandidates.updatedAt,
    })
    .from(eventCandidates)
    .leftJoin(entities, eq(eventCandidates.detectedEntityId, entities.id))
    .where(eq(eventCandidates.id, id))

  if (!candidate) return null

  // Get linked documents (via ingpl_candidate_documents)
  const documentLinks = await db
    .select({
      documentId: candidateDocuments.documentId,
      relevance: candidateDocuments.relevance,
    })
    .from(candidateDocuments)
    .where(eq(candidateDocuments.candidateId, id))

  const documentIds = documentLinks.map(d => d.documentId)
  let candidateDocs: Array<{ id: string; url: string | null; title: string | null; documentType: string }> = []
  if (documentIds.length > 0) {
    candidateDocs = await db
      .select({
        id: documents.id,
        url: documents.url,
        title: documents.title,
        documentType: documents.documentType,
      })
      .from(documents)
      .where(inArray(documents.id, documentIds))
  }

  // Get candidate changes
  const candidateChanges = await db
    .select()
    .from(changeCandidates)
    .where(eq(changeCandidates.candidateId, id))

  return {
    ...candidate,
    documents: candidateDocs,
    changes: candidateChanges as EiCandidateChange[],
  } as EiCandidate
}

// ============================================================================
// CANDIDATE CHANGES
// ============================================================================

export async function createCandidateChange(input: {
  candidateId: string
  targetType: 'provision'  // Only provisions can be updated through events
  targetId: string  // Required - must reference existing provision
  proposedData: CandidateProposedData
  description?: string
}): Promise<ApiResponse<{ id: string }>> {
  await requireUser()

  const [change] = await db
    .insert(changeCandidates)
    .values({
      candidateId: input.candidateId,
      targetType: input.targetType,
      targetId: input.targetId,
      action: 'update',  // Always 'update' - no create/delete allowed
      proposedData: input.proposedData,
      description: input.description,
      status: 'pending',
    })
    .returning({ id: changeCandidates.id })

  revalidatePath(`/admin/event-ingestion/candidates/${input.candidateId}`)
  return { ok: true, data: { id: change.id } }
}

export async function updateCandidateChange(
  id: string,
  data: Partial<{
    targetId: string
    proposedData: CandidateProposedData
    description: string
    status: ChangeStatus
  }>
): Promise<ApiResponse> {
  await requireUser()

  await db
    .update(changeCandidates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(changeCandidates.id, id))

  revalidatePath('/admin/event-ingestion/candidates')
  return { ok: true }
}

export async function deleteCandidateChange(id: string): Promise<ApiResponse> {
  await requireUser()

  await db.delete(changeCandidates).where(eq(changeCandidates.id, id))

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

  if (!candidate.title || !candidate.eventType) {
    return { ok: false, error: 'Candidate is missing required fields (title, eventType)' }
  }

  // 1. Create the event
  const [event] = await db
    .insert(events)
    .values({
      administrationId: candidate.detectedAdministrationId,
      title: candidate.title,
      description: candidate.description,
      type: candidate.eventType,
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
      })
      .returning({ id: changes.id })

    // Update the ei_candidate_changes with the new change_id
    await db
      .update(changeCandidates)
      .set({ changeId: changeRecord.id })
      .where(eq(changeCandidates.id, candidateChange.id))

    // Apply the change to the provision (only updates to provisions are allowed)
    if (candidateChange.targetId && candidateChange.targetType === 'provision') {
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
  }

  // 3. Update candidate status
  await db
    .update(eventCandidates)
    .set({
      status: 'approved',
      eventId: event.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(eventCandidates.id, candidateId))

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
      id: entities.id,
      name: entities.name,
      type: entities.type,
    })
    .from(entities)
    .orderBy(entities.name)
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

export async function linkDocumentToCandidate(
  candidateId: string,
  documentId: string,
  relevance: 'primary' | 'supporting' | 'related' = 'supporting'
): Promise<ApiResponse> {
  await requireUser()

  await db.insert(candidateDocuments).values({
    candidateId,
    documentId,
    relevance,
  })

  revalidatePath(`/admin/event-ingestion/candidates/${candidateId}`)
  return { ok: true }
}

export async function unlinkDocumentFromCandidate(
  candidateId: string,
  documentId: string
): Promise<ApiResponse> {
  await requireUser()

  await db
    .delete(candidateDocuments)
    .where(
      eq(candidateDocuments.candidateId, candidateId)
    )

  revalidatePath(`/admin/event-ingestion/candidates/${candidateId}`)
  return { ok: true }
}
