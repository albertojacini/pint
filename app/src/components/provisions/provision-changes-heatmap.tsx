'use client'

import { useMemo } from 'react'
import type { ChangeWithContext } from '@/lib/actions/changes'

interface ProvisionChangesHeatmapProps {
  changes: ChangeWithContext[]
}

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

// Color scale based on relevance (1-10), using positive (green) with varying opacity
function getColor(relevance: number | null): string {
  if (relevance === null) return 'hsl(var(--muted))'
  if (relevance <= 2) return 'hsl(var(--positive) / 0.2)'
  if (relevance <= 4) return 'hsl(var(--positive) / 0.4)'
  if (relevance <= 6) return 'hsl(var(--positive) / 0.6)'
  if (relevance <= 8) return 'hsl(var(--positive) / 0.8)'
  return 'hsl(var(--positive))'
}

export function ProvisionChangesHeatmap({ changes }: ProvisionChangesHeatmapProps) {
  // Build the heatmap data
  const { years, dataMap, changesByCell } = useMemo(() => {
    // Group changes by year-month
    const map = new Map<string, number>() // "YYYY-MM" -> max relevance
    const cellChanges = new Map<string, ChangeWithContext[]>() // "YYYY-MM" -> changes

    changes.forEach((change) => {
      const date = change.effectiveDate || change.createdAt
      if (!date) return

      const d = new Date(date)
      const year = d.getFullYear()
      const month = d.getMonth() // 0-11
      const key = `${year}-${month}`

      const relevance = change.relevance || 5
      const existing = map.get(key)
      if (!existing || relevance > existing) {
        map.set(key, relevance)
      }

      // Track changes for tooltips
      const existingChanges = cellChanges.get(key) || []
      existingChanges.push(change)
      cellChanges.set(key, existingChanges)
    })

    // Find year range
    const dates = changes
      .map((c) => c.effectiveDate || c.createdAt)
      .filter((d): d is Date => d !== null)
      .map((d) => new Date(d))

    if (dates.length === 0) return { years: [], dataMap: map, changesByCell: cellChanges }

    const minYear = Math.min(...dates.map((d) => d.getFullYear()))
    const maxYear = Math.max(...dates.map((d) => d.getFullYear()))

    const yearList: number[] = []
    for (let y = minYear; y <= maxYear; y++) {
      yearList.push(y)
    }

    return { years: yearList, dataMap: map, changesByCell: cellChanges }
  }, [changes])

  if (changes.length === 0 || years.length === 0) return null

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-10" />
              {years.map((year) => (
                <th key={year} className="px-1 py-1 text-xs font-medium text-muted-foreground text-center">{String(year).slice(-2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((monthName, monthIndex) => (
              <tr key={monthIndex}>
                <td className="pr-2 py-0.5 text-xs text-muted-foreground text-right">
                  {monthName}
                </td>
                {years.map((year) => {
                  const key = `${year}-${monthIndex}`
                  const relevance = dataMap.get(key) || null
                  const cellChanges = changesByCell.get(key) || []
                  const hasData = relevance !== null

                  // Build tooltip
                  const tooltip = cellChanges.length > 0
                    ? cellChanges
                        .map((c) => c.eventTitle || c.description || 'Modifica')
                        .join('\n')
                    : undefined

                  return (
                    <td key={year} className="p-0.5">
                      <div
                        className={`w-5 h-5 rounded-sm transition-colors ${
                          hasData ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''
                        }`}
                        style={{ backgroundColor: getColor(relevance) }}
                        title={tooltip}
                      >
                        {cellChanges.length > 1 && (
                          <span className="flex items-center justify-center h-full text-[9px] font-medium text-white/80">
                            {cellChanges.length}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Rilevanza:</span>
        <div className="flex items-center gap-1">
          <span>Bassa</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--positive) / 0.2)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--positive) / 0.4)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--positive) / 0.6)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--positive) / 0.8)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--positive))' }} />
          </div>
          <span>Alta</span>
        </div>
      </div>
    </div>
  )
}
