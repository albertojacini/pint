'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  updateDraft,
  saveDraftToProduction,
  deleteDraft,
  type ProvisionDraft,
  type ProvisionType,
} from '@/lib/actions/provision-drafts'

const API_BASE = process.env.NEXT_PUBLIC_AGENTS_API_URL || 'http://localhost:8000'

const PROVISION_TYPES: ProvisionType[] = [
  'ownership',
  'contract',
  'regulation',
  'taxation',
  'allocation',
  'designation',
]

const typeDescriptions: Record<ProvisionType, string> = {
  ownership: 'Stakes in companies, property, infrastructure',
  contract: 'Service agreements, concessions, partnerships',
  regulation: 'Rules, ordinances, codes, standards',
  taxation: 'Taxes, fees, tariffs',
  allocation: 'Programs, subsidies, budgets, funds',
  designation: 'Zones, landmarks, protected areas, institutions',
}

interface DraftWorkflowProps {
  draft: ProvisionDraft
}

export function DraftWorkflow({ draft: initialDraft }: DraftWorkflowProps) {
  const [draft, setDraft] = useState(initialDraft)
  const [loading, setLoading] = useState(false)
  const [classifyResult, setClassifyResult] = useState<{
    suggested_type: ProvisionType
    confidence: number
    reasoning: string
  } | null>(null)
  const [selectedType, setSelectedType] = useState<ProvisionType | null>(
    draft.confirmedType
  )
  const [selectedAgent, setSelectedAgent] = useState<string>('lcdeep')

  // Editable fields for review step
  const [editedTitle, setEditedTitle] = useState(draft.title || '')
  const [editedDescriptionShort, setEditedDescriptionShort] = useState(
    draft.descriptionShort || ''
  )
  const [editedDescription, setEditedDescription] = useState(
    draft.description || ''
  )
  const [editedSummary, setEditedSummary] = useState(draft.summary || '')
  const [editedRelevance, setEditedRelevance] = useState<number | null>(
    draft.relevance || null
  )

  const router = useRouter()
  const { toast } = useToast()

  // Step 1: Classification
  const handleClassify = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: draft.inputDescription,
          entity_name: draft.entityName || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const result = await response.json()
      setClassifyResult(result)
      setSelectedType(result.suggested_type)

      // Update draft status
      await updateDraft(draft.id, {
        suggestedType: result.suggested_type,
        jobStatus: 'classified',
      })

      setDraft((d) => ({
        ...d,
        suggestedType: result.suggested_type,
        jobStatus: 'classified',
      }))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Classification failed',
        description: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Confirm type and start research
  const handleStartResearch = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      // Update confirmed type
      await updateDraft(draft.id, {
        confirmedType: selectedType,
        jobStatus: 'researching',
      })

      // Start research job
      const response = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: draft.inputDescription,
          provision_type: selectedType,
          entity_name: draft.entityName || '',
          agent: selectedAgent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start research')
      }

      const { job_id } = await response.json()

      await updateDraft(draft.id, { jobId: job_id })

      setDraft((d) => ({
        ...d,
        confirmedType: selectedType,
        jobStatus: 'researching',
        jobId: job_id,
      }))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to start research',
        description: String(error),
      })
      setLoading(false)
    }
  }

  // Poll for job status
  const pollJobStatus = useCallback(async () => {
    if (!draft.jobId || draft.jobStatus !== 'researching') return

    try {
      const response = await fetch(`${API_BASE}/jobs/${draft.jobId}`)
      if (!response.ok) return

      const job = await response.json()

      if (job.status === 'completed' && job.result) {
        // Update draft with results
        const result = job.result
        await updateDraft(draft.id, {
          jobStatus: 'completed',
          title: result.title,
          descriptionShort: result.descriptionShort,
          description: result.description,
          summary: result.summary,
          extraData: result,
          confidence: String(result.confidence || 0),
          sourceUrls: result.sourceUrls || [],
          relevance: result.relevance || null,
        })

        setDraft((d) => ({
          ...d,
          jobStatus: 'completed',
          title: result.title,
          descriptionShort: result.descriptionShort,
          description: result.description,
          summary: result.summary,
          extraData: result,
          confidence: String(result.confidence || 0),
          sourceUrls: result.sourceUrls || [],
          relevance: result.relevance || null,
        }))

        // Update editable fields
        setEditedTitle(result.title || '')
        setEditedDescriptionShort(result.descriptionShort || '')
        setEditedDescription(result.description || '')
        setEditedSummary(result.summary || '')
        setEditedRelevance(result.relevance || null)

        setLoading(false)
        toast({
          title: 'Research complete',
          description: 'Review the results below',
        })
      } else if (job.status === 'failed') {
        await updateDraft(draft.id, {
          jobStatus: 'failed',
          errorMessage: job.error,
        })

        setDraft((d) => ({
          ...d,
          jobStatus: 'failed',
          errorMessage: job.error,
        }))

        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'Research failed',
          description: job.error,
        })
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [draft.jobId, draft.jobStatus, draft.id, toast])

  useEffect(() => {
    if (draft.jobStatus !== 'researching') return

    const interval = setInterval(pollJobStatus, 3000)
    return () => clearInterval(interval)
  }, [draft.jobStatus, pollJobStatus])

  // Auto-classify on mount if pending
  useEffect(() => {
    if (draft.jobStatus === 'pending') {
      handleClassify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to production
  const handleSave = async () => {
    setLoading(true)
    try {
      // First save any edits
      await updateDraft(draft.id, {
        title: editedTitle,
        descriptionShort: editedDescriptionShort,
        description: editedDescription,
        summary: editedSummary,
        relevance: editedRelevance ?? undefined,
      })

      // Then save to production
      const result = await saveDraftToProduction(draft.id)

      if (result.ok) {
        toast({
          title: 'Saved to production',
          description: 'The provision has been created',
        })
        router.push('/admin/provision-ingestion')
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to save',
          description: result.error,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete draft
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    setLoading(true)
    try {
      await deleteDraft(draft.id)
      toast({ title: 'Draft deleted' })
      router.push('/admin/provision-ingestion')
    } finally {
      setLoading(false)
    }
  }

  // Retry research
  const handleRetry = async () => {
    await updateDraft(draft.id, {
      jobStatus: 'pending',
      errorMessage: undefined,
    })
    setDraft((d) => ({ ...d, jobStatus: 'pending', errorMessage: null }))
    handleClassify()
  }

  // Render based on status
  return (
    <div className="space-y-6">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge
          className={
            draft.jobStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : draft.jobStatus === 'failed'
                ? 'bg-red-100 text-red-800'
                : draft.jobStatus === 'researching'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
          }
        >
          {draft.jobStatus}
        </Badge>
        {draft.confirmedType && (
          <Badge className="bg-indigo-100 text-indigo-800">
            {draft.confirmedType}
          </Badge>
        )}
      </div>

      {/* Step 1: Classifying */}
      {(draft.jobStatus === 'pending' || draft.jobStatus === 'classifying') && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">Analyzing provision type...</p>
        </div>
      )}

      {/* Step 2: Classified - confirm type */}
      {draft.jobStatus === 'classified' && (
        <div className="space-y-4">
          {classifyResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">
                AI Suggestion: {classifyResult.suggested_type}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {classifyResult.reasoning}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Confidence: {Math.round(classifyResult.confidence * 100)}%
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select provision type</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROVISION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium capitalize">{type}</p>
                  <p className="text-xs text-gray-500">
                    {typeDescriptions[type]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Agent selection - only for ownership type */}
          {selectedType === 'ownership' && (
            <div className="space-y-2">
              <Label>Select research agent</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAgent('lcdeep')}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedAgent === 'lcdeep'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">LangChain + MCP</p>
                  <p className="text-xs text-gray-500">
                    Uses MCP tools (search_engine, scrape_as_markdown, query_wikipedia)
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAgent('claude')}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedAgent === 'claude'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">Claude SDK</p>
                  <p className="text-xs text-gray-500">
                    Uses built-in tools (WebSearch, WebFetch)
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleStartResearch} disabled={!selectedType || loading}>
              {loading ? 'Starting...' : 'Start Research'}
            </Button>
            <Button variant="outline" onClick={handleDelete} disabled={loading}>
              Delete Draft
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Researching */}
      {draft.jobStatus === 'researching' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">
            Researching {draft.confirmedType} provision...
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This may take a few minutes
          </p>
        </div>
      )}

      {/* Step 4: Failed */}
      {draft.jobStatus === 'failed' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">Research Failed</p>
            <p className="text-sm text-red-600 mt-1">{draft.errorMessage}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRetry}>Retry</Button>
            <Button variant="outline" onClick={handleDelete}>
              Delete Draft
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Completed - review and edit */}
      {draft.jobStatus === 'completed' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionShort">
                Short Description (max 100 chars)
              </Label>
              <Input
                id="descriptionShort"
                value={editedDescriptionShort}
                onChange={(e) => setEditedDescriptionShort(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-gray-400">
                {editedDescriptionShort.length}/100
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (max 1000 chars)</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <p className="text-xs text-gray-400">
                {editedDescription.length}/1000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary (markdown, max 20000 chars)</Label>
              <Textarea
                id="summary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                maxLength={20000}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-400">
                {editedSummary.length}/20000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevance">Relevance (0-10)</Label>
              <Input
                id="relevance"
                type="number"
                min="0"
                max="10"
                value={editedRelevance ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : null
                  if (val === null || (val >= 0 && val <= 10)) {
                    setEditedRelevance(val)
                  }
                }}
              />
              <p className="text-xs text-gray-400">
                AI-computed: {draft.relevance ?? 'N/A'} | Scale: 0=minor, 5=important, 10=critical
              </p>
            </div>

            {draft.sourceUrls && draft.sourceUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Sources</Label>
                <ul className="text-sm text-gray-600 space-y-1">
                  {draft.sourceUrls.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {draft.confidence && (
              <p className="text-sm text-gray-500">
                Confidence: {Math.round(parseFloat(draft.confidence) * 100)}%
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save to Production'}
            </Button>
            <Button variant="outline" onClick={handleDelete} disabled={loading}>
              Delete Draft
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
