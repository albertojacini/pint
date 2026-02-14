'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const DEFAULT_COLORS = [
  '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
  '#6366f1', '#818cf8', '#a5b4fc',
]

function formatAxis(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}B`
  return `${Math.round(value)}M`
}

function formatTooltipValue(v: number, currency: string) {
  const sym = currency === 'EUR' ? '€' : currency
  return `${sym}${Math.round(v).toLocaleString()}M`
}

export interface StackedAreaSeries {
  dataKey: string
  name: string
}

export interface StackedAreaProps {
  data: Record<string, string | number>[]
  series: StackedAreaSeries[]
  xDataKey?: string
  colors?: string[]
  height?: number
  currency?: string
}

export function StackedArea({
  data,
  series,
  xDataKey = 'year',
  colors = DEFAULT_COLORS,
  height = 300,
  currency = 'EUR',
}: StackedAreaProps) {
  if (data.length === 0 || series.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xDataKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatAxis} />
        <Tooltip
          formatter={(v) =>
            typeof v === 'number' ? formatTooltipValue(v, currency) : v
          }
        />
        <Legend />
        {series.map((s, i) => (
          <Area
            key={s.dataKey}
            type="linear"
            dataKey={s.dataKey}
            name={s.name}
            stackId="1"
            fill="none"
            stroke={colors[i % colors.length]}
            dot={{ r: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
