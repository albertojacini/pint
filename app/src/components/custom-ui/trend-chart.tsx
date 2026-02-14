function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 100
    return `${x},${y}`
  })
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <path
        d={`M ${points.join(' L ')}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function formatCompact(n: number): string {
  if (n >= 1000) return `€${(n / 1000).toFixed(1)}B`
  return `€${Math.round(n)}M`
}

interface TrendChartBaseProps {
  label: string
  values: number[]
  color?: string
}

export interface TrendChartProps extends TrendChartBaseProps {
  years: string[]
}

export function TrendChart({
  label,
  values,
  years,
  color = 'hsl(var(--positive-light))',
}: TrendChartProps) {
  const latest = values[values.length - 1]
  const prev = values[values.length - 2]
  const change = prev ? ((latest - prev) / prev) * 100 : 0
  const trendSign = change >= 0 ? '+' : ''

  return (
    <div className="rounded-lg bg-muted/50 p-4 space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-muted-foreground">{formatCompact(latest)}</span>
      </div>
      <div className="h-10">
        <Sparkline values={values} color={color} />
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground/60">
          {years[0]}–{years[years.length - 1]}
        </span>
        <span
          className={`text-[10px] font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {trendSign}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

export function TrendChartInline({
  label,
  values,
  color = 'hsl(var(--positive-light))',
}: TrendChartBaseProps) {
  const latest = values[values.length - 1]
  const prev = values[values.length - 2]
  const change = prev ? ((latest - prev) / prev) * 100 : 0
  const trendSign = change >= 0 ? '+' : ''

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="h-5 flex-1 min-w-[80px]">
        <Sparkline values={values} color={color} />
      </div>
      <span className="text-sm font-bold w-16 text-right">{formatCompact(latest)}</span>
      <span
        className={`text-xs font-medium w-14 text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
      >
        {trendSign}
        {change.toFixed(1)}%
      </span>
    </div>
  )
}
