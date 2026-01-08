export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { PageTitle } from '@/components/custom-ui/typography'
import { NewSourceForm } from '@/components/admin/event-ingestion/new-source-form'

export default async function NewSourcePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link
        href="/admin/event-ingestion/sources"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to sources
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <PageTitle>Add Source</PageTitle>
        <p className="text-gray-500 mb-6">
          Add a new source to the event ingestion pipeline. You can either provide a URL
          to fetch, or paste content directly.
        </p>

        <NewSourceForm />
      </div>
    </div>
  )
}
