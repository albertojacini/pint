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

type Trend = 'up' | 'down' | 'stable'

// Benchmarks: [min, max] for computing bar fill percentage
const BENCHMARKS = {
  population: [10_000, 10_000_000],
  area: [10, 1000],
  density: [100, 20_000],
  gdpPerCapita: [5_000, 80_000],
  unemploymentRate: [0, 15],
  povertyRate: [0, 25],
} as const

// Mock trends (until real historical data exists)
const MOCK_TRENDS: Record<string, Trend> = {
  population: 'up',
  area: 'stable',
  density: 'up',
  gdpPerCapita: 'up',
  unemploymentRate: 'down',
  povertyRate: 'down',
}

function getBarPercent(value: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, value))
  return ((clamped - min) / (max - min)) * 100
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

function MiniBar({ percent }: { percent: number }) {
  return (
    <div className="w-2 h-4 border border-gray-300 overflow-hidden flex flex-col justify-end">
      <div className="bg-gray-300 w-full transition-all" style={{ height: `${percent}%` }} />
    </div>
  )
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === 'up') {
    return (
      <svg className="w-3 h-3 text-green-500" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 2L10 8H2L6 2Z" />
      </svg>
    )
  }
  if (trend === 'down') {
    return (
      <svg className="w-3 h-3 text-red-500" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 10L2 4H10L6 10Z" />
      </svg>
    )
  }
  return (
    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="5" width="8" height="2" />
    </svg>
  )
}

function Stat({
  icon,
  label,
  value,
  barPercent,
  trend,
}: {
  icon: string
  label: string
  value: string
  barPercent: number
  trend: Trend
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="md:hidden">{icon}</span>
      <span className="hidden md:inline text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
      <MiniBar percent={barPercent} />
      <TrendArrow trend={trend} />
    </div>
  )
}

export function EssentialStats({ population, stats }: EssentialStatsProps) {
  if (!population && !stats) return null

  return (
    <div className="py-3 mb-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {population && (
          <Stat
            icon="👥"
            label="Population"
            value={formatCompact(population)}
            barPercent={getBarPercent(population, ...BENCHMARKS.population)}
            trend={MOCK_TRENDS.population}
          />
        )}
        {stats?.area && (
          <Stat
            icon="📐"
            label="Area"
            value={`${formatCompact(stats.area)}km²`}
            barPercent={getBarPercent(stats.area, ...BENCHMARKS.area)}
            trend={MOCK_TRENDS.area}
          />
        )}
        {stats?.density && (
          <Stat
            icon="🏘️"
            label="Density"
            value={`${formatCompact(stats.density)}/km²`}
            barPercent={getBarPercent(stats.density, ...BENCHMARKS.density)}
            trend={MOCK_TRENDS.density}
          />
        )}
        {stats?.gdpPerCapita && (
          <Stat
            icon="💰"
            label="GDP/capita"
            value={`$${formatCompact(stats.gdpPerCapita)}`}
            barPercent={getBarPercent(stats.gdpPerCapita, ...BENCHMARKS.gdpPerCapita)}
            trend={MOCK_TRENDS.gdpPerCapita}
          />
        )}
        {stats?.unemploymentRate != null && (
          <Stat
            icon="📉"
            label="Unemployment"
            value={`${stats.unemploymentRate}%`}
            barPercent={getBarPercent(stats.unemploymentRate, ...BENCHMARKS.unemploymentRate)}
            trend={MOCK_TRENDS.unemploymentRate}
          />
        )}
        {stats?.povertyRate != null && (
          <Stat
            icon="🏚️"
            label="Poverty"
            value={`${stats.povertyRate}%`}
            barPercent={getBarPercent(stats.povertyRate, ...BENCHMARKS.povertyRate)}
            trend={MOCK_TRENDS.povertyRate}
          />
        )}
      </div>
    </div>
  )
}
