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

type IndicatorLevel = 'good' | 'moderate' | 'concerning' | null

function getIndicatorColor(level: IndicatorLevel): string | null {
  switch (level) {
    case 'good': return 'bg-green-500'
    case 'moderate': return 'bg-yellow-500'
    case 'concerning': return 'bg-red-500'
    default: return null
  }
}

function getPopulationLevel(population: number): IndicatorLevel {
  if (population >= 1000000) return 'good' // large city
  if (population >= 100000) return 'moderate' // medium city
  return 'concerning' // small
}

function getAreaLevel(area: number): IndicatorLevel {
  if (area >= 500) return 'good' // large
  if (area >= 100) return 'moderate' // medium
  return 'concerning' // small
}

function getDensityLevel(density: number): IndicatorLevel {
  if (density >= 2000 && density <= 10000) return 'good'
  if ((density >= 1000 && density < 2000) || (density > 10000 && density <= 15000)) return 'moderate'
  return 'concerning'
}

function getGdpLevel(gdp: number): IndicatorLevel {
  if (gdp > 40000) return 'good'
  if (gdp >= 20000) return 'moderate'
  return 'concerning'
}

function getUnemploymentLevel(rate: number): IndicatorLevel {
  if (rate < 5) return 'good'
  if (rate <= 8) return 'moderate'
  return 'concerning'
}

function getPovertyLevel(rate: number): IndicatorLevel {
  if (rate < 10) return 'good'
  if (rate <= 15) return 'moderate'
  return 'concerning'
}

function Indicator({ level }: { level: IndicatorLevel }) {
  const color = getIndicatorColor(level)
  if (!color) return null
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

export function EssentialStats({ population, stats }: EssentialStatsProps) {
  if (!population && !stats) return null

  return (
    <div className="py-3 mb-6">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {population && (
          <div className="flex items-center gap-2">
            <Indicator level={getPopulationLevel(population)} />
            <span className="text-gray-500">Population:</span>
            <span className="font-semibold">{population.toLocaleString()}</span>
          </div>
        )}
        {stats?.area && (
          <div className="flex items-center gap-2">
            <Indicator level={getAreaLevel(stats.area)} />
            <span className="text-gray-500">Area:</span>
            <span className="font-semibold">{stats.area.toLocaleString()} km²</span>
          </div>
        )}
        {stats?.density && (
          <div className="flex items-center gap-2">
            <Indicator level={getDensityLevel(stats.density)} />
            <span className="text-gray-500">Density:</span>
            <span className="font-semibold">{stats.density.toLocaleString()}/km²</span>
          </div>
        )}
        {stats?.gdpPerCapita && (
          <div className="flex items-center gap-2">
            <Indicator level={getGdpLevel(stats.gdpPerCapita)} />
            <span className="text-gray-500">GDP per capita:</span>
            <span className="font-semibold">${stats.gdpPerCapita.toLocaleString()}</span>
          </div>
        )}
        {stats?.unemploymentRate != null && (
          <div className="flex items-center gap-2">
            <Indicator level={getUnemploymentLevel(stats.unemploymentRate)} />
            <span className="text-gray-500">Unemployment:</span>
            <span className="font-semibold">{stats.unemploymentRate}%</span>
          </div>
        )}
        {stats?.povertyRate != null && (
          <div className="flex items-center gap-2">
            <Indicator level={getPovertyLevel(stats.povertyRate)} />
            <span className="text-gray-500">Poverty rate:</span>
            <span className="font-semibold">{stats.povertyRate}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
