import { notFound } from 'next/navigation'
import { getDraft } from '@/lib/actions/provision-drafts'
import { PageHeader } from '@/components/custom-ui/section'
import { DraftWorkflow } from '@/components/admin/provision-ingestion/draft-workflow'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DraftPage({ params }: Props) {
  const { id } = await params
  const draft = await getDraft(id)

  if (!draft) {
    notFound()
  }

  return (
    <div className="py-8">
      <Link
        href="/admin/provision-ingestion"
        className="text-link hover:underline text-sm mb-4 inline-block"
      >
        ← Back to drafts
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <PageHeader
          title={draft.title || draft.inputDescription}
          description={draft.entityName}
          className="mb-6"
        />

        <DraftWorkflow draft={draft} />
      </div>
    </div>
  )
}
