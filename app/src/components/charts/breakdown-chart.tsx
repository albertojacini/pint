'use client'

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

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

export interface BreakdownData {
  items: { label: string; value: number }[]
}

const RADIAN = Math.PI / 180

function renderLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number'
  )
    return null
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function BreakdownChart({ data }: { data: BreakdownData }) {
  const { items } = data

  if (items.length === 0) {
    return <p className="text-sm text-yellow-600">No data</p>
  }

  const chartData = items.map((item, i) => ({
    name: item.label,
    value: item.value,
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={110}
          dataKey="value"
        />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number' ? value.toLocaleString() : String(value ?? '')
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
