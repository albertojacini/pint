export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getDrafts } from '@/lib/actions/provision-drafts'
import { PageTitle } from '@/components/custom-ui/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  input: 'bg-gray-100 text-gray-800',
  prompt_generated: 'bg-blue-100 text-blue-800',
  researching: 'bg-yellow-100 text-yellow-800',
  research_complete: 'bg-purple-100 text-purple-800',
  generating_draft: 'bg-orange-100 text-orange-800',
  review: 'bg-green-100 text-green-800',
  completed: 'bg-green-200 text-green-900',
  failed: 'bg-red-100 text-red-800',
}

const typeColors: Record<string, string> = {
  ownership: 'bg-indigo-100 text-indigo-800',
  contract: 'bg-cyan-100 text-cyan-800',
  regulation: 'bg-orange-100 text-orange-800',
  taxation: 'bg-emerald-100 text-emerald-800',
  allocation: 'bg-pink-100 text-pink-800',
  designation: 'bg-violet-100 text-violet-800',
}

export default async function ProvisionIngestionPage() {
  const drafts = await getDrafts()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <PageTitle>Provision Ingestion</PageTitle>
        <Link href="/admin/provision-ingestion/new">
          <Button>+ New Draft</Button>
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No drafts yet</p>
          <Link href="/admin/provision-ingestion/new">
            <Button>Create your first draft</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/admin/provision-ingestion/${draft.id}`}
              className="block"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {draft.title || draft.inputDescription}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {draft.entityName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {draft.provisionType && (
                      <Badge className={typeColors[draft.provisionType]}>
                        {draft.provisionType}
                      </Badge>
                    )}
                    <Badge className={statusColors[draft.jobStatus] || 'bg-gray-100 text-gray-800'}>
                      {draft.jobStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Created {new Date(draft.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
