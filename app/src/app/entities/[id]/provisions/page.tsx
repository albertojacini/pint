import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { db } from '@/lib/db/client'
import { politicalEntities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface ProvisionsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProvisionsPage({ params }: ProvisionsPageProps) {
  const { id } = await params

  // Fetch the entity to verify it exists
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, id))

  if (!entity) {
    notFound()
  }

  // Fetch provisions for this entity
  const provisions = await getProvisionsByEntity(id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/entities/${id}`} className="text-blue-600 hover:underline">
          ← Back to {entity.name}
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Provisions</h1>
        <p className="text-gray-600">
          All provisions for {entity.name}
        </p>
      </div>

      {/* Provisions Section */}
      {provisions.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {(() => {
            // Helper function to get type color and category
            const getTypeConfig = (type: string) => {
              const configs: Record<string, { category: string; color: string; bgColor: string }> = {
                // Legal & Regulatory
                'regulation': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                'ordinance': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                'standard': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                'law': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                'decree': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                'code': { category: 'Legal & Regulatory', color: 'text-blue-700', bgColor: 'bg-blue-100' },

                // Institutional & Services
                'utility': { category: 'Institutional & Services', color: 'text-purple-700', bgColor: 'bg-purple-100' },
                'institution': { category: 'Institutional & Services', color: 'text-purple-700', bgColor: 'bg-purple-100' },
                'agency': { category: 'Institutional & Services', color: 'text-purple-700', bgColor: 'bg-purple-100' },
                'program': { category: 'Institutional & Services', color: 'text-purple-700', bgColor: 'bg-purple-100' },
                'fund': { category: 'Institutional & Services', color: 'text-purple-700', bgColor: 'bg-purple-100' },

                // Planning
                'plan': { category: 'Planning', color: 'text-green-700', bgColor: 'bg-green-100' },
                'zone': { category: 'Planning', color: 'text-green-700', bgColor: 'bg-green-100' },
                'project': { category: 'Planning', color: 'text-green-700', bgColor: 'bg-green-100' },
                'guideline': { category: 'Planning', color: 'text-green-700', bgColor: 'bg-green-100' },

                // Fiscal
                'tax': { category: 'Fiscal', color: 'text-orange-700', bgColor: 'bg-orange-100' },
                'fee': { category: 'Fiscal', color: 'text-orange-700', bgColor: 'bg-orange-100' },
                'budget': { category: 'Fiscal', color: 'text-orange-700', bgColor: 'bg-orange-100' },
                'subsidy': { category: 'Fiscal', color: 'text-orange-700', bgColor: 'bg-orange-100' },
                'tariff': { category: 'Fiscal', color: 'text-orange-700', bgColor: 'bg-orange-100' },

                // Administrative
                'procedure': { category: 'Administrative', color: 'text-gray-700', bgColor: 'bg-gray-100' },
                'agreement': { category: 'Administrative', color: 'text-gray-700', bgColor: 'bg-gray-100' },
                'delegation': { category: 'Administrative', color: 'text-gray-700', bgColor: 'bg-gray-100' },
                'protocol': { category: 'Administrative', color: 'text-gray-700', bgColor: 'bg-gray-100' },
                'policy': { category: 'Administrative', color: 'text-gray-700', bgColor: 'bg-gray-100' },
              }
              return configs[type] || { category: 'Other', color: 'text-gray-700', bgColor: 'bg-gray-100' }
            }

            // Helper function to get status color
            const getStatusColor = (status: string) => {
              const colors: Record<string, string> = {
                'active': 'bg-green-500',
                'repealed': 'bg-red-500',
                'suspended': 'bg-yellow-500',
              }
              return colors[status] || 'bg-gray-500'
            }

            // Group provisions by category
            const groupedProvisions = provisions.reduce((acc, provision) => {
              const config = getTypeConfig(provision.type)
              if (!acc[config.category]) {
                acc[config.category] = []
              }
              acc[config.category].push(provision)
              return acc
            }, {} as Record<string, typeof provisions>)

            // Define category order
            const categoryOrder = [
              'Legal & Regulatory',
              'Institutional & Services',
              'Planning',
              'Fiscal',
              'Administrative',
              'Other'
            ]

            return categoryOrder.map(category => {
              const categoryProvisions = groupedProvisions[category]
              if (!categoryProvisions || categoryProvisions.length === 0) return null

              return (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">{category}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryProvisions.map((provision) => {
                      const typeConfig = getTypeConfig(provision.type)
                      const startYear = provision.effectiveFrom ? new Date(provision.effectiveFrom).getFullYear() : null

                      return (
                        <div key={provision.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          {/* Row 1: Status dot, year, type badge */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(provision.status)}`}
                                title={provision.status}
                              />
                              {startYear && (
                                <span className="text-sm font-semibold text-gray-600">{startYear}</span>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                                {provision.type}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Title */}
                          <h4 className="text-base font-semibold text-gray-900 mb-2">
                            {provision.title}
                          </h4>

                          {/* Row 3: Description */}
                          {provision.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                              {provision.description}
                            </p>
                          )}

                          {/* Row 4: Type-specific indicators */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex gap-4">
                              {/* Fake indicator 1 */}
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-medium text-gray-700">
                                  {Math.floor(Math.random() * 40) + 60}% completion
                                </span>
                              </div>
                              {/* Fake indicator 2 */}
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-medium text-gray-700">
                                  {Math.floor(Math.random() * 50) + 50}k beneficiaries
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Linked idea reference */}
                          {provision.ideaTitle && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                Inspired by:{' '}
                                <Link href={`/ideas/${provision.ideaId}`} className="text-blue-600 hover:underline font-medium">
                                  {provision.ideaTitle}
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 text-center">No provisions found for this entity.</p>
        </div>
      )}
    </div>
  )
}
