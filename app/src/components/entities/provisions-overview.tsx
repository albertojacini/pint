import Link from 'next/link'
import { entityPath } from '@/lib/utils'
import { PageH2 } from '@/components/custom-ui/typography'
import type { ProvisionAggregates } from '@/lib/actions/provisions'

interface ProvisionsOverviewProps {
  entity: { id: string; slug: string }
  aggregates: ProvisionAggregates
}

// Format currency values
function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  if (Math.abs(value) >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `€${(value / 1_000).toFixed(0)}K`
  }
  return `€${value.toFixed(0)}`
}

// Format growth percentage
function formatGrowth(value: number | null): string {
  if (value === null) return ''
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Format cash flow with sign indicator
function formatCashFlow(value: number | null): string {
  if (value === null) return '—'
  const sign = value >= 0 ? '+' : ''
  if (Math.abs(value) >= 1_000_000) {
    return `${sign}€${(value / 1_000_000).toFixed(1)}M/yr`
  }
  if (Math.abs(value) >= 1_000) {
    return `${sign}€${(value / 1_000).toFixed(0)}K/yr`
  }
  return `${sign}€${value.toFixed(0)}/yr`
}

// Format subtype breakdown (e.g., "6 svc · 4 conc")
function formatBreakdown(counts: Record<string, number>, labels: Record<string, string>): string {
  const parts = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => `${count} ${labels[key] || key}`)
  return parts.length > 0 ? parts.join(' · ') : '—'
}

const contractTypeLabels: Record<string, string> = {
  service: 'svc',
  concession: 'conc',
  partnership: 'PPP',
}

const regulationTypeLabels: Record<string, string> = {
  rule: 'rule',
  ordinance: 'ord',
  code: 'code',
  standard: 'std',
}

// Type card configuration
const typeConfig = {
  taxation: { icon: '💰', label: 'Taxation', color: 'bg-amber-50 border-amber-200', brickColor: 'bg-amber-400' },
  ownership: { icon: '🏛️', label: 'Ownership', color: 'bg-purple-50 border-purple-200', brickColor: 'bg-purple-400' },
  contract: { icon: '📄', label: 'Contracts', color: 'bg-blue-50 border-blue-200', brickColor: 'bg-blue-400' },
  regulation: { icon: '⚖️', label: 'Regulations', color: 'bg-slate-50 border-slate-200', brickColor: 'bg-slate-400' },
  allocation: { icon: '📊', label: 'Allocations', color: 'bg-green-50 border-green-200', brickColor: 'bg-green-400' },
  designation: { icon: '🏷️', label: 'Designations', color: 'bg-rose-50 border-rose-200', brickColor: 'bg-rose-400' },
}

type ProvisionType = keyof typeof typeConfig

// Activity item for the sparkline
interface ActivityItem {
  type: ProvisionType
  title: string
  action: 'created' | 'updated' | 'repealed'
}

interface MonthActivity {
  month: string // "Jan", "Feb", etc.
  year: number
  items: ActivityItem[]
}

// Simple seeded random for deterministic mock data
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// Generate mock activity data for last 12 months (deterministic based on entityId)
function generateMockActivity(entityId: string): MonthActivity[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const types: ProvisionType[] = ['taxation', 'ownership', 'contract', 'regulation', 'allocation', 'designation']
  const actions: Array<'created' | 'updated' | 'repealed'> = ['created', 'updated', 'repealed']

  const mockTitles: Record<ProvisionType, string[]> = {
    taxation: ['Property Tax Rate', 'Business License Fee', 'Tourism Tax', 'Waste Collection Fee'],
    ownership: ['City Hall Building', 'Public Library', 'Sports Complex', 'Water Treatment Plant'],
    contract: ['Street Cleaning Service', 'IT Maintenance', 'Public Transport Concession', 'Waste Management'],
    regulation: ['Building Height Limit', 'Noise Ordinance', 'Parking Rules', 'Green Space Requirements'],
    allocation: ['Youth Programs Budget', 'Infrastructure Fund', 'Emergency Reserve', 'Cultural Events'],
    designation: ['Historic District', 'Protected Green Area', 'Commercial Zone', 'Pedestrian Area'],
  }

  // Create deterministic seed from entityId
  const seed = entityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = seededRandom(seed)

  const now = new Date()
  const result: MonthActivity[] = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthIndex = date.getMonth()
    const year = date.getFullYear()

    // Generate 0-5 activities per month
    const activityCount = Math.floor(random() * 6)
    const items: ActivityItem[] = []

    for (let j = 0; j < activityCount; j++) {
      const type = types[Math.floor(random() * types.length)]
      const titles = mockTitles[type]
      items.push({
        type,
        title: titles[Math.floor(random() * titles.length)],
        action: actions[Math.floor(random() * actions.length)],
      })
    }

    result.push({
      month: months[monthIndex],
      year,
      items,
    })
  }

  return result
}

// Sparkline component
function ActivitySparkline({ activity }: { activity: MonthActivity[] }) {
  const maxItems = Math.max(...activity.map(m => m.items.length), 1)
  const maxHeight = 48 // pixels
  const brickHeight = 8

  return (
    <div className="flex items-end gap-1 h-16">
      {activity.map((month, monthIndex) => (
        <div
          key={`${month.month}-${month.year}`}
          className="flex-1 flex flex-col-reverse gap-0.5 min-w-0"
          style={{ height: maxHeight }}
        >
          {month.items.map((item, itemIndex) => (
            <div
              key={`${monthIndex}-${itemIndex}`}
              className={`w-full rounded-sm ${typeConfig[item.type].brickColor} hover:opacity-80 cursor-pointer transition-opacity`}
              style={{ height: brickHeight }}
              title={`${item.title} (${item.action}) - ${month.month} ${month.year}`}
            />
          ))}
          {/* Month label */}
          <div className="absolute -bottom-5 left-0 right-0 text-center">
          </div>
        </div>
      ))}
    </div>
  )
}

// Month labels row
function MonthLabels({ activity }: { activity: MonthActivity[] }) {
  return (
    <div className="flex gap-1 mt-1">
      {activity.map((month) => (
        <div
          key={`label-${month.month}-${month.year}`}
          className="flex-1 text-center text-[10px] text-gray-400 min-w-0 truncate"
        >
          {month.month}
        </div>
      ))}
    </div>
  )
}

export function ProvisionsOverview({ entity, aggregates }: ProvisionsOverviewProps) {
  const { total, byType, tags } = aggregates

  if (total === 0) return null

  // Get types with count > 0, ordered by count
  const activeTypes = (Object.keys(byType) as Array<keyof typeof byType>)
    .filter((type) => byType[type].count > 0)
    .sort((a, b) => byType[b].count - byType[a].count)

  // Generate mock activity data (will be replaced with real data later)
  const activityData = generateMockActivity(entity.id)
  const totalActivity = activityData.reduce((sum, m) => sum + m.items.length, 0)

  return (
    <div className="bg-white p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <PageH2>Provisions</PageH2>
          <span className="text-2xl font-bold text-gray-700">{total}</span>
        </div>
        <Link
          href={`${entityPath(entity)}/pr`}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View all
        </Link>
      </div>

      {/* Type Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {activeTypes.map((type) => {
          const config = typeConfig[type]

          return (
            <Link
              key={type}
              href={`${entityPath(entity)}/pr?type=${type}`}
              className={`rounded-lg p-4 border ${config.color} hover:shadow-sm transition-shadow`}
            >
              {/* Header row: icon + label + count */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                </div>
                <span className="text-xl font-bold text-gray-800">{byType[type].count}</span>
              </div>

              {/* Type-specific metrics */}
              <div className="text-xs text-gray-600 space-y-0.5">
                {type === 'taxation' && (
                  <>
                    <div className="font-medium">
                      {formatCurrency(byType.taxation.totalRevenue)}
                      {byType.taxation.totalRevenue !== null && ' revenue'}
                    </div>
                    {byType.taxation.avgGrowth !== null && (
                      <div className={byType.taxation.avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatGrowth(byType.taxation.avgGrowth)} YoY
                      </div>
                    )}
                  </>
                )}

                {type === 'ownership' && (
                  <>
                    <div className="font-medium">
                      {formatCurrency(byType.ownership.totalValuation)}
                      {byType.ownership.totalValuation !== null && ' value'}
                    </div>
                    {byType.ownership.totalCashFlow !== null && (
                      <div className={byType.ownership.totalCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCashFlow(byType.ownership.totalCashFlow)}
                      </div>
                    )}
                  </>
                )}

                {type === 'contract' && (
                  <div>{formatBreakdown(byType.contract.byContractType, contractTypeLabels)}</div>
                )}

                {type === 'regulation' && (
                  <div>{formatBreakdown(byType.regulation.byRegulationType, regulationTypeLabels)}</div>
                )}

                {(type === 'allocation' || type === 'designation') && (
                  <div className="text-gray-400">—</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Tags Row */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-sm text-gray-500">Topics:</span>
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag.id}
              href={`${entityPath(entity)}/pr?tag=${tag.slug}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
            >
              {tag.name}
              <span className="text-gray-400">{tag.count}</span>
            </Link>
          ))}
          {tags.length > 6 && (
            <Link
              href={`${entityPath(entity)}/pr`}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              +{tags.length - 6} more
            </Link>
          )}
        </div>
      )}

      {/* Activity Timeline */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Activity (last 12 months)</span>
          <span className="text-xs text-gray-500">{totalActivity} changes</span>
        </div>
        <ActivitySparkline activity={activityData} />
        <MonthLabels activity={activityData} />
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-200">
          {activeTypes.slice(0, 4).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${typeConfig[type].brickColor}`} />
              <span className="text-[10px] text-gray-500">{typeConfig[type].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
