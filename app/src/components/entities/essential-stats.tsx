interface EssentialStatsProps {
  population: number | null
  stats: {
    area?: number
    density?: number
    gdpPerCapita?: number
    timezone?: string
    languages?: string[]
    elevation?: number
    founded?: string
  } | null
}

export function EssentialStats({ population, stats }: EssentialStatsProps) {
  if (!population && !stats) return null

  return (
    <div className="py-3 mb-6">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {population && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Population:</span>
            <span className="font-semibold">{population.toLocaleString()}</span>
          </div>
        )}
        {stats?.area && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Area:</span>
            <span className="font-semibold">{stats.area.toLocaleString()} km²</span>
          </div>
        )}
        {stats?.density && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Density:</span>
            <span className="font-semibold">{stats.density.toLocaleString()}/km²</span>
          </div>
        )}
        {stats?.gdpPerCapita && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">GDP per capita:</span>
            <span className="font-semibold">${stats.gdpPerCapita.toLocaleString()}</span>
          </div>
        )}
        {stats?.timezone && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Timezone:</span>
            <span className="font-semibold">{stats.timezone}</span>
          </div>
        )}
        {stats?.languages && stats.languages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Languages:</span>
            <span className="font-semibold">{stats.languages.join(', ')}</span>
          </div>
        )}
        {stats?.elevation && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Elevation:</span>
            <span className="font-semibold">{stats.elevation}m</span>
          </div>
        )}
        {stats?.founded && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Founded:</span>
            <span className="font-semibold">{stats.founded}</span>
          </div>
        )}
      </div>
    </div>
  )
}
