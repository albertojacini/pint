import { RelatedEntityCard } from './related-entity-card'
import type { GroupedRelationships } from '@/lib/actions/entity-relationships'

interface RelatedEntitiesSectionProps {
  relationships: GroupedRelationships
}

// Display order for relationship types
const RELATIONSHIP_ORDER = [
  'parent country',
  'parent region',
  'parent city',
  'parent district',
  'contains',
  'part of',
  'member of',
  'has member',
  'partner',
  'sister city',
  'successor of',
  'predecessor of',
]

// Display configuration for relationship types
const RELATIONSHIP_TYPE_CONFIGS: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  // Hierarchical (upward)
  'parent country': { label: 'Part of Country', icon: '🏳️', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'parent region': { label: 'Part of Region', icon: '🗺️', color: 'text-green-700', bgColor: 'bg-green-100' },
  'parent city': { label: 'Part of City', icon: '🏙️', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'parent district': { label: 'Part of District', icon: '📍', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  // Hierarchical (downward)
  'contains': { label: 'Contains', icon: '📦', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  'part of': { label: 'Part of', icon: '🔗', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  // Partnerships
  'partner': { label: 'Partner', icon: '🤝', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  'sister city': { label: 'Sister City', icon: '🌐', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  // Membership
  'member of': { label: 'Member Of', icon: '👥', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  'has member': { label: 'Has Member', icon: '👤', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  // Historical
  'successor of': { label: 'Successor Of', icon: '⏩', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'predecessor of': { label: 'Predecessor Of', icon: '⏪', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

function getRelationshipTypeConfig(type: string) {
  return RELATIONSHIP_TYPE_CONFIGS[type] || { label: type, icon: '🔗', color: 'text-gray-700', bgColor: 'bg-gray-100' }
}

export function RelatedEntitiesSection({ relationships }: RelatedEntitiesSectionProps) {
  const relationshipTypes = Object.keys(relationships)

  if (relationshipTypes.length === 0) {
    return null
  }

  // Sort relationship types by defined order, unknown types at end
  const sortedTypes = relationshipTypes.sort((a, b) => {
    const indexA = RELATIONSHIP_ORDER.indexOf(a)
    const indexB = RELATIONSHIP_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <div className="bg-white p-8 mb-6">
      <h2 className="text-2xl font-bold mb-6">Related Entities</h2>

      <div className="space-y-6">
        {sortedTypes.map((type) => {
          const config = getRelationshipTypeConfig(type)
          const entities = relationships[type]

          return (
            <div key={type}>
              {/* Relationship Type Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-sm text-gray-500">
                  ({entities.length})
                </span>
              </div>

              {/* Entity Cards Grid */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {entities.map((entity) => (
                  <RelatedEntityCard key={entity.id} entity={entity} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
