'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SubsectionTitle } from '@/components/custom-ui/typography'
import {
  updateSource,
  deleteSource,
  createCandidate,
  type EiSource,
} from '@/lib/actions/event-ingestion'

const API_BASE = process.env.NEXT_PUBLIC_AGENTS_API_URL || 'http://localhost:8000'

interface SourceWorkflowProps {
  source: EiSource
}

export function SourceWorkflow({ source }: SourceWorkflowProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const pollForCompletion = async (checkFn: () => Promise<boolean>, interval = 2000, maxAttempts = 30) => {
    setPolling(true)
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval))
      const done = await checkFn()
      if (done) {
        setPolling(false)
        router.refresh()
        return true
      }
    }
    setPolling(false)
    return false
  }

  const handleFetch = async () => {
    if (!source.url) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No URL to fetch',
      })
      return
    }

    setLoading('fetch')
    try {
      const response = await fetch(`${API_BASE}/event-ingestion/sources/${source.id}/fetch`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.status === 'success') {
        toast({
          title: 'Content fetched',
          description: `Fetched ${result.content_length} characters`,
        })
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Fetch failed',
          description: result.error || 'Unknown error',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch content',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleProcess = async () => {
    setLoading('process')
    try {
      const response = await fetch(`${API_BASE}/event-ingestion/sources/${source.id}/process`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.status === 'processing') {
        toast({
          title: 'Processing started',
          description: 'AI is analyzing the content...',
        })

        // Poll for completion
        const completed = await pollForCompletion(async () => {
          const statusRes = await fetch(`${API_BASE}/event-ingestion/sources/${source.id}/status`)
          const status = await statusRes.json()
          return status.processing_status === 'processed' || status.processing_status === 'discarded'
        })

        if (completed) {
          toast({
            title: 'Processing complete',
            description: 'Source has been analyzed',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Timeout',
            description: 'Processing is taking longer than expected. Check back later.',
          })
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to start processing',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger processing',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDiscard = async () => {
    setLoading('discard')
    try {
      await updateSource(source.id, {
        processingStatus: 'discarded',
      })
      toast({
        title: 'Source discarded',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to discard source',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this source?')) return

    setLoading('delete')
    try {
      await deleteSource(source.id)
      toast({
        title: 'Source deleted',
      })
      router.push('/admin/event-ingestion/sources')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete source',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleCreateCandidate = async () => {
    setLoading('candidate')
    try {
      const response = await fetch(`${API_BASE}/event-ingestion/candidates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_ids: [source.id] }),
      })
      const result = await response.json()

      if (result.status === 'generating') {
        toast({
          title: 'Generating candidate',
          description: 'AI is creating an event candidate...',
        })

        // Poll briefly then redirect to candidates list
        await new Promise(resolve => setTimeout(resolve, 3000))
        router.push('/admin/event-ingestion/candidates')
      } else if (result.candidate_id) {
        toast({
          title: 'Candidate created',
          description: 'Redirecting to candidate...',
        })
        router.push(`/admin/event-ingestion/candidates/${result.candidate_id}`)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to create candidate',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create candidate',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="text-xs text-gray-500 block">Fetch Status</span>
          <Badge
            className={
              source.fetchStatus === 'fetched'
                ? 'bg-green-100 text-green-800'
                : source.fetchStatus === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }
          >
            {source.fetchStatus}
          </Badge>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Processing Status</span>
          <Badge
            className={
              source.processingStatus === 'processed'
                ? 'bg-green-100 text-green-800'
                : source.processingStatus === 'discarded'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {source.processingStatus}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      {source.rawContent && (
        <div>
          <SubsectionTitle>Raw Content</SubsectionTitle>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap text-gray-600">
              {source.rawContent}
            </pre>
          </div>
        </div>
      )}

      {/* AI Summary Section */}
      {source.aiSummary && (
        <div>
          <SubsectionTitle>AI Summary</SubsectionTitle>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{source.aiSummary}</p>
          </div>
        </div>
      )}

      {/* Extracted Data Section */}
      {source.aiExtractedData && Object.keys(source.aiExtractedData).length > 0 && (
        <div>
          <SubsectionTitle>Extracted Data</SubsectionTitle>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {source.aiExtractedData.topics && source.aiExtractedData.topics.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Topics:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {source.aiExtractedData.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {source.aiExtractedData.entitiesMentioned && source.aiExtractedData.entitiesMentioned.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Entities Mentioned:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {source.aiExtractedData.entitiesMentioned.map((entity) => (
                    <Badge key={entity} variant="outline">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {source.aiExtractedData.datesMentioned && source.aiExtractedData.datesMentioned.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Dates Mentioned:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {source.aiExtractedData.datesMentioned.map((date) => (
                    <Badge key={date} variant="outline">
                      {date}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {source.aiExtractedData.eventTypeHints && source.aiExtractedData.eventTypeHints.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Event Type Hints:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {source.aiExtractedData.eventTypeHints.map((hint) => (
                    <Badge key={hint} className="bg-purple-100 text-purple-800">
                      {hint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t pt-6">
        <SubsectionTitle>Actions</SubsectionTitle>
        <div className="flex gap-3 flex-wrap">
          {source.fetchStatus === 'pending' && source.url && (
            <Button
              onClick={handleFetch}
              disabled={loading !== null}
            >
              {loading === 'fetch' ? 'Fetching...' : 'Fetch Content'}
            </Button>
          )}

          {source.fetchStatus === 'fetched' && source.processingStatus === 'unprocessed' && (
            <Button
              onClick={handleProcess}
              disabled={loading !== null || polling}
            >
              {loading === 'process' ? (polling ? 'Analyzing...' : 'Starting...') : 'Process with AI'}
            </Button>
          )}

          {source.processingStatus === 'processing' && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Processing in progress...
            </Badge>
          )}

          {source.processingStatus === 'processed' && (
            <Button
              onClick={handleCreateCandidate}
              disabled={loading !== null}
            >
              {loading === 'candidate' ? 'Creating...' : 'Create Candidate'}
            </Button>
          )}

          {source.processingStatus !== 'discarded' && (
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={loading !== null}
            >
              {loading === 'discard' ? 'Discarding...' : 'Discard'}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading !== null}
          >
            {loading === 'delete' ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t pt-6 text-xs text-gray-400">
        <p>Created: {new Date(source.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(source.updatedAt).toLocaleString()}</p>
        {source.fetchedAt && (
          <p>Fetched: {new Date(source.fetchedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}
