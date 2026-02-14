export const dynamic = 'force-dynamic'

import { getEntities } from '@/lib/actions/provision-drafts'
import { PageHeader } from '@/components/custom-ui/section'
import { NewDraftForm } from '@/components/admin/provision-ingestion/new-draft-form'
import Link from 'next/link'

export default async function NewProvisionDraftPage() {
  const entities = await getEntities()

  return (
    <div>
      <Link
        href="/admin/provision-ingestion"
        className="text-link hover:underline text-sm mb-4 inline-block"
      >
        ← Back to drafts
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <PageHeader
          title="New Provision Draft"
          description="Describe the provision you want to research. The AI will help classify and gather information about it."
          className="mb-6"
        />

        <NewDraftForm entities={entities} />
      </div>
    </div>
  )
}
