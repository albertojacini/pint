import { notFound } from 'next/navigation'
import { getDraft } from '@/lib/actions/provision-drafts'
import { PageTitle } from '@/components/custom-ui/typography'
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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link
        href="/admin/provision-ingestion"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to drafts
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-6">
          <PageTitle>{draft.title || draft.inputDescription}</PageTitle>
          <p className="text-gray-500 text-sm mt-1">{draft.entityName}</p>
        </div>

        <DraftWorkflow draft={draft} />
      </div>
    </div>
  )
}
