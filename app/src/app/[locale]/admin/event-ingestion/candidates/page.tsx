export const dynamic = 'force-dynamic'

import { Link } from '@/i18n/navigation'
import { getCandidates } from '@/lib/actions/event-ingestion'
import { PageHeader } from '@/components/custom-ui/section'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  merged: 'bg-purple-100 text-purple-800',
}

const eventTypeColors: Record<string, string> = {
  legislative_session: 'bg-blue-100 text-blue-800',
  bill_proposal: 'bg-blue-100 text-blue-800',
  executive_order: 'bg-indigo-100 text-indigo-800',
  regulation_update: 'bg-cyan-100 text-cyan-800',
  court_ruling: 'bg-purple-100 text-purple-800',
  budget_approval: 'bg-green-100 text-green-800',
  service_change: 'bg-orange-100 text-orange-800',
  project_launch: 'bg-pink-100 text-pink-800',
}

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <div>
      <Link
        href="/admin/event-ingestion"
        className="text-link hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to Event Ingestion
      </Link>

      <PageHeader title="Event Candidates" />

      {candidates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No candidates yet</p>
          <p className="text-sm text-gray-400">
            Candidates are created from processed sources
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Link
              key={candidate.id}
              href={`/admin/event-ingestion/candidates/${candidate.id}`}
              className="block"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {candidate.title || 'Untitled candidate'}
                    </h3>
                    {candidate.detectedEntityName && (
                      <p className="text-sm text-gray-500 mt-1">
                        {candidate.detectedEntityName}
                      </p>
                    )}
                    {candidate.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {candidate.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    {candidate.eventType && (
                      <Badge className={eventTypeColors[candidate.eventType] || 'bg-gray-100 text-gray-800'}>
                        {candidate.eventType.replace('_', ' ')}
                      </Badge>
                    )}
                    <Badge className={statusColors[candidate.status]}>
                      {candidate.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                  <span>
                    Created {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                  {candidate.confidenceScore && (
                    <span>
                      Confidence: {(parseFloat(candidate.confidenceScore) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
