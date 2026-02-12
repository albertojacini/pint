export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getSources } from '@/lib/actions/event-ingestion'
import { PageHeader } from '@/components/custom-ui/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const processingStatusColors: Record<string, string> = {
  unprocessed: 'bg-gray-100 text-gray-800',
  processing: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-green-100 text-green-800',
  discarded: 'bg-red-100 text-red-800',
}

const fetchStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  fetching: 'bg-blue-100 text-blue-800',
  fetched: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const sourceTypeColors: Record<string, string> = {
  news: 'bg-purple-100 text-purple-800',
  official_gazette: 'bg-blue-100 text-blue-800',
  press_release: 'bg-cyan-100 text-cyan-800',
  council_minutes: 'bg-indigo-100 text-indigo-800',
  social: 'bg-pink-100 text-pink-800',
  manual: 'bg-orange-100 text-orange-800',
}

export default async function SourcesPage() {
  const sources = await getSources()

  return (
    <div className="py-8">
      <Link
        href="/admin/event-ingestion"
        className="text-link hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to Event Ingestion
      </Link>

      <PageHeader
        title="Sources"
        action={
          <Link href="/admin/event-ingestion/sources/new">
            <Button>+ Add Source</Button>
          </Link>
        }
      />

      {sources.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No sources yet</p>
          <Link href="/admin/event-ingestion/sources/new">
            <Button>Add your first source</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => (
            <Link
              key={source.id}
              href={`/admin/event-ingestion/sources/${source.id}`}
              className="block"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {source.title || source.url || 'Untitled source'}
                    </h3>
                    {source.sourceName && (
                      <p className="text-sm text-gray-500 mt-1">
                        {source.sourceName}
                      </p>
                    )}
                    {source.aiSummary && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {source.aiSummary}
                      </p>
                    )}
                    {source.aiExtractedData?.topics && source.aiExtractedData.topics.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {source.aiExtractedData.topics.map((topic: string) => (
                          <span
                            key={topic}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Badge className={sourceTypeColors[source.sourceType] || 'bg-gray-100 text-gray-800'}>
                      {source.sourceType.replace('_', ' ')}
                    </Badge>
                    <Badge className={processingStatusColors[source.processingStatus]}>
                      {source.processingStatus}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                  <span>
                    {source.publishedAt
                      ? `Published ${new Date(source.publishedAt).toLocaleDateString()}`
                      : `Added ${new Date(source.createdAt).toLocaleDateString()}`}
                  </span>
                  {source.fetchStatus !== 'fetched' && (
                    <Badge className={fetchStatusColors[source.fetchStatus]}>
                      fetch: {source.fetchStatus}
                    </Badge>
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
