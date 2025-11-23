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
  if (population >= 1000000) return 'good'
  if (population >= 100000) return 'moderate'
  return 'concerning'
}

function getAreaLevel(area: number): IndicatorLevel {
  if (area >= 500) return 'good'
  if (area >= 100) return 'moderate'
  return 'concerning'
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

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

function Indicator({ level }: { level: IndicatorLevel }) {
  const color = getIndicatorColor(level)
  if (!color) return null
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
}

function Stat({ icon, label, value, level }: { icon: string; label: string; value: string; level: IndicatorLevel }) {
  return (
    <div className="flex items-center gap-1.5">
      <Indicator level={level} />
      <span className="md:hidden">{icon}</span>
      <span className="hidden md:inline text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function EssentialStats({ population, stats }: EssentialStatsProps) {
  if (!population && !stats) return null

  return (
    <div className="py-3 mb-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {population && (
          <Stat icon="👥" label="Population" value={formatCompact(population)} level={getPopulationLevel(population)} />
        )}
        {stats?.area && (
          <Stat icon="📐" label="Area" value={`${formatCompact(stats.area)}km²`} level={getAreaLevel(stats.area)} />
        )}
        {stats?.density && (
          <Stat icon="🏘️" label="Density" value={`${formatCompact(stats.density)}/km²`} level={getDensityLevel(stats.density)} />
        )}
        {stats?.gdpPerCapita && (
          <Stat icon="💰" label="GDP/capita" value={`$${formatCompact(stats.gdpPerCapita)}`} level={getGdpLevel(stats.gdpPerCapita)} />
        )}
        {stats?.unemploymentRate != null && (
          <Stat icon="📉" label="Unemployment" value={`${stats.unemploymentRate}%`} level={getUnemploymentLevel(stats.unemploymentRate)} />
        )}
        {stats?.povertyRate != null && (
          <Stat icon="🏚️" label="Poverty" value={`${stats.povertyRate}%`} level={getPovertyLevel(stats.povertyRate)} />
        )}
      </div>
    </div>
  )
}
