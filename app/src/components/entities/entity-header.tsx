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
    <div className="flex items-center gap-6 mb-6">
      {/* Avatar / Coat of Arms */}
      <div className="flex-shrink-0">
        {entity.identityData?.coatOfArmsUrl ? (
          <img
            src={entity.identityData.coatOfArmsUrl}
            alt={`${entity.name} coat of arms`}
            className="w-24 h-24 object-contain"
          />
        ) : entity.avatarUrl ? (
          <img
            src={entity.avatarUrl}
            alt={entity.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-400">
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
