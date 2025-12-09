import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'

interface EntityHeaderProps {
  entity: {
    name: string
    type: string
    avatarUrl: string | null
  }
}

export function EntityHeader({ entity }: EntityHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {entity.avatarUrl ? (
            <img
              src={entity.avatarUrl}
              alt={entity.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-400">
                {entity.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Entity Name */}
        <h1 className="text-4xl font-bold">{entity.name}</h1>
      </div>

      {/* Entity Type Badge */}
      <div className="ml-16">
        <EntityClassificationBadge type={entity.type as any} />
      </div>
    </div>
  )
}
