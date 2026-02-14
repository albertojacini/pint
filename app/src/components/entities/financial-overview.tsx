'use client'

import { StackedArea } from '@/components/custom-ui/charts/stacked-area'
import { TrendChart, TrendChartInline } from '@/components/custom-ui/charts/trend-chart'

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

function transformData(data: FinancialOverviewData, filter: 'revenue' | 'expense') {
  const labels: string[] = []
  for (const year of data.years) {
    for (const item of year.items) {
      if (item.type === filter && !labels.includes(item.label)) {
        labels.push(item.label)
      }
    }
  }

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

  const series = labels.map((label) => ({ dataKey: label, name: label }))
  return { chartData, series }
}

export function RevenueOverview({ data }: { data: FinancialOverviewData }) {
  const { chartData, series } = transformData(data, 'revenue')
  if (series.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Revenue</h4>
      <StackedArea
        data={chartData}
        series={series}
        colors={REVENUE_COLORS}
        currency={data.currency}
      />
    </div>
  )
}

export function ExpenseOverview({ data }: { data: FinancialOverviewData }) {
  const { chartData, series } = transformData(data, 'expense')
  if (series.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Expenses</h4>
      <StackedArea
        data={chartData}
        series={series}
        colors={EXPENSE_COLORS}
        currency={data.currency}
      />
    </div>
  )
}

function extractTrend(data: FinancialOverviewData, filter: 'revenue' | 'expense', label?: string) {
  return data.years.map((y) => {
    let total = 0
    for (const item of y.items) {
      if (item.type === filter && (!label || item.label === label)) {
        total += item.amount
      }
    }
    return total
  })
}

function extractYears(data: FinancialOverviewData) {
  return data.years.map((y) => (y.type === 'forecast' ? `${y.year}*` : `${y.year}`))
}

export function FinancialTrends({ data }: { data: FinancialOverviewData }) {
  const years = extractYears(data)
  const totalRevenue = extractTrend(data, 'revenue')
  const totalExpenses = extractTrend(data, 'expense')

  // Get first revenue and first expense label for breakdown
  const firstRevLabel = data.years[0]?.items.find((i) => i.type === 'revenue')?.label
  const firstExpLabel = data.years[0]?.items.find((i) => i.type === 'expense')?.label
  const firstRevenue = firstRevLabel ? extractTrend(data, 'revenue', firstRevLabel) : null
  const firstExpense = firstExpLabel ? extractTrend(data, 'expense', firstExpLabel) : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TrendChart label="Total Revenue" values={totalRevenue} years={years} />
        <TrendChart label="Total Expenses" values={totalExpenses} years={years} />
        {firstRevenue && firstRevLabel && (
          <TrendChart label={firstRevLabel} values={firstRevenue} years={years} />
        )}
        {firstExpense && firstExpLabel && (
          <TrendChart label={firstExpLabel} values={firstExpense} years={years} />
        )}
      </div>
      <div className="rounded-lg bg-muted/50 px-4 py-1 divide-y divide-border/50">
        <TrendChartInline label="Total Revenue" values={totalRevenue} />
        <TrendChartInline label="Total Expenses" values={totalExpenses} />
      </div>
    </div>
  )
}
