import { getEntities } from '@/lib/actions/provision-drafts'
import { PageTitle } from '@/components/custom-ui/typography'
import { NewDraftForm } from '@/components/admin/provision-ingestion/new-draft-form'
import Link from 'next/link'

export default async function NewProvisionDraftPage() {
  const entities = await getEntities()

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link
        href="/admin/provision-ingestion"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to drafts
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <PageTitle>New Provision Draft</PageTitle>
        <p className="text-gray-500 mb-6">
          Describe the provision you want to research. The AI will help classify
          and gather information about it.
        </p>

        <NewDraftForm entities={entities} />
      </div>
    </div>
  )
}
