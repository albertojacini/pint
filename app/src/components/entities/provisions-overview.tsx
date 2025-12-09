import Link from 'next/link'
import { entityPath } from '@/lib/utils'
import { ClassificationBadge } from '@/components/custom-ui/classification-badge'

interface Provision {
  id: string
  title: string
  descriptionShort: string | null
  type: string
  status: string
  effectiveFrom: string | null
}

interface ProvisionsOverviewProps {
  entity: { id: string; slug: string }
  provisions: Provision[]
}

// Helper function to get type color
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    // Legal & Regulatory
    'regulation': 'rgb(29 78 216)',      // blue-700
    'ordinance': 'rgb(29 78 216)',
    'standard': 'rgb(29 78 216)',
    'law': 'rgb(29 78 216)',
    'decree': 'rgb(29 78 216)',
    'code': 'rgb(29 78 216)',
    // Institutional & Services
    'utility': 'rgb(126 34 206)',        // purple-700
    'institution': 'rgb(126 34 206)',
    'agency': 'rgb(126 34 206)',
    'program': 'rgb(126 34 206)',
    'fund': 'rgb(126 34 206)',
    // Planning
    'plan': 'rgb(21 128 61)',            // green-700
    'zone': 'rgb(21 128 61)',
    'project': 'rgb(21 128 61)',
    'guideline': 'rgb(21 128 61)',
    // Fiscal
    'tax': 'rgb(194 65 12)',             // orange-700
    'fee': 'rgb(194 65 12)',
    'budget': 'rgb(194 65 12)',
    'subsidy': 'rgb(194 65 12)',
    'tariff': 'rgb(194 65 12)',
    // Administrative
    'procedure': 'rgb(55 65 81)',        // gray-700
    'agreement': 'rgb(55 65 81)',
    'delegation': 'rgb(55 65 81)',
    'protocol': 'rgb(55 65 81)',
    'policy': 'rgb(55 65 81)',
  }
  return colors[type] || 'rgb(55 65 81)'
}

// Helper function to get status color
function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'active': 'bg-green-500',
    'repealed': 'bg-red-500',
    'suspended': 'bg-yellow-500',
  }
  return colors[status] || 'bg-gray-500'
}

export function ProvisionsOverview({ entity, provisions }: ProvisionsOverviewProps) {
  if (provisions.length === 0) return null

  // Calculate stats
  const totalCount = provisions.length
  const activeCount = provisions.filter(p => p.status === 'active').length
  const repealedCount = provisions.filter(p => p.status === 'repealed').length
  const suspendedCount = provisions.filter(p => p.status === 'suspended').length

  // Get most recent 6 provisions
  const featuredProvisions = provisions.slice(0, 6)

  return (
    <div className="bg-white p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Provisions Overview</h2>
        <Link
          href={`${entityPath(entity)}/pr`}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View all
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-3xl font-bold text-gray-800 mb-1">{totalCount}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-3xl font-bold text-green-700 mb-1">{activeCount}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-3xl font-bold text-red-700 mb-1">{repealedCount}</div>
          <div className="text-sm text-red-600">Repealed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-700 mb-1">{suspendedCount}</div>
          <div className="text-sm text-yellow-600">Suspended</div>
        </div>
      </div>

      {/* Featured Provisions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Featured Provisions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {featuredProvisions.map((provision) => {
            const typeColor = getTypeColor(provision.type)
            const startYear = provision.effectiveFrom ? new Date(provision.effectiveFrom).getFullYear() : null

            return (
              <div key={provision.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                {/* Row 1: Status dot, year, type badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(provision.status)}`}
                      title={provision.status}
                    />
                    {startYear && (
                      <span className="text-xs font-semibold text-gray-600">{startYear}</span>
                    )}
                  </div>
                  <ClassificationBadge type={provision.type} color={typeColor} />
                </div>

                {/* Row 2: Title */}
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {provision.title}
                </h4>

                {/* Row 3: Description (truncated) */}
                {provision.descriptionShort && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {provision.descriptionShort}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
