'use client'

import { useState } from 'react'

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

  const [selectedMonth, setSelectedMonth] = useState<MonthGroup | null>(null)
  const monthGroups = groupChangesByMonth(changes, maxMonths)
  const maxHeight = 15 // Max bar height in pixels (75% reduction from 60)

  // Find max items to calculate relative heights
  const maxItemCount = Math.max(...monthGroups.map(m => m.items.length), 1)

  return (
    <div className="mb-3 relative">
      {/* Compact density chart - 120px wide, 12 vertical bars with 1px gaps */}
      <div className="flex items-end gap-[1px]" style={{ width: '120px', height: maxHeight }}>
        {monthGroups.map((month, monthIndex) => {
          // Calculate bar height proportional to item count
          const barHeight = (month.items.length / maxItemCount) * maxHeight

          const isSelected = selectedMonth?.month === month.month && selectedMonth?.year === month.year

          return (
            <div key={`${month.month}-${month.year}`} className="flex-1 relative">
              <div
                className={`w-full hover:bg-gray-500 transition-colors cursor-pointer ${
                  isSelected ? 'bg-gray-500' : 'bg-gray-600'
                }`}
                style={{ height: barHeight || 2 }} // Minimum 2px if there are items
                onClick={() => {
                  if (month.items.length > 0) {
                    setSelectedMonth(selectedMonth?.month === month.month && selectedMonth?.year === month.year ? null : month)
                  }
                }}
              />

              {/* Tooltip-style popover */}
              {isSelected && month.items.length > 0 && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3 bg-popover text-popover-foreground rounded-md shadow-md border border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />

                  <div className="font-semibold mb-2 text-sm">
                    {month.month} {month.year} ({month.items.length} changes)
                  </div>
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                    {month.items.map((item, idx) => (
                      <li key={idx} className="text-muted-foreground leading-relaxed">
                        • {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Click outside to close */}
      {selectedMonth && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedMonth(null)}
        />
      )}
    </div>
  )
}
