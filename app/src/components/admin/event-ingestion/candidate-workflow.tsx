'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  updateCandidate,
  deleteCandidate,
  approveCandidate,
  updateCandidateChange,
  type EiCandidate,
  type EiCandidateChange,
} from '@/lib/actions/event-ingestion'

interface Entity {
  id: string
  name: string
  type: string
}

interface Provision {
  id: string
  title: string
  entityId: string
}

interface CandidateWorkflowProps {
  candidate: EiCandidate
  entities: Entity[]
  provisions: Provision[]
}

const eventTypes = [
  'legislative_session',
  'bill_proposal',
  'referendum',
  'amendment',
  'executive_order',
  'appointment',
  'regulation_update',
  'administrative_reform',
  'court_ruling',
  'legal_challenge',
  'public_consultation',
  'citizen_petition',
  'protest',
  'budget_approval',
  'funding_decision',
  'tax_change',
  'plan_adoption',
  'zoning_decision',
  'project_launch',
  'service_change',
  'contract_award',
  'partnership_agreement',
  'emergency_declaration',
  'crisis_response',
  'policy_review',
]

export function CandidateWorkflow({ candidate, entities, provisions }: CandidateWorkflowProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(candidate.status === 'pending')
  const [formData, setFormData] = useState({
    title: candidate.title || '',
    description: candidate.description || '',
    eventType: candidate.eventType || '',
    occurredAt: candidate.occurredAt
      ? new Date(candidate.occurredAt).toISOString().split('T')[0]
      : '',
    detectedEntityId: candidate.detectedEntityId || '',
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading('save')
    try {
      await updateCandidate(candidate.id, {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        occurredAt: formData.occurredAt ? new Date(formData.occurredAt) : undefined,
        detectedEntityId: formData.detectedEntityId || undefined,
        status: 'reviewing',
      })
      toast({ title: 'Candidate updated' })
      setEditMode(false)
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save candidate',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleApprove = async () => {
    if (!formData.title || !formData.eventType || !formData.occurredAt) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Title, event type, and date are required',
      })
      return
    }

    // First save, then approve
    setLoading('approve')
    try {
      await updateCandidate(candidate.id, {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        occurredAt: new Date(formData.occurredAt),
        detectedEntityId: formData.detectedEntityId || undefined,
      })

      const result = await approveCandidate(candidate.id)
      if (result.ok) {
        toast({
          title: 'Candidate approved',
          description: 'Event has been created',
        })
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to approve candidate',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve candidate',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Rejection reason (optional):')
    setLoading('reject')
    try {
      await updateCandidate(candidate.id, {
        status: 'rejected',
        rejectionReason: reason || undefined,
      })
      toast({ title: 'Candidate rejected' })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject candidate',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this candidate?')) return

    setLoading('delete')
    try {
      await deleteCandidate(candidate.id)
      toast({ title: 'Candidate deleted' })
      router.push('/admin/event-ingestion/candidates')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete candidate',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleChangeStatus = async (changeId: string, status: 'approved' | 'rejected') => {
    try {
      await updateCandidateChange(changeId, { status })
      toast({ title: `Change ${status}` })
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update change status',
      })
    }
  }

  const isApproved = candidate.status === 'approved'
  const isRejected = candidate.status === 'rejected'

  return (
    <div className="space-y-6">
      {/* AI Reasoning */}
      {candidate.aiReasoning && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-sm text-blue-800 mb-2">AI Reasoning</h3>
          <p className="text-sm text-blue-700">{candidate.aiReasoning}</p>
          {candidate.confidenceScore && (
            <p className="text-xs text-blue-600 mt-2">
              Confidence: {(parseFloat(candidate.confidenceScore) * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={!editMode || isApproved}
            placeholder="Event title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={!editMode || isApproved}
            placeholder="Event description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type *</Label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              disabled={!editMode || isApproved}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select type...</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occurredAt">Date *</Label>
            <Input
              id="occurredAt"
              type="date"
              value={formData.occurredAt}
              onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
              disabled={!editMode || isApproved}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="detectedEntityId">Political Entity</Label>
          <select
            id="detectedEntityId"
            value={formData.detectedEntityId}
            onChange={(e) => setFormData({ ...formData, detectedEntityId: e.target.value })}
            disabled={!editMode || isApproved}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select entity...</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} ({entity.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sources */}
      {candidate.sources && candidate.sources.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-2">
            Sources ({candidate.sources.length})
          </h3>
          <div className="space-y-2">
            {candidate.sources.map((source) => (
              <div
                key={source.id}
                className="bg-gray-50 p-3 rounded-lg text-sm"
              >
                <p className="font-medium">{source.title || source.url || 'Untitled'}</p>
                {source.sourceName && (
                  <p className="text-gray-500 text-xs">{source.sourceName}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposed Changes */}
      {candidate.changes && candidate.changes.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-gray-700 mb-2">
            Proposed Changes ({candidate.changes.length})
          </h3>
          <div className="space-y-2">
            {candidate.changes.map((change) => (
              <ChangeCard
                key={change.id}
                change={change}
                provisions={provisions}
                onStatusChange={handleChangeStatus}
                disabled={isApproved || isRejected}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isApproved && (
        <div className="border-t pt-6">
          <div className="flex gap-3 flex-wrap">
            {editMode ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={loading !== null}
                >
                  {loading === 'save' ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  disabled={loading !== null}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  disabled={loading !== null || isRejected}
                >
                  Edit
                </Button>
              </>
            )}

            {!isRejected && (
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading !== null}
              >
                {loading === 'approve' ? 'Approving...' : 'Approve & Create Event'}
              </Button>
            )}

            {!isRejected && (
              <Button
                onClick={handleReject}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={loading !== null}
              >
                {loading === 'reject' ? 'Rejecting...' : 'Reject'}
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
      )}

      {/* Result */}
      {isApproved && candidate.eventId && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 text-sm">
            Event created successfully. Event ID: {candidate.eventId}
          </p>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800 text-sm">
            This candidate was rejected.
            {candidate.rejectionReason && (
              <span className="block mt-1">Reason: {candidate.rejectionReason}</span>
            )}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t pt-6 text-xs text-gray-400">
        <p>Created: {new Date(candidate.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(candidate.updatedAt).toLocaleString()}</p>
        {candidate.reviewedAt && (
          <p>Reviewed: {new Date(candidate.reviewedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}

function ChangeCard({
  change,
  provisions,
  onStatusChange,
  disabled,
}: {
  change: EiCandidateChange
  provisions: Provision[]
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
  disabled: boolean
}) {
  const provision = provisions.find((p) => p.id === change.targetId)

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    modified: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Badge className="mr-2">{change.action}</Badge>
          <span className="text-sm font-medium">{change.targetType}</span>
          {provision && (
            <span className="text-sm text-gray-500 ml-2">
              → {provision.title}
            </span>
          )}
        </div>
        <Badge className={statusColors[change.status]}>{change.status}</Badge>
      </div>

      {change.description && (
        <p className="text-sm text-gray-600 mb-2">{change.description}</p>
      )}

      {Object.keys(change.proposedData).length > 0 && (
        <div className="text-xs text-gray-500 bg-white p-2 rounded mt-2">
          <pre className="overflow-x-auto">
            {JSON.stringify(change.proposedData, null, 2)}
          </pre>
        </div>
      )}

      {change.status === 'pending' && !disabled && (
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600"
            onClick={() => onStatusChange(change.id, 'approved')}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            onClick={() => onStatusChange(change.id, 'rejected')}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}
