import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSource } from '@/lib/actions/event-ingestion'
import { PageHeader } from '@/components/custom-ui/section'
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
    <div>
      <Link
        href="/admin/event-ingestion/sources"
        className="text-link hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to sources
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <PageHeader
          title={source.title || source.url || 'Untitled Source'}
          description={source.sourceName}
          action={
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
          }
          className="mb-6"
        >
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline text-sm mt-1 block truncate"
            >
              {source.url}
            </a>
          )}
        </PageHeader>

        <SourceWorkflow source={source} />
      </div>
    </div>
  )
}
