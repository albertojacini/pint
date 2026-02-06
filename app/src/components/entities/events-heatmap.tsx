'use client'

import { useState, useMemo } from 'react'
import { CalendarHeatmap } from '@/components/custom-ui/calendar-heatmap'
import { FilterButton } from '@/components/custom-ui/buttons'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  createdAt: Date
  administrationId: string | null
  administrationName: string | null
}

interface EventsHeatmapProps {
  events: Event[]
  onDateClick?: (date: Date, events: Event[]) => void
}

export function EventsHeatmap({ events, onDateClick }: EventsHeatmapProps) {
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
      const dateStr = new Date(event.createdAt).toISOString().split('T')[0]
      const existing = byDate.get(dateStr)
      if (existing) {
        existing.value += 1
      } else {
        byDate.set(dateStr, { date: new Date(event.createdAt), value: 1 })
      }
    })

    return Array.from(byDate.values())
  }, [events, selectedTypes])

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((e) => {
      const eventDateStr = new Date(e.createdAt).toISOString().split('T')[0]
      return eventDateStr === dateStr && selectedTypes.has(e.type)
    })
  }

  if (events.length === 0) {
    return <p className="text-muted-foreground">No events to display.</p>
  }

  return (
    <div>
      {/* Filters */}
      {eventTypes.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-4">
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
      <CalendarHeatmap
        data={heatmapData}
        onDateClick={(date: Date, value: number) => {
          if (onDateClick) {
            onDateClick(date, getEventsForDate(date))
          } else {
            const eventsOnDate = getEventsForDate(date)
            const titles = eventsOnDate.map((e) => `• ${e.title}`).join('\n')
            alert(`${date.toLocaleDateString()} - ${value} event(s):\n\n${titles}`)
          }
        }}
      />
    </div>
  )
}
