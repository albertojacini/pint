'use server'

// Event ingestion actions are disabled — the ingestion pipeline (ing_sources, ingpl_*) tables have been removed.
// This file is a stub to prevent import errors from admin pages that still reference it.

export type SourceType = 'news' | 'official_gazette' | 'press_release' | 'council_minutes' | 'social' | 'manual'
export type FetchStatus = 'pending' | 'fetching' | 'fetched' | 'failed'
export type ProcessingStatus = 'unprocessed' | 'processing' | 'processed' | 'discarded'
export type CandidateStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'merged'
export type ChangeAction = 'update'
export type ChangeStatus = 'pending' | 'approved' | 'rejected' | 'modified'

export type CandidateProposedData = {
  title?: string
  description?: string
  tagline?: string
  analysis?: string
  highlights?: { items: Array<{ label: string; value: string }> }
  changelog?: { items: Array<{ timestamp: string; label: string }> }
  [key: string]: unknown
}

export async function createSource(_input: unknown) {
  throw new Error('Event ingestion has been removed')
}
export async function getSources() { return [] }
export async function getSource(_id: string) { return null }
export async function getCandidates() { return [] }
export async function getCandidate(_id: string) { return null }
export async function getEntities() { return [] }
export async function getProvisions() { return [] }
