'use client'

import { useEffect, useRef } from 'react'
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'

export interface HeatmapDayData {
  date: Date
  value: number
}

interface EventHeatmapProps {
  data: HeatmapDayData[]
  onDayClick?: (date: Date, value: number) => void
}

export function EventHeatmap({ data, onDayClick }: EventHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calRef = useRef<CalHeatmap | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (calRef.current) {
      calRef.current.destroy()
    }

    const formattedData = data.map((d) => ({
      date: d.date.toISOString(),
      value: d.value,
    }))

    const now = new Date()
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)

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
        start: startDate,
      },
      range: 14,
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
      animationDuration: 0,
      scale: {
        color: {
          type: 'linear',
          scheme: 'Greens',
          domain: [0, Math.max(...data.map((d) => d.value), 1)],
        },
      },
    })

    if (onDayClick) {
      cal.on('click', (...args: unknown[]) => {
        const [, timestamp, value] = args as [unknown, number, number]
        onDayClick(new Date(timestamp), value || 0)
      })
    }

    return () => {
      if (calRef.current) {
        calRef.current.destroy()
        calRef.current = null
      }
    }
  }, [data, onDayClick])

  return <div ref={containerRef} className="overflow-x-auto" />
}
