'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = [
  'hsl(var(--tag-blue))',
  'hsl(var(--tag-green))',
  'hsl(var(--tag-orange))',
  'hsl(var(--tag-purple))',
  'hsl(var(--tag-cyan))',
  'hsl(var(--tag-pink))',
  'hsl(var(--tag-teal))',
  'hsl(var(--tag-slate))',
]

export interface TimeSeriesData {
  timeLabels: string[]
  series: { name: string; values: number[] }[]
}

export function TimeSeriesChart({ data }: { data: TimeSeriesData }) {
  const { timeLabels, series } = data

  if (timeLabels.length === 0 || series.length === 0) {
    return <p className="text-sm text-yellow-600">No data</p>
  }

  const chartData = timeLabels.map((label, i) => {
    const point: Record<string, string | number> = { time: label }
    for (const s of series) {
      point[s.name] = s.values[i] ?? 0
    }
    return point
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
