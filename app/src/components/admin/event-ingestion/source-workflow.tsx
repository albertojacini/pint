'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  updateSource,
  deleteSource,
  createCandidate,
  type EiSource,
} from '@/lib/actions/event-ingestion'

interface SourceWorkflowProps {
  source: EiSource
}

export function SourceWorkflow({ source }: SourceWorkflowProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

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
      // For now, just mark as fetched - actual fetching will be done by backend agent
      await updateSource(source.id, {
        fetchStatus: 'fetched',
        fetchedAt: new Date(),
      })
      toast({
        title: 'Fetch triggered',
        description: 'Content will be fetched by the backend agent',
      })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger fetch',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleProcess = async () => {
    setLoading('process')
    try {
      // For now, mark as processing - actual processing will be done by backend agent
      await updateSource(source.id, {
        processingStatus: 'processing',
      })
      toast({
        title: 'Processing triggered',
        description: 'AI will analyze the content',
      })
      router.refresh()
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
      const result = await createCandidate({
        title: source.title || undefined,
        sourceIds: [source.id],
      })
      if (result.ok && result.data) {
        toast({
          title: 'Candidate created',
          description: 'Redirecting to candidate...',
        })
        router.push(`/admin/event-ingestion/candidates/${result.data.id}`)
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
          <h3 className="font-medium text-sm text-gray-700 mb-2">Raw Content</h3>
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
          <h3 className="font-medium text-sm text-gray-700 mb-2">AI Summary</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{source.aiSummary}</p>
          </div>
        </div>
      )}

      {/* Extracted Data Section */}
      {source.aiExtractedData && Object.keys(source.aiExtractedData).length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-2">Extracted Data</h3>
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
        <h3 className="font-medium text-sm text-gray-700 mb-3">Actions</h3>
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
              disabled={loading !== null}
            >
              {loading === 'process' ? 'Processing...' : 'Process with AI'}
            </Button>
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
