'use client'

import type { EvaluationSummary } from '@/lib/db/schema/government'

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none'

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-orange-100 text-orange-700',
    none: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<ConfidenceLevel, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Bassa',
    none: 'N/D',
  }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles[level]}`}>
      {labels[level]}
    </span>
  )
}

function WidgetCard({
  title,
  confidence,
  children,
}: {
  title: string
  confidence?: ConfidenceLevel
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {confidence && confidence !== 'high' && <ConfidenceBadge level={confidence} />}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function ScoreWidget({ data }: { data: NonNullable<EvaluationSummary['effectiveness']> }) {
  const percentage = (data.value / (data.maxValue || 10)) * 100
  const color =
    data.value >= 7 ? 'bg-green-500' : data.value >= 4 ? 'bg-yellow-500' : 'bg-red-500'
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const trendColor =
    data.trend === 'up'
      ? 'text-green-600'
      : data.trend === 'down'
        ? 'text-red-600'
        : 'text-gray-500'

  return (
    <WidgetCard title={data.label || 'Efficacia'} confidence={data.confidence}>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold">{data.value}</span>
        <span className="text-sm text-muted-foreground mb-0.5">/{data.maxValue || 10}</span>
        {data.trend && <span className={`text-lg ${trendColor} mb-0.5`}>{trendIcon}</span>}
      </div>
      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </WidgetCard>
  )
}

function ImpactWidget({ data }: { data: NonNullable<EvaluationSummary['impact']> }) {
  const balancePercent = ((data.balance + 1) / 2) * 100

  return (
    <WidgetCard title="Impatto" confidence={data.confidence}>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-red-400 via-gray-300 to-green-400 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full"
            style={{ left: `calc(${balancePercent}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Perdenti</span>
          <span>Vincenti</span>
        </div>
      </div>
    </WidgetCard>
  )
}

function FinancialWidget({ data }: { data: NonNullable<EvaluationSummary['financial']> }) {
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const valueColor = data.isPositive ? 'text-green-600' : 'text-red-600'

  return (
    <WidgetCard title="Bilancio" confidence={data.confidence}>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold ${valueColor}`}>{data.value}</span>
        {data.trend && <span className="text-muted-foreground">{trendIcon}</span>}
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </WidgetCard>
  )
}

function SentimentWidget({ data }: { data: NonNullable<EvaluationSummary['sentiment']> }) {
  const color =
    data.score >= 60 ? 'bg-green-500' : data.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <WidgetCard title="Consenso" confidence={data.confidence}>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{data.score}%</span>
      </div>
      <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${data.score}%` }} />
      </div>
      {data.label && <div className="text-xs text-muted-foreground mt-1">{data.label}</div>}
    </WidgetCard>
  )
}

function ActivityWidget({ data }: { data: NonNullable<EvaluationSummary['activity']> }) {
  const trendIcon =
    data.trend === 'increasing' ? '↑' : data.trend === 'decreasing' ? '↓' : '→'

  return (
    <WidgetCard title="Attività" confidence={data.confidence}>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{data.changesCount}</span>
        <span className="text-xs text-muted-foreground">modifiche</span>
        {data.trend && <span className="text-muted-foreground ml-1">{trendIcon}</span>}
      </div>
      <div className="text-xs text-muted-foreground">{data.period}</div>
    </WidgetCard>
  )
}

function DataConfidenceWidget({
  data,
}: {
  data: NonNullable<EvaluationSummary['dataConfidence']>
}) {
  const levelColors: Record<ConfidenceLevel, string> = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-orange-500',
    none: 'bg-gray-400',
  }

  return (
    <WidgetCard title="Dati">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{data.coverage}%</span>
      </div>
      <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${levelColors[data.level]} rounded-full`}
          style={{ width: `${data.coverage}%` }}
        />
      </div>
      {data.label && <div className="text-xs text-muted-foreground mt-1">{data.label}</div>}
    </WidgetCard>
  )
}

function StakeholdersWidget({
  data,
}: {
  data: NonNullable<EvaluationSummary['stakeholders']>
}) {
  const impactColors = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-gray-400',
    mixed: 'bg-yellow-500',
  }
  const impactLabels = {
    positive: '+',
    negative: '-',
    neutral: '=',
    mixed: '±',
  }

  return (
    <WidgetCard title="Stakeholder" confidence={data.confidence}>
      <div className="flex flex-wrap gap-1.5">
        {data.items.slice(0, 6).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1 bg-background rounded px-2 py-1 text-xs"
            title={item.detail}
          >
            <span
              className={`w-4 h-4 rounded-full ${impactColors[item.impact]} text-white text-[10px] flex items-center justify-center font-bold`}
            >
              {impactLabels[item.impact]}
            </span>
            <span className="truncate max-w-[80px]">{item.group}</span>
          </div>
        ))}
        {data.items.length > 6 && (
          <div className="text-xs text-muted-foreground px-2 py-1">
            +{data.items.length - 6}
          </div>
        )}
      </div>
    </WidgetCard>
  )
}

function ProposalsMiniWidget({
  data,
}: {
  data: NonNullable<EvaluationSummary['proposals']>
}) {
  const totalProposals = data.items.length
  const topProposal = data.items.reduce(
    (best, item) => (item.support > best.support ? item : best),
    data.items[0]
  )
  const totalSupport = data.items.reduce((sum, item) => sum + item.support, 0)
  const totalOppose = data.items.reduce((sum, item) => sum + item.oppose, 0)
  const supportRatio = totalSupport + totalOppose > 0
    ? Math.round((totalSupport / (totalSupport + totalOppose)) * 100)
    : 50

  return (
    <WidgetCard title="Proposte" confidence={data.confidence}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-bold">{totalProposals}</span>
        <span className="text-xs text-muted-foreground">attive</span>
      </div>
      {topProposal && (
        <div className="text-xs">
          <span className="text-muted-foreground">Top: </span>
          <span className="font-medium truncate">{topProposal.label}</span>
          <span className="text-green-600 ml-1">+{topProposal.support}</span>
          <span className="text-red-600 ml-1">-{topProposal.oppose}</span>
        </div>
      )}
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden flex">
        <div className="bg-green-500 h-full" style={{ width: `${supportRatio}%` }} />
        <div className="bg-red-500 h-full" style={{ width: `${100 - supportRatio}%` }} />
      </div>
    </WidgetCard>
  )
}

export function EvaluationConsole({
  data,
}: {
  data: EvaluationSummary | null | undefined
}) {
  if (!data) return null

  const hasAnyWidget =
    data.effectiveness ||
    data.impact ||
    data.financial ||
    data.sentiment ||
    data.activity ||
    data.dataConfidence ||
    data.stakeholders ||
    data.proposals

  if (!hasAnyWidget) return null

  return (
    <div className="border border-border rounded-lg p-4 bg-background/50 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.effectiveness && <ScoreWidget data={data.effectiveness} />}
        {data.impact && <ImpactWidget data={data.impact} />}
        {data.financial && <FinancialWidget data={data.financial} />}
        {data.sentiment && <SentimentWidget data={data.sentiment} />}
        {data.activity && <ActivityWidget data={data.activity} />}
        {data.dataConfidence && <DataConfidenceWidget data={data.dataConfidence} />}
        {data.proposals && data.proposals.items.length > 0 && (
          <ProposalsMiniWidget data={data.proposals} />
        )}
      </div>
      {data.stakeholders && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <StakeholdersWidget data={data.stakeholders} />
        </div>
      )}
    </div>
  )
}
