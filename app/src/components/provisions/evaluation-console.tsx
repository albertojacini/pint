'use client'

import type { EvaluationSummary } from '@/lib/db/schema/government'

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none'

function ScoreWidget({ data }: { data: NonNullable<EvaluationSummary['effectiveness']> }) {
  const percentage = (data.value / (data.maxValue || 10)) * 100
  const color = data.value >= 7 ? 'bg-positive-light' : data.value >= 4 ? 'bg-warning-light' : 'bg-negative-light'
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const trendColor =
    data.trend === 'up'
      ? 'text-positive'
      : data.trend === 'down'
        ? 'text-negative'
        : 'text-neutral'

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
      <div className="mt-1.5 h-1 bg-gradient-to-r from-negative-light via-neutral-light to-positive-light rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-gray-700 rounded-full"
          style={{ left: `calc(${balancePercent}% - 3px)` }}
        />
      </div>
    </div>
  )
}

function FinancialWidget({ data }: { data: NonNullable<EvaluationSummary['financial']> }) {
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'
  const trendColor =
    data.trend === 'up'
      ? 'text-positive'
      : data.trend === 'down'
        ? 'text-negative'
        : 'text-neutral'

  // Mock budget trend data over time (12 months)
  const trendData = [2.1, 2.3, 2.2, 2.4, 2.5, 2.3, 2.6, 2.4, 2.5, 2.7, 2.6, 2.8]
  const max = Math.max(...trendData)
  const min = Math.min(...trendData)
  const range = max - min

  // Create SVG path for smooth line
  const points = trendData.map((val, i) => {
    const x = (i / (trendData.length - 1)) * 100
    const y = 100 - ((val - min) / range) * 100
    return `${x},${y}`
  })
  const pathD = `M ${points.join(' L ')}`

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Budget</span>
        <div className="flex items-center gap-1">
          {data.trend && <span className={`text-xs ${trendColor}`}>{trendIcon}</span>}
          <span className="text-sm font-bold">{data.value}</span>
        </div>
      </div>
      <div className="mb-2 h-6">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-positive-light"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[8px] text-muted-foreground/70">Trend last year</div>
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

function ActivityWidget({ data }: { data: NonNullable<EvaluationSummary['activity']> }) {
  const trendIcon = data.trend === 'increasing' ? '↑' : data.trend === 'decreasing' ? '↓' : '→'
  const trendColor =
    data.trend === 'increasing'
      ? 'text-positive'
      : data.trend === 'decreasing'
        ? 'text-negative'
        : 'text-neutral'

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
              className="rounded-full bg-positive-light"
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
    high: 'bg-positive-light',
    medium: 'bg-warning-light',
    low: 'bg-warning',
    none: 'bg-neutral',
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${levelColors[data.level]} rounded-full`}
          style={{ width: `${data.coverage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Data</span>
        <span className="text-sm font-bold">{data.coverage}%</span>
      </div>
      <div className="flex items-center justify-between -mt-0.5">
        <div className="text-[8px] text-muted-foreground/70">% of verification</div>
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

function StakeholdersWidget({ data }: { data: NonNullable<EvaluationSummary['stakeholders']> }) {
  const borderColors = {
    positive: 'border-positive-light',
    negative: 'border-negative-light',
    neutral: 'border-neutral',
    mixed: 'border-warning-light',
  }

  // Sort items by color
  const sortedByColor = [...data.items].sort((a, b) => {
    const order = { positive: 0, negative: 1, neutral: 2, mixed: 3 }
    return order[a.impact] - order[b.impact]
  })

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <span className="text-xs font-medium text-muted-foreground">Stakeholders</span>
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
        {sortedByColor.map((item, i) => (
          <div key={i} className={`border-l-2 ${borderColors[item.impact]} pl-1.5 text-[10px]`}>
            {item.group}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProposalsMiniWidget({ data }: { data: NonNullable<EvaluationSummary['proposals']> }) {
  const totalProposals = data.items.length

  // Calculate total engagement and sort by size
  const proposalsWithSize = data.items.map((p) => ({
    ...p,
    total: p.support + p.oppose,
    supportRatio: p.support / (p.support + p.oppose),
  }))

  const sorted = [...proposalsWithSize].sort((a, b) => b.total - a.total)
  const maxEngagement = Math.max(...sorted.map((p) => p.total))

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex gap-1.5 items-center mb-3">
        {sorted.map((p, i) => {
          const size = 3 + (p.total / maxEngagement) * 9 // 3px to 12px
          const color =
            p.supportRatio > 0.6
              ? 'bg-positive-light'
              : p.supportRatio < 0.4
                ? 'bg-negative-light'
                : 'bg-warning-light'

          return (
            <div
              key={i}
              className={`rounded-full ${color}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.2 + (p.total / maxEngagement) * 0.8,
              }}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Proposals</span>
        <span className="text-sm font-bold">{totalProposals}</span>
      </div>
      <div className="flex items-center justify-end -mt-0.5">
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

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function CommunityMiniWidget({ data }: { data: NonNullable<EvaluationSummary['community']> }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Community</span>
        <div className="flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-warning-light"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-sm font-bold">{data.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span>{formatCount(data.ratingsCount)} votes</span>
        <span>{formatCount(data.commentsCount)} comments</span>
        <span>{formatCount(data.followers)} followers</span>
      </div>
    </div>
  )
}

function IdeasWidget({ data }: { data: NonNullable<EvaluationSummary['ideas']> }) {
  return (
    <div className="rounded-lg p-3 border-2 border-dashed border-amber-400/70">
      <div className="flex items-center gap-2 mb-2">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-400"
        >
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
        <span className="text-xs font-medium text-muted-foreground">Ideas</span>
        <span className="text-sm font-bold ml-auto">{data.items.length}</span>
      </div>
      <div className="space-y-1.5">
        {data.items.map((idea, i) => (
          <div key={i} className="text-[10px]">
            <div className="font-medium truncate">{idea.title}</div>
            {idea.description && (
              <div className="text-muted-foreground/70 truncate">{idea.description}</div>
            )}
          </div>
        ))}
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
    data.activity ||
    data.dataConfidence ||
    data.stakeholders ||
    data.proposals ||
    data.community ||
    data.ideas

  if (!hasAnyWidget) return null

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 mb-10 gap-3">
      {data.ideas && data.ideas.items.length > 0 && (
        <div className="break-inside-avoid mb-3">
          <IdeasWidget data={data.ideas} />
        </div>
      )}
      {data.effectiveness && (
        <div className="break-inside-avoid mb-3">
          <ScoreWidget data={data.effectiveness} />
        </div>
      )}
      {data.impact && (
        <div className="break-inside-avoid mb-3">
          <ImpactWidget data={data.impact} />
        </div>
      )}
      {data.financial && (
        <div className="break-inside-avoid mb-3">
          <FinancialWidget data={data.financial} />
        </div>
      )}
      {data.activity && (
        <div className="break-inside-avoid mb-3">
          <ActivityWidget data={data.activity} />
        </div>
      )}
      {data.dataConfidence && (
        <div className="break-inside-avoid mb-3">
          <DataConfidenceWidget data={data.dataConfidence} />
        </div>
      )}
      {data.proposals && data.proposals.items.length > 0 && (
        <div className="break-inside-avoid mb-3">
          <ProposalsMiniWidget data={data.proposals} />
        </div>
      )}
      {data.community && (
        <div className="break-inside-avoid mb-3">
          <CommunityMiniWidget data={data.community} />
        </div>
      )}
      {data.stakeholders && (
        <div className="break-inside-avoid mb-3">
          <StakeholdersWidget data={data.stakeholders} />
        </div>
      )}
    </div>
  )
}
