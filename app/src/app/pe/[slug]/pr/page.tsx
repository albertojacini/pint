import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { db } from '@/lib/db/client'
import { politicalEntities } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'

interface ProvisionsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProvisionsPage({ params }: ProvisionsPageProps) {
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity to verify it exists
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(idStartsWith(politicalEntities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch provisions for this entity
  const provisions = await getProvisionsByEntity(entity.id)

  // Calculate stats
  const stats = {
    total: provisions.length,
    active: provisions.filter(p => p.status === 'active').length,
    inactive: provisions.filter(p => p.status !== 'active').length,
    byType: {
      ownership: provisions.filter(p => p.types.some(t => t.code === 'ownership')).length,
      contract: provisions.filter(p => p.types.some(t => t.code === 'contract')).length,
      regulation: provisions.filter(p => p.types.some(t => t.code === 'regulation')).length,
      taxation: provisions.filter(p => p.types.some(t => t.code === 'taxation')).length,
      allocation: provisions.filter(p => p.types.some(t => t.code === 'allocation')).length,
      designation: provisions.filter(p => p.types.some(t => t.code === 'designation')).length,
      infrastructure: provisions.filter(p => p.types.some(t => t.code === 'infrastructure')).length,
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href={entityPath(entity)} className="text-blue-600 hover:underline">
          ← Back to {entity.name}
        </Link>
      </div>

      {/* Page header with CTA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Provisions Overview</h1>
          <p className="text-gray-600">
            Summary of all provisions for {entity.name}
          </p>
        </div>
        <Link href={`${entityPath(entity)}/pr/browse`}>
          <Button size="lg">Browse All Provisions →</Button>
        </Link>
      </div>

      {/* Simple stats grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Total Provisions</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-1">Inactive</div>
          <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">By Type</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(stats.byType)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => (
              <div key={type} className="border border-gray-200 rounded p-4">
                <div className="text-sm text-gray-500 capitalize mb-1">{type}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
        </div>
        {Object.values(stats.byType).every(count => count === 0) && (
          <p className="text-gray-500 text-center py-4">No provisions available</p>
        )}
      </div>

      {/* Placeholder for future analytics */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">More detailed analytics coming soon...</p>
      </div>
    </div>
  )
}
