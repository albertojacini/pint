'use client'

import { useEffect, useRef } from 'react'
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'

export interface CalendarHeatmapDataPoint {
  date: Date
  value: number
}

export interface CalendarHeatmapProps {
  data: CalendarHeatmapDataPoint[]
  onDateClick?: (date: Date, value: number) => void
  className?: string
}

export function CalendarHeatmap({ data, onDateClick, className }: CalendarHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calRef = useRef<CalHeatmap | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (calRef.current) {
      calRef.current.destroy()
    }

    const formattedData = data.map((d) => ({
      date: d.date instanceof Date ? d.date.toISOString() : d.date,
      value: d.value,
    }))

    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    const cal = new CalHeatmap()
    calRef.current = cal

    cal.paint({
      itemSelector: containerRef.current,
      data: {
        source: formattedData,
        x: 'date',
        y: 'value',
      },
      date: {
        start: oneYearAgo,
      },
      range: 12,
      domain: {
        type: 'month',
        label: { text: 'MMM', position: 'top' },
      },
      subDomain: {
        type: 'day',
        width: 12,
        height: 12,
        radius: 2,
      },
      scale: {
        color: {
          type: 'linear',
          scheme: 'Greens',
          domain: [0, Math.max(...data.map((d) => d.value), 1)],
        },
      },
    })

    if (onDateClick) {
      cal.on('click', (...args: unknown[]) => {
        const [, timestamp, value] = args as [unknown, number, number]
        onDateClick(new Date(timestamp), value || 0)
      })
    }

    return () => {
      if (calRef.current) {
        calRef.current.destroy()
        calRef.current = null
      }
    }
  }, [data, onDateClick])

  return (
    <div className={className}>
      <div ref={containerRef} className="overflow-x-auto" />
    </div>
  )
}
