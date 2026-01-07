'use client'

interface ChangeItem {
  timestamp: string
  label: string
}

interface ProvisionChangesDensityProps {
  changes: ChangeItem[]
  maxMonths?: number
}

interface MonthGroup {
  month: string // "Jan", "Feb", etc.
  year: number
  items: ChangeItem[]
}

// Helper to group changes by month for the last N months
function groupChangesByMonth(changes: ChangeItem[], maxMonths: number): MonthGroup[] {
  const now = new Date()
  const monthGroups: MonthGroup[] = []

  // Generate last N months
  for (let i = maxMonths - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthGroups.push({
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      items: [],
    })
  }

  // Group changes into months
  changes.forEach((change) => {
    const changeDate = new Date(change.timestamp)
    const monthGroup = monthGroups.find(
      (g) =>
        g.year === changeDate.getFullYear() &&
        g.month === changeDate.toLocaleString('en-US', { month: 'short' })
    )
    if (monthGroup) {
      monthGroup.items.push(change)
    }
  })

  return monthGroups
}

export function ProvisionChangesDensity({ changes, maxMonths = 12 }: ProvisionChangesDensityProps) {
  if (changes.length === 0) return null

  const monthGroups = groupChangesByMonth(changes, maxMonths)
  const maxHeight = 48 // pixels
  const brickHeight = 8

  return (
    <div className="mb-3">
      <div className="text-xs text-muted-foreground mb-2">Recent Changes</div>

      {/* Density chart */}
      <div className="flex items-end gap-1 h-12">
        {monthGroups.map((month, monthIndex) => (
          <div
            key={`${month.month}-${month.year}`}
            className="flex-1 flex flex-col-reverse gap-0.5 min-w-0"
            style={{ height: maxHeight }}
          >
            {month.items.map((item, itemIndex) => (
              <div
                key={`${monthIndex}-${itemIndex}`}
                className="w-full rounded-sm bg-primary hover:opacity-80 cursor-pointer transition-opacity"
                style={{ height: brickHeight }}
                title={`${item.label} - ${month.month} ${month.year}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Month labels */}
      <div className="flex gap-1 mt-1">
        {monthGroups.map((month) => (
          <div
            key={`label-${month.month}-${month.year}`}
            className="flex-1 text-center text-[10px] text-gray-400 min-w-0 truncate"
          >
            {month.month}
          </div>
        ))}
      </div>
    </div>
  )
}
