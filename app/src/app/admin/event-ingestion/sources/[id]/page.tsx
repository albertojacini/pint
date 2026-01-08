import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSource } from '@/lib/actions/event-ingestion'
import { PageTitle } from '@/components/custom-ui/typography'
import { Badge } from '@/components/ui/badge'
import { SourceWorkflow } from '@/components/admin/event-ingestion/source-workflow'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SourceDetailPage({ params }: Props) {
  const { id } = await params
  const source = await getSource(id)

  if (!source) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link
        href="/admin/event-ingestion/sources"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to sources
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <PageTitle>{source.title || source.url || 'Untitled Source'}</PageTitle>
            <div className="flex gap-2">
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
          {source.sourceName && (
            <p className="text-gray-500 text-sm mt-1">{source.sourceName}</p>
          )}
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mt-1 block truncate"
            >
              {source.url}
            </a>
          )}
        </div>

        <SourceWorkflow source={source} />
      </div>
    </div>
  )
}
