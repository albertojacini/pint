export const dynamic = 'force-dynamic'

import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/custom-ui/section'
import { NewSourceForm } from '@/components/admin/event-ingestion/new-source-form'

export default async function NewSourcePage() {
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
          title="Add Source"
          description="Add a new source to the event ingestion pipeline. You can either provide a URL to fetch, or paste content directly."
          className="mb-6"
        />

        <NewSourceForm />
      </div>
    </div>
  )
}
