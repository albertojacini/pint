import Link from 'next/link'
import { entityPath } from '@/lib/utils'
import type { GroupedRelationships } from '@/lib/actions/entity-relationships'

interface RelatedEntitiesSectionProps {
  relationships: GroupedRelationships
}

// Priority order for relationship types (higher priority = shown first)
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'parent country': 100,
  'parent region': 90,
  'parent city': 80,
  'parent district': 70,
  'contains': 60,
  'member of': 50,
  'has member': 40,
  'sister city': 30,
  'partner': 20,
}

export function RelatedEntitiesSection({ relationships }: RelatedEntitiesSectionProps) {
  // Flatten all relationships into a single sorted list
  const allRelationships = Object.entries(relationships).flatMap(([type, entities]) =>
    entities.map(entity => ({ ...entity, relationshipType: type }))
  )

  if (allRelationships.length === 0) {
    return null
  }

  // Sort by priority (higher first), then alphabetically by name
  const sortedRelationships = allRelationships.sort((a, b) => {
    const priorityA = RELATIONSHIP_PRIORITY[a.relationshipType] ?? 0
    const priorityB = RELATIONSHIP_PRIORITY[b.relationshipType] ?? 0
    if (priorityA !== priorityB) return priorityB - priorityA
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="text-sm text-gray-600 mb-6">
      <span className="text-gray-500">Related: </span>
      {sortedRelationships.map((entity, index) => (
        <span key={entity.id}>
          <Link
            href={entityPath(entity)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {entity.name}
          </Link>
          {index < sortedRelationships.length - 1 && (
            <span className="text-gray-400"> · </span>
          )}
        </span>
      ))}
    </div>
  )
}
