import Link from 'next/link'
import { entityPath } from '@/lib/utils'
import type { ProvisionAggregates } from '@/lib/actions/provisions'
import type { ChangeWithContext } from '@/lib/actions/changes'

interface ProvisionsOverviewProps {
  entity: { id: string; slug: string }
  aggregates: ProvisionAggregates
  changes?: ChangeWithContext[]
}

// Re-export for use in page (view all link)
export function getProvisionsViewAllLink(entity: { id: string; slug: string }) {
  return `${entityPath(entity)}/pr`
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
  infrastructure: { icon: '🏗️', label: 'Infrastructure', color: 'bg-cyan-50 border-cyan-200', brickColor: 'bg-cyan-400' },
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

// Convert changes data to activity format grouped by month
function changesToActivity(changes: ChangeWithContext[]): MonthActivity[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Initialize 12 months structure
  const now = new Date()
  const result: MonthActivity[] = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: months[date.getMonth()],
      year: date.getFullYear(),
      items: [],
    })
  }

  // Group changes by month
  for (const change of changes) {
    const createdDate = change.createdAt ? new Date(change.createdAt) : null
    if (!createdDate) continue

    // Find matching month bucket
    for (const monthData of result) {
      const monthStart = new Date(monthData.year, months.indexOf(monthData.month), 1)
      const monthEnd = new Date(monthData.year, months.indexOf(monthData.month) + 1, 0)

      if (createdDate >= monthStart && createdDate <= monthEnd) {
        // Get provision type from the change data or default to regulation
        // Use first type if multiple types exist
        const provisionType = (change.targetProvisionTypes?.[0] as ProvisionType) || 'regulation'

        monthData.items.push({
          type: provisionType,
          title: change.targetTitle || change.description || 'Unknown',
          action: 'updated',
        })
        break
      }
    }
  }

  return result
}

// Consistent type order for stacking
const typeOrder: ProvisionType[] = ['taxation', 'ownership', 'contract', 'regulation', 'allocation', 'designation', 'infrastructure']

// Sparkline component
function ActivitySparkline({ activity }: { activity: MonthActivity[] }) {
  const maxHeight = 48 // pixels
  const brickHeight = 8

  return (
    <div className="flex items-end gap-1 h-16">
      {activity.map((month, monthIndex) => {
        // Sort items by type order for consistent stacking
        const sortedItems = [...month.items].sort(
          (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
        )

        return (
          <div
            key={`${month.month}-${month.year}`}
            className="flex-1 flex flex-col-reverse gap-0.5 min-w-0"
            style={{ height: maxHeight }}
          >
            {sortedItems.map((item, itemIndex) => (
              <div
                key={`${monthIndex}-${itemIndex}`}
                className={`w-full rounded-sm ${typeConfig[item.type].brickColor} hover:opacity-80 cursor-pointer transition-opacity`}
                style={{ height: brickHeight }}
                title={`${item.title} (${item.action}) - ${month.month} ${month.year}`}
              />
            ))}
          </div>
        )
      })}
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

export function ProvisionsOverview({ entity, aggregates, changes = [] }: ProvisionsOverviewProps) {
  const { total, byType, tags } = aggregates

  if (total === 0) return null

  // Get types with count > 0, ordered by count
  const activeTypes = (Object.keys(byType) as Array<keyof typeof byType>)
    .filter((type) => byType[type].count > 0)
    .sort((a, b) => byType[b].count - byType[a].count)

  // Use real changes data if available
  const activityData = changesToActivity(changes)
  const totalActivity = changes.length

  return (
    <>
      {/* Count badge */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-gray-700">{total}</span>
        <span className="text-sm text-muted-foreground">provisions</span>
      </div>

      {/* Type Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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

              {/* Type-specific metrics - removed after extra_data removal */}
              <div className="text-xs text-gray-400">
                —
              </div>
            </Link>
          )
        })}
      </div>

      {/* Tags Row */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
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
    </>
  )
}
