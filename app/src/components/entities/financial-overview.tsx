'use client'

import { TrendChart, TrendChartInline } from '@/components/custom-ui/charts/trend-chart'

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

function extractLabels(data: FinancialOverviewData, filter: 'revenue' | 'expense') {
  const labels: string[] = []
  for (const year of data.years) {
    for (const item of year.items) {
      if (item.type === filter && !labels.includes(item.label)) {
        labels.push(item.label)
      }
    }
  }
  return labels
}

export function FinancialTrends({ data }: { data: FinancialOverviewData }) {
  const years = extractYears(data)
  const totalRevenue = extractTrend(data, 'revenue')
  const totalExpenses = extractTrend(data, 'expense')
  const revenueLabels = extractLabels(data, 'revenue')
  const expenseLabels = extractLabels(data, 'expense')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-3">
        <TrendChart label="Total Revenue" values={totalRevenue} years={years} />
        <TrendChart label="Total Expenses" values={totalExpenses} years={years} />
      </div>
      <div className="rounded-lg bg-muted/50 px-4 py-1 divide-y divide-border/50">
        {revenueLabels.map((label) => (
          <TrendChartInline
            key={label}
            label={label}
            values={extractTrend(data, 'revenue', label)}
          />
        ))}
      </div>
      <div className="rounded-lg bg-muted/50 px-4 py-1 divide-y divide-border/50">
        {expenseLabels.map((label) => (
          <TrendChartInline
            key={label}
            label={label}
            values={extractTrend(data, 'expense', label)}
          />
        ))}
      </div>
    </div>
  )
}
