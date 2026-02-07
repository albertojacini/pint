'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'
import { FilterButton } from '@/components/custom-ui/buttons'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventsHeatmapProps {
  events: Event[]
  onDateClick?: (date: Date, events: Event[]) => void
}

export function EventsHeatmap({ events, onDateClick }: EventsHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calRef = useRef<CalHeatmap | null>(null)

  // Extract unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type))
    return Array.from(types).sort()
  }, [events])

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set(eventTypes))

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Filter events and aggregate by date
  const heatmapData = useMemo(() => {
    const filtered = events.filter((e) => selectedTypes.has(e.type))

    const byDate = new Map<string, { date: Date; value: number }>()

    filtered.forEach((event) => {
      const existing = byDate.get(event.date)
      if (existing) {
        existing.value += 1
      } else {
        byDate.set(event.date, { date: new Date(event.date), value: 1 })
      }
    })

    return Array.from(byDate.values())
  }, [events, selectedTypes])

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((e) => e.date === dateStr && selectedTypes.has(e.type))
  }

  // Initialize and update cal-heatmap
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
    // Start from the first day of the month, one year ago
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
      // 14 months: 12 past + current month + next month
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
      if (onDateClick) {
        onDateClick(clickedDate, getEventsForDate(clickedDate))
      } else {
        const eventsOnDate = getEventsForDate(clickedDate)
        const titles = eventsOnDate.map((e) => `• ${e.title}`).join('\n')
        alert(`${clickedDate.toLocaleDateString()} - ${value || 0} event(s):\n\n${titles}`)
      }
    })

    return () => {
      if (calRef.current) {
        calRef.current.destroy()
        calRef.current = null
      }
    }
  }, [heatmapData, onDateClick])

  if (events.length === 0) {
    return <p className="text-muted-foreground">No events to display.</p>
  }

  return (
    <div>
      {/* Filters */}
      {eventTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          <FilterButton
            selected={selectedTypes.size === eventTypes.length}
            onSelectedChange={() => {
              if (selectedTypes.size === eventTypes.length) {
                setSelectedTypes(new Set())
              } else {
                setSelectedTypes(new Set(eventTypes))
              }
            }}
          >
            All
          </FilterButton>
          <div className="w-px bg-border mx-1" />
          {eventTypes.map((type) => (
            <FilterButton
              key={type}
              selected={selectedTypes.has(type)}
              onSelectedChange={() => toggleType(type)}
            >
              {type}
            </FilterButton>
          ))}
        </div>
      )}

      {/* Heatmap */}
      <div ref={containerRef} className="overflow-x-auto" />
    </div>
  )
}
