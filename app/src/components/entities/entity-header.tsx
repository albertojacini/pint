interface EntityHeaderProps {
  entity: {
    name: string
    avatarUrl: string | null
    identityData: {
      coatOfArmsUrl?: string
    } | null
  }
}

export function EntityHeader({ entity }: EntityHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar / Coat of Arms */}
      <div className="flex-shrink-0">
        {entity.identityData?.coatOfArmsUrl ? (
          <img
            src={entity.identityData.coatOfArmsUrl}
            alt={`${entity.name} coat of arms`}
            className="w-12 h-12 object-contain"
          />
        ) : entity.avatarUrl ? (
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
  )
}
