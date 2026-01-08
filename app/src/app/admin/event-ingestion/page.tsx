export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getSources, getCandidates } from '@/lib/actions/event-ingestion'
import { PageTitle } from '@/components/custom-ui/typography'
import { Badge } from '@/components/ui/badge'

export default async function EventIngestionPage() {
  const [sources, candidates] = await Promise.all([
    getSources(),
    getCandidates(),
  ])

  const pendingSources = sources.filter(s => s.processingStatus === 'unprocessed' || s.processingStatus === 'processing')
  const processedSources = sources.filter(s => s.processingStatus === 'processed')
  const pendingCandidates = candidates.filter(c => c.status === 'pending' || c.status === 'reviewing')
  const approvedCandidates = candidates.filter(c => c.status === 'approved')

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <PageTitle>Event Ingestion</PageTitle>
        <p className="text-gray-500 mt-2">
          Pipeline for ingesting real-world events from external sources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sources Card */}
        <Link href="/admin/event-ingestion/sources" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Sources</h2>
              <Badge variant="secondary">{sources.length} total</Badge>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Raw inputs from news, official documents, and manual entries
            </p>
            <div className="flex gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingSources.length} pending
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {processedSources.length} processed
              </Badge>
            </div>
          </div>
        </Link>

        {/* Candidates Card */}
        <Link href="/admin/event-ingestion/candidates" className="block">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Candidates</h2>
              <Badge variant="secondary">{candidates.length} total</Badge>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Draft events awaiting review and approval
            </p>
            <div className="flex gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingCandidates.length} pending
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {approvedCandidates.length} approved
              </Badge>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <Link
            href="/admin/event-ingestion/sources/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Source
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Sources</h3>
        {sources.length === 0 ? (
          <p className="text-gray-500 text-sm">No sources yet</p>
        ) : (
          <div className="space-y-2">
            {sources.slice(0, 5).map((source) => (
              <Link
                key={source.id}
                href={`/admin/event-ingestion/sources/${source.id}`}
                className="block"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-sm">
                        {source.title || source.url || 'Untitled'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {source.sourceType}
                      </span>
                    </div>
                    <Badge
                      className={
                        source.processingStatus === 'processed'
                          ? 'bg-green-100 text-green-800'
                          : source.processingStatus === 'discarded'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {source.processingStatus}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
