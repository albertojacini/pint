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

  // Research prompt state
  const [researchPrompt, setResearchPrompt] = useState(draft.researchPrompt || '')
  const [agentType, setAgentType] = useState<'claude' | 'lcdeep'>('claude')

  // Editable fields for review step
  const [editedTitle, setEditedTitle] = useState(draft.title || '')
  const [editedDescriptionShort, setEditedDescriptionShort] = useState(draft.descriptionShort || '')
  const [editedDescription, setEditedDescription] = useState(draft.description || '')
  const [editedSummary, setEditedSummary] = useState(draft.summary_md || '')
  const [editedRelevance, setEditedRelevance] = useState<number | null>(draft.relevance || null)
  const [editedProvisionType, setEditedProvisionType] = useState<ProvisionType | null>(draft.provisionType || null)

  const router = useRouter()
  const { toast } = useToast()

  // Step 1: Generate research prompt
  const handleGeneratePrompt = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/provision/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_description: draft.inputDescription,
          entity_name: draft.entityName || '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate research prompt')
      }

      const result = await response.json()
      setResearchPrompt(result.research_prompt)

      // Update draft status
      await updateDraft(draft.id, {
        researchPrompt: result.research_prompt,
        jobStatus: 'prompt_generated',
      })

      setDraft((d) => ({
        ...d,
        researchPrompt: result.research_prompt,
        jobStatus: 'prompt_generated',
      }))

      toast({
        title: 'Prompt generated',
        description: 'Review and approve the research prompt',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate prompt',
        description: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Start research with approved prompt
  const handleStartResearch = async () => {
    if (!researchPrompt) return

    setLoading(true)
    try {
      // Save the potentially edited prompt
      await updateDraft(draft.id, {
        researchPrompt,
        jobStatus: 'researching',
      })

      // Start research job
      const response = await fetch(`${API_BASE}/provision/start-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_prompt: researchPrompt,
          entity_name: draft.entityName || '',
          entity_id: draft.entityId,
          agent_type: agentType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start research')
      }

      const { task_id } = await response.json()

      await updateDraft(draft.id, { researchTaskId: task_id })

      setDraft((d) => ({
        ...d,
        researchPrompt,
        jobStatus: 'researching',
        researchTaskId: task_id,
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

  // Poll for research status
  const pollResearchStatus = useCallback(async () => {
    if (!draft.researchTaskId || draft.jobStatus !== 'researching') return

    try {
      const response = await fetch(`${API_BASE}/provision/research-status/${draft.researchTaskId}`)
      if (!response.ok) return

      const result = await response.json()

      if (result.status === 'completed' && result.summary) {
        // Update draft with research summary
        await updateDraft(draft.id, {
          researchSummary: result.summary,
          jobStatus: 'research_complete',
        })

        setDraft((d) => ({
          ...d,
          researchSummary: result.summary,
          jobStatus: 'research_complete',
        }))

        setLoading(false)
        toast({
          title: 'Research complete',
          description: 'Generating provision draft...',
        })
      } else if (result.status === 'failed') {
        await updateDraft(draft.id, {
          jobStatus: 'failed',
          errorMessage: 'Research failed',
        })

        setDraft((d) => ({
          ...d,
          jobStatus: 'failed',
          errorMessage: 'Research failed',
        }))

        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'Research failed',
          description: 'Please try again',
        })
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [draft.researchTaskId, draft.jobStatus, draft.id, toast])

  useEffect(() => {
    if (draft.jobStatus !== 'researching') return

    const interval = setInterval(pollResearchStatus, 3000)
    return () => clearInterval(interval)
  }, [draft.jobStatus, pollResearchStatus])

  // Step 3: Generate provision draft from research summary
  const handleGenerateDraft = async () => {
    if (!draft.researchSummary) return

    setLoading(true)
    try {
      await updateDraft(draft.id, { jobStatus: 'generating_draft' })
      setDraft((d) => ({ ...d, jobStatus: 'generating_draft' }))

      const response = await fetch(`${API_BASE}/provision/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_summary: draft.researchSummary,
          entity_name: draft.entityName || '',
          input_description: draft.inputDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate draft')
      }

      const result = await response.json()

      // Update draft with generated content
      await updateDraft(draft.id, {
        title: result.title,
        descriptionShort: result.description_short,
        description: result.description,
        summary: result.summary_md,
        provisionType: result.provision_type,
        relevance: result.relevance,
        confidence: String(result.confidence),
        sourceUrls: result.source_urls,
        jobStatus: 'review',
      })

      setDraft((d) => ({
        ...d,
        title: result.title,
        descriptionShort: result.description_short,
        description: result.description,
        summary_md: result.summary_md,
        provisionType: result.provision_type,
        relevance: result.relevance,
        confidence: String(result.confidence),
        sourceUrls: result.source_urls,
        jobStatus: 'review',
      }))

      // Update editable fields
      setEditedTitle(result.title || '')
      setEditedDescriptionShort(result.description_short || '')
      setEditedDescription(result.description || '')
      setEditedSummary(result.summary_md || '')
      setEditedRelevance(result.relevance || null)
      setEditedProvisionType(result.provision_type || null)

      toast({
        title: 'Draft generated',
        description: 'Review and edit the provision details',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate draft',
        description: String(error),
      })
      await updateDraft(draft.id, { jobStatus: 'research_complete' })
      setDraft((d) => ({ ...d, jobStatus: 'research_complete' }))
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate prompt on mount if in input state
  useEffect(() => {
    if (draft.jobStatus === 'input') {
      handleGeneratePrompt()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-generate draft when research completes
  useEffect(() => {
    if (draft.jobStatus === 'research_complete' && draft.researchSummary) {
      handleGenerateDraft()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.jobStatus, draft.researchSummary])

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
        provisionType: editedProvisionType ?? undefined,
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

  // Retry from beginning
  const handleRetry = async () => {
    await updateDraft(draft.id, {
      jobStatus: 'input',
      errorMessage: undefined,
    })
    setDraft((d) => ({ ...d, jobStatus: 'input', errorMessage: null }))
    handleGeneratePrompt()
  }

  // Render based on status
  return (
    <div className="space-y-6">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge
          className={
            draft.jobStatus === 'review' || draft.jobStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : draft.jobStatus === 'failed'
                ? 'bg-red-100 text-red-800'
                : draft.jobStatus === 'researching' || draft.jobStatus === 'generating_draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
          }
        >
          {draft.jobStatus.replace('_', ' ')}
        </Badge>
        {draft.provisionType && (
          <Badge className="bg-indigo-100 text-indigo-800">
            {draft.provisionType}
          </Badge>
        )}
      </div>

      {/* Input description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700">Research Topic</p>
        <p className="text-sm text-gray-600 mt-1">{draft.inputDescription}</p>
      </div>

      {/* Step 1: Generating prompt */}
      {draft.jobStatus === 'input' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">Generating research prompt...</p>
        </div>
      )}

      {/* Step 2: Prompt generated - review and approve */}
      {draft.jobStatus === 'prompt_generated' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="research-prompt">Research Prompt (AI Generated)</Label>
            <Textarea
              id="research-prompt"
              value={researchPrompt}
              onChange={(e) => setResearchPrompt(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Review and edit the prompt if needed before starting research
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-type">Research Agent</Label>
            <select
              id="agent-type"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value as 'claude' | 'lcdeep')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="claude">Claude SDK (WebSearch)</option>
              <option value="lcdeep">LangChain Deep Agents (BrightData)</option>
            </select>
            <p className="text-xs text-gray-500">
              Claude SDK uses built-in search. LangChain uses BrightData for web scraping and Wikipedia.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleStartResearch} disabled={!researchPrompt || loading}>
              {loading ? 'Starting...' : 'Start Research'}
            </Button>
            <Button variant="outline" onClick={handleGeneratePrompt} disabled={loading}>
              Regenerate
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
          <p className="text-gray-500">Researching provision...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a few minutes</p>
        </div>
      )}

      {/* Step 4: Generating draft */}
      {(draft.jobStatus === 'research_complete' || draft.jobStatus === 'generating_draft') && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">Generating provision draft...</p>
        </div>
      )}

      {/* Step 5: Failed */}
      {draft.jobStatus === 'failed' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">Process Failed</p>
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

      {/* Step 6: Review and edit */}
      {draft.jobStatus === 'review' && (
        <div className="space-y-6">
          {/* Research summary (collapsed by default) */}
          <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <summary className="text-sm font-medium text-blue-800 cursor-pointer">
              View Research Summary
            </summary>
            <pre className="text-xs text-blue-600 mt-2 whitespace-pre-wrap overflow-auto max-h-64">
              {draft.researchSummary}
            </pre>
          </details>

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
              <Label>Provision Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROVISION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEditedProvisionType(type)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      editedProvisionType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium capitalize">{type}</p>
                    <p className="text-xs text-gray-500">{typeDescriptions[type]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionShort">Short Description (max 100 chars)</Label>
              <Input
                id="descriptionShort"
                value={editedDescriptionShort}
                onChange={(e) => setEditedDescriptionShort(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-gray-400">{editedDescriptionShort.length}/100</p>
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
              <p className="text-xs text-gray-400">{editedDescription.length}/1000</p>
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
              <p className="text-xs text-gray-400">{editedSummary.length}/20000</p>
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
            <Button onClick={handleSave} disabled={loading || !editedProvisionType}>
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
