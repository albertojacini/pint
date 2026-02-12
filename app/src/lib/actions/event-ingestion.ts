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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EiSource = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EiCandidate = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EiCandidateChange = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fail: { ok: boolean; error: string; data: any } = { ok: false, error: 'Event ingestion has been removed', data: null }

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function createSource(..._args: unknown[]) { return fail }
export async function updateSource(..._args: unknown[]) { return fail }
export async function deleteSource(..._args: unknown[]) { return fail }
export async function getSources(): Promise<EiSource[]> { return [] }
export async function getSource(_id: string): Promise<EiSource | null> { return null }
export async function getCandidates(): Promise<EiCandidate[]> { return [] }
export async function getCandidate(_id: string): Promise<EiCandidate | null> { return null }
export async function createCandidate(..._args: unknown[]) { return fail }
export async function updateCandidate(..._args: unknown[]) { return fail }
export async function approveCandidate(..._args: unknown[]) { return fail }
export async function deleteCandidate(..._args: unknown[]) { return fail }
export async function updateCandidateChange(..._args: unknown[]) { return fail }
export async function createCandidateChange(..._args: unknown[]) { return fail }
export async function deleteCandidateChange(..._args: unknown[]) { return fail }
export async function getEntities() { return [] }
export async function getProvisions() { return [] }
