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
  const monthlyContainerRef = useRef<HTMLDivElement>(null)
  const dailyContainerRef = useRef<HTMLDivElement>(null)
  const monthlyCalRef = useRef<CalHeatmap | null>(null)
  const dailyCalRef = useRef<CalHeatmap | null>(null)

  useEffect(() => {
    if (!monthlyContainerRef.current || !dailyContainerRef.current) return

    // Clean up existing instances
    if (monthlyCalRef.current) {
      monthlyCalRef.current.destroy()
    }
    if (dailyCalRef.current) {
      dailyCalRef.current.destroy()
    }

    // Transform data for cal-heatmap format (timestamp -> value)
    const formattedData = data.map((d) => ({
      date: d.date instanceof Date ? d.date.toISOString() : d.date,
      value: d.value,
    }))

    const now = new Date()
    const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    // Monthly heatmap (last 10 years)
    const monthlyCal = new CalHeatmap()
    monthlyCalRef.current = monthlyCal

    monthlyCal.paint({
      itemSelector: monthlyContainerRef.current,
      data: {
        source: formattedData,
        x: 'date',
        y: 'value',
      },
      date: {
        start: tenYearsAgo,
      },
      range: 10,
      domain: {
        type: 'year',
        label: { text: 'YYYY', position: 'top' },
      },
      subDomain: {
        type: 'month',
        width: 15,
        height: 15,
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
      monthlyCal.on('click', (...args: unknown[]) => {
        const [, timestamp, value] = args as [unknown, number, number]
        onDateClick(new Date(timestamp), value || 0)
      })
    }

    // Daily heatmap (last year)
    const dailyCal = new CalHeatmap()
    dailyCalRef.current = dailyCal

    dailyCal.paint({
      itemSelector: dailyContainerRef.current,
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
      dailyCal.on('click', (...args: unknown[]) => {
        const [, timestamp, value] = args as [unknown, number, number]
        onDateClick(new Date(timestamp), value || 0)
      })
    }

    return () => {
      if (monthlyCalRef.current) {
        monthlyCalRef.current.destroy()
        monthlyCalRef.current = null
      }
      if (dailyCalRef.current) {
        dailyCalRef.current.destroy()
        dailyCalRef.current = null
      }
    }
  }, [data, onDateClick])

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-2">Monthly activity (last 10 years)</div>
        <div ref={monthlyContainerRef} className="overflow-x-auto" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-2">Daily activity (last year)</div>
        <div ref={dailyContainerRef} className="overflow-x-auto" />
      </div>
    </div>
  )
}
