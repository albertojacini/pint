import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCandidate, getEntities, getProvisions } from '@/lib/actions/event-ingestion'
import { PageTitle } from '@/components/custom-ui/typography'
import { Badge } from '@/components/ui/badge'
import { CandidateWorkflow } from '@/components/admin/event-ingestion/candidate-workflow'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params
  const [candidate, entities, provisions] = await Promise.all([
    getCandidate(id),
    getEntities(),
    getProvisions(),
  ])

  if (!candidate) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    merged: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link
        href="/admin/event-ingestion/candidates"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to candidates
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <PageTitle>{candidate.title || 'Untitled Candidate'}</PageTitle>
            <Badge className={statusColors[candidate.status]}>
              {candidate.status}
            </Badge>
          </div>
          {candidate.detectedEntityName && (
            <p className="text-gray-500 text-sm mt-1">
              {candidate.detectedEntityName}
            </p>
          )}
        </div>

        <CandidateWorkflow
          candidate={candidate}
          entities={entities}
          provisions={provisions}
        />
      </div>
    </div>
  )
}
