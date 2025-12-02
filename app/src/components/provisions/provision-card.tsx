import Link from 'next/link'

interface ProvisionCardProps {
  provision: {
    id: string
    title: string
    description: string | null
    type: string
    status: string
    effectiveFrom: string | null
    ideaId: string | null
    ideaTitle: string | null
  }
}

// Helper function to get type color
const getTypeColor = (type: string) => {
  const colors: Record<string, { color: string; bgColor: string }> = {
    'ownership': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
    'contract': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'regulation': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'taxation': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
    'allocation': { color: 'text-green-700', bgColor: 'bg-green-100' },
    'designation': { color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  }
  return colors[type] || { color: 'text-gray-700', bgColor: 'bg-gray-100' }
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

export function ProvisionCard({ provision }: ProvisionCardProps) {
  const typeConfig = getTypeColor(provision.type)
  const startYear = provision.effectiveFrom ? new Date(provision.effectiveFrom).getFullYear() : null

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white">
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

      {/* Linked idea reference */}
      {provision.ideaTitle && provision.ideaId && (
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
}
