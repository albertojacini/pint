interface EssentialStatsProps {
  population: number | null
  stats: {
    area?: number
    density?: number
    gdpPerCapita?: number
    unemploymentRate?: number
    povertyRate?: number
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
        {stats?.unemploymentRate != null && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Unemployment:</span>
            <span className="font-semibold">{stats.unemploymentRate}%</span>
          </div>
        )}
        {stats?.povertyRate != null && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Poverty rate:</span>
            <span className="font-semibold">{stats.povertyRate}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
