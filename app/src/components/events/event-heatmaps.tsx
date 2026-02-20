'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'
import { FilterBarSmall } from '@/components/custom-ui/filter-bars'

interface EventHeatmapData {
  id: string
  title: string
  type: string
  date: string
}

interface EventDaysOfTheYearHeatmapProps {
  events: EventHeatmapData[]
  showFilters?: boolean
}

export function EventDaysOfTheYearHeatmap({ events, showFilters = true }: EventDaysOfTheYearHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calRef = useRef<CalHeatmap | null>(null)

  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type))
    return Array.from(types).sort()
  }, [events])

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set(eventTypes))

  const filteredEvents = useMemo(
    () => events.filter((e) => selectedTypes.has(e.type)),
    [events, selectedTypes]
  )

  const heatmapData = useMemo(() => {
    const byDate = new Map<string, { date: Date; value: number }>()

    filteredEvents.forEach((event) => {
      const existing = byDate.get(event.date)
      if (existing) {
        existing.value += 1
      } else {
        byDate.set(event.date, { date: new Date(event.date), value: 1 })
      }
    })

    return Array.from(byDate.values())
  }, [filteredEvents])

  useEffect(() => {
    if (!containerRef.current) return

    if (calRef.current) {
      calRef.current.destroy()
    }

    const formattedData = heatmapData.map((d) => ({
      date: d.date instanceof Date ? d.date.toISOString() : d.date,
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
          domain: [0, Math.max(...heatmapData.map((d) => d.value), 1)],
        },
      },
    })

    cal.on('click', (...args: unknown[]) => {
      const [, timestamp, value] = args as [unknown, number, number]
      const clickedDate = new Date(timestamp)
      const dateStr = clickedDate.toISOString().split('T')[0]
      const eventsOnDate = filteredEvents.filter((e) => e.date === dateStr)
      const titles = eventsOnDate.map((e) => `• ${e.title}`).join('\n')
      alert(`${clickedDate.toLocaleDateString()} - ${value || 0} event(s):\n\n${titles}`)
    })

    return () => {
      if (calRef.current) {
        calRef.current.destroy()
        calRef.current = null
      }
    }
  }, [heatmapData])

  return (
    <div>
      {showFilters && (
        <FilterBarSmall
          items={eventTypes}
          selected={selectedTypes}
          onSelectedChange={setSelectedTypes}
          className="mb-4"
        />
      )}
      <div ref={containerRef} className="overflow-x-auto" />
    </div>
  )
}
