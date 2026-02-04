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

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

interface StatItem {
  label: string
  value: string
}

function buildStatItems(population: number | null, stats: EssentialStatsProps['stats']): StatItem[] {
  const items: StatItem[] = []

  if (population) {
    items.push({
      label: 'Population',
      value: formatCompact(population),
    })
  }

  if (stats?.area) {
    items.push({
      label: 'Area',
      value: `${formatCompact(stats.area)}km²`,
    })
  }

  if (stats?.density) {
    items.push({
      label: 'Density',
      value: `${formatCompact(stats.density)}/km²`,
    })
  }

  if (stats?.gdpPerCapita) {
    items.push({
      label: 'GDP/capita',
      value: `€${formatCompact(stats.gdpPerCapita)}`,
    })
  }

  if (stats?.unemploymentRate != null) {
    items.push({
      label: 'Unemployment',
      value: `${stats.unemploymentRate}%`,
    })
  }

  if (stats?.povertyRate != null) {
    items.push({
      label: 'Poverty',
      value: `${stats.povertyRate}%`,
    })
  }

  return items
}

export function EssentialStats({ population, stats }: EssentialStatsProps) {
  if (!population && !stats) return null

  const items = buildStatItems(population, stats)
  if (items.length === 0) return null

  return (
    <div className="py-1 mb-3">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-[10px] text-gray-400">{item.label}</div>
            <div className="text-sm font-medium text-gray-800">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
