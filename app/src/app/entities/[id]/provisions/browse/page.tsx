import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFilteredProvisions } from '@/lib/actions/provisions'
import { db } from '@/lib/db/client'
import { politicalEntities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProvisionCard } from '@/components/provisions/provision-card'
import { ProvisionsFilterBar } from '@/components/provisions/provisions-filter-bar'

interface BrowseProvisionsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    search?: string
    type?: string
    status?: string
    sort?: string
  }>
}

export default async function BrowseProvisionsPage({
  params,
  searchParams,
}: BrowseProvisionsPageProps) {
  const { id } = await params
  const filters = await searchParams

  // Fetch the entity to verify it exists
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, id))

  if (!entity) {
    notFound()
  }

  // Fetch filtered provisions
  const provisions = await getFilteredProvisions(id, {
    search: filters.search,
    type: filters.type,
    status: filters.status,
    sort: filters.sort || 'date-desc',
  })

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/entities/${id}/provisions`} className="text-blue-600 hover:underline">
          ← Back to Provisions Overview
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Provisions</h1>
        <p className="text-gray-600">
          {entity.name} · {provisions.length} {provisions.length === 1 ? 'provision' : 'provisions'}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8">
        <ProvisionsFilterBar />
      </div>

      {/* Provisions grid */}
      {provisions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {provisions.map((provision) => (
            <ProvisionCard key={provision.id} provision={provision} entityId={id} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 text-center">No provisions found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
