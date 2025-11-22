import Link from 'next/link'

interface Provision {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  effectiveFrom: string | null
}

interface ProvisionsOverviewProps {
  entityId: string
  provisions: Provision[]
}

// Helper function to get type color
function getTypeConfig(type: string) {
  const configs: Record<string, { color: string; bgColor: string }> = {
    // Legal & Regulatory
    'regulation': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'ordinance': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'standard': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'law': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'decree': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'code': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    // Institutional & Services
    'utility': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    'institution': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    'agency': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    'program': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    'fund': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    // Planning
    'plan': { color: 'text-green-700', bgColor: 'bg-green-100' },
    'zone': { color: 'text-green-700', bgColor: 'bg-green-100' },
    'project': { color: 'text-green-700', bgColor: 'bg-green-100' },
    'guideline': { color: 'text-green-700', bgColor: 'bg-green-100' },
    // Fiscal
    'tax': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'fee': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'budget': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'subsidy': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'tariff': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    // Administrative
    'procedure': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'agreement': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'delegation': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'protocol': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'policy': { color: 'text-gray-700', bgColor: 'bg-gray-100' },
  }
  return configs[type] || { color: 'text-gray-700', bgColor: 'bg-gray-100' }
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

export function ProvisionsOverview({ entityId, provisions }: ProvisionsOverviewProps) {
  if (provisions.length === 0) return null

  // Calculate stats
  const totalCount = provisions.length
  const activeCount = provisions.filter(p => p.status === 'active').length
  const repealedCount = provisions.filter(p => p.status === 'repealed').length
  const suspendedCount = provisions.filter(p => p.status === 'suspended').length

  // Get most recent 6 provisions
  const featuredProvisions = provisions.slice(0, 6)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Provisions Overview</h2>
        <Link
          href={`/entities/${entityId}/provisions`}
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
            const typeConfig = getTypeConfig(provision.type)
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                    {provision.type}
                  </span>
                </div>

                {/* Row 2: Title */}
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {provision.title}
                </h4>

                {/* Row 3: Description (truncated) */}
                {provision.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {provision.description}
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
