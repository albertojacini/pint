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

const REVENUE_COLORS = [
  '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
]

const EXPENSE_COLORS = [
  '#b91c1c', '#ef4444', '#fb923c', '#fdba74', '#fde68a',
]

export interface FinancialOverviewData {
  currency: string
  unit: string
  years: Array<{
    year: number
    type: 'actual' | 'forecast'
    items: Array<{
      type: 'revenue' | 'expense'
      amount: number
      label: string
    }>
  }>
}

interface FinancialChartProps {
  data: FinancialOverviewData
  filter: 'revenue' | 'expense'
  title: string
  colors: string[]
}

function formatAxis(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}B`
  return `${Math.round(value)}M`
}

function formatTooltip(v: number, unit: string, currency: string) {
  const sym = currency === 'EUR' ? '€' : currency
  return `${sym}${Math.round(v).toLocaleString()}${unit === 'millions' ? 'M' : ''}`
}

function FinancialChart({ data, filter, title, colors }: FinancialChartProps) {
  // Collect unique labels for this filter type
  const labels: string[] = []
  for (const year of data.years) {
    for (const item of year.items) {
      if (item.type === filter && !labels.includes(item.label)) {
        labels.push(item.label)
      }
    }
  }

  // Transform to recharts format: { year: '2023', [label]: amount, ... }
  const chartData = data.years.map((y) => {
    const row: Record<string, string | number> = {
      year: y.type === 'forecast' ? `${y.year}*` : `${y.year}`,
    }
    for (const item of y.items) {
      if (item.type === filter) {
        row[item.label] = item.amount
      }
    }
    return row
  })

  if (chartData.length === 0 || labels.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={formatAxis} />
          <Tooltip
            formatter={(v) =>
              typeof v === 'number' ? formatTooltip(v, data.unit, data.currency) : v
            }
          />
          <Legend />
          {labels.map((label, i) => (
            <Area
              key={label}
              type="linear"
              dataKey={label}
              stackId="1"
              fill="none"
              stroke={colors[i % colors.length]}
              dot={{ r: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueOverview({ data }: { data: FinancialOverviewData }) {
  return <FinancialChart data={data} filter="revenue" title="Revenue" colors={REVENUE_COLORS} />
}

export function ExpenseOverview({ data }: { data: FinancialOverviewData }) {
  return <FinancialChart data={data} filter="expense" title="Expenses" colors={EXPENSE_COLORS} />
}
