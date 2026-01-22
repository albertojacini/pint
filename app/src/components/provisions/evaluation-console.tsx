'use client'

import type { EvaluationSummary } from '@/lib/db/schema/government'

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none'

function ScoreWidget({ data }: { data: NonNullable<EvaluationSummary['effectiveness']> }) {
  const percentage = (data.value / (data.maxValue || 10)) * 100
  const color = data.value >= 7 ? 'bg-lime-400' : data.value >= 4 ? 'bg-yellow-400' : 'bg-rose-400'
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const trendColor =
    data.trend === 'up'
      ? 'text-lime-500'
      : data.trend === 'down'
        ? 'text-rose-500'
        : 'text-gray-500'

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Effectiveness</span>
        <div className="flex items-center gap-1">
          {data.trend && <span className={`text-xs ${trendColor}`}>{trendIcon}</span>}
          <span className="text-sm font-bold">{data.value}</span>
        </div>
      </div>
      <div className="flex items-center justify-between -mt-0.5">
        <div className="text-[8px] text-muted-foreground/70">Pint calculate index</div>
        <div className="flex gap-1">
          <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
          <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ImpactWidget({ data }: { data: NonNullable<EvaluationSummary['impact']> }) {
  const balancePercent = ((data.balance + 1) / 2) * 100
  const balanceLabel =
    data.balance > 0.3 ? 'Positive' : data.balance < -0.3 ? 'Negative' : 'Neutral'

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Impact</span>
        <span className="text-sm font-bold">{balanceLabel}</span>
      </div>
      <div className="mt-1.5 h-1.5 bg-gradient-to-r from-rose-400 via-gray-300 to-lime-400 rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-gray-700 rounded-full"
          style={{ left: `calc(${balancePercent}% - 4px)` }}
        />
      </div>
    </div>
  )
}

function FinancialWidget({ data }: { data: NonNullable<EvaluationSummary['financial']> }) {
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const valueColor = data.isPositive ? 'text-lime-500' : 'text-rose-500'

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Budget</span>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${valueColor}`}>{data.value}</span>
          {data.trend && <span className="text-xs text-muted-foreground">{trendIcon}</span>}
        </div>
      </div>
      {data.label && <div className="text-[10px] text-muted-foreground mt-1">{data.label}</div>}
    </div>
  )
}

function SentimentWidget({ data }: { data: NonNullable<EvaluationSummary['sentiment']> }) {
  const color =
    data.score >= 60 ? 'bg-lime-400' : data.score >= 40 ? 'bg-yellow-400' : 'bg-rose-400'

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Sentiment</span>
        <span className="text-sm font-bold">{data.score}%</span>
      </div>
      <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${data.score}%` }} />
      </div>
    </div>
  )
}

function ActivityWidget({ data }: { data: NonNullable<EvaluationSummary['activity']> }) {
  const trendIcon = data.trend === 'increasing' ? '↑' : data.trend === 'decreasing' ? '↓' : '→'
  const trendColor =
    data.trend === 'increasing'
      ? 'text-lime-500'
      : data.trend === 'decreasing'
        ? 'text-rose-500'
        : 'text-gray-500'

  // Mock 18 data points - in real implementation, this would come from data
  const activityData = [1, 2, 3, 2, 4, 3, 5, 4, 2, 3, 4, 5, 3, 5, 2, 3, 4, 5]
  const maxActivity = Math.max(...activityData)

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        {activityData.map((count, i) => {
          const size = 2 + (count / maxActivity) * 4 // 2px to 6px
          return (
            <div
              key={i}
              className="rounded-full bg-lime-400"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.2 + (count / maxActivity) * 0.8,
              }}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Activity</span>
        <div className="flex items-center gap-1">
          {data.trend && <span className={`text-xs ${trendColor}`}>{trendIcon}</span>}
          <span className="text-sm font-bold">{data.changesCount}</span>
        </div>
      </div>
      <div className="flex items-center justify-between -mt-0.5">
        <div className="text-[8px] text-muted-foreground/70">Changes last year</div>
        <div className="flex gap-1">
          <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
          <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function DataConfidenceWidget({
  data,
}: {
  data: NonNullable<EvaluationSummary['dataConfidence']>
}) {
  const levelColors: Record<ConfidenceLevel, string> = {
    high: 'bg-lime-400',
    medium: 'bg-yellow-400',
    low: 'bg-orange-400',
    none: 'bg-gray-400',
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Data</span>
        <span className="text-sm font-bold">{data.coverage}%</span>
      </div>
      <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${levelColors[data.level]} rounded-full`}
          style={{ width: `${data.coverage}%` }}
        />
      </div>
    </div>
  )
}

function StakeholdersWidget({ data }: { data: NonNullable<EvaluationSummary['stakeholders']> }) {
  const impactColors = {
    positive: 'bg-lime-400',
    negative: 'bg-rose-400',
    neutral: 'bg-gray-400',
    mixed: 'bg-yellow-400',
  }
  const impactLabels = {
    positive: '+',
    negative: '-',
    neutral: '=',
    mixed: '±',
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Stakeholders</span>
        <span className="text-xs text-muted-foreground">{data.items.length} groups</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {data.items.slice(0, 6).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1 bg-background rounded px-1.5 py-0.5 text-[10px]"
            title={item.detail}
          >
            <span
              className={`w-3 h-3 rounded-full ${impactColors[item.impact]} text-white text-[8px] flex items-center justify-center font-bold`}
            >
              {impactLabels[item.impact]}
            </span>
            <span className="truncate max-w-[70px]">{item.group}</span>
          </div>
        ))}
        {data.items.length > 6 && (
          <div className="text-[10px] text-muted-foreground px-1.5 py-0.5">
            +{data.items.length - 6}
          </div>
        )}
      </div>
    </div>
  )
}

function ProposalsMiniWidget({ data }: { data: NonNullable<EvaluationSummary['proposals']> }) {
  const totalProposals = data.items.length
  const totalSupport = data.items.reduce((sum, item) => sum + item.support, 0)
  const totalOppose = data.items.reduce((sum, item) => sum + item.oppose, 0)
  const supportRatio =
    totalSupport + totalOppose > 0
      ? Math.round((totalSupport / (totalSupport + totalOppose)) * 100)
      : 50

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Proposals</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold">{totalProposals}</span>
          <span className="text-xs text-muted-foreground">active</span>
        </div>
      </div>
      <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden flex">
        <div className="bg-lime-400 h-full rounded-l-full" style={{ width: `${supportRatio}%` }} />
        <div
          className="bg-rose-400 h-full rounded-r-full"
          style={{ width: `${100 - supportRatio}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span className="text-lime-500">+{totalSupport}</span>
        <span className="text-rose-500">-{totalOppose}</span>
      </div>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function CommunityMiniWidget({ data }: { data: NonNullable<EvaluationSummary['community']> }) {
  const fullStars = Math.floor(data.rating)
  const hasHalfStar = data.rating % 1 >= 0.5

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Community</span>
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${
                  star <= fullStars
                    ? 'text-orange-400'
                    : star === fullStars + 1 && hasHalfStar
                      ? 'text-orange-400/50'
                      : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-bold">{data.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>
          {formatCount(data.ratingsCount)} votes · {formatCount(data.commentsCount)} comments
        </span>
        <span>{formatCount(data.followers)} followers</span>
      </div>
    </div>
  )
}

export function EvaluationConsole({ data }: { data: EvaluationSummary | null | undefined }) {
  if (!data) return null

  const hasAnyWidget =
    data.effectiveness ||
    data.impact ||
    data.financial ||
    data.sentiment ||
    data.activity ||
    data.dataConfidence ||
    data.stakeholders ||
    data.proposals ||
    data.community

  if (!hasAnyWidget) return null

  return (
    <div>
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
        {data.community && <CommunityMiniWidget data={data.community} />}
      </div>
      {data.stakeholders && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <StakeholdersWidget data={data.stakeholders} />
        </div>
      )}
    </div>
  )
}
