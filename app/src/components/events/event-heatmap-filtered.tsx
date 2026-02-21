'use client'

import { useState, useMemo, useCallback } from 'react'
import { FilterBarSmall } from '@/components/custom-ui/filter-bars'
import { EventHeatmap, type HeatmapDayData } from './event-heatmap'

export interface EventHeatmapData {
  id: string
  title: string
  type: string
  date: string
}

interface EventHeatmapFilteredProps {
  events: EventHeatmapData[]
}

function groupEventsByDate(events: EventHeatmapData[]): HeatmapDayData[] {
  const byDate = new Map<string, { date: Date; value: number }>()

  events.forEach((event) => {
    const existing = byDate.get(event.date)
    if (existing) {
      existing.value += 1
    } else {
      byDate.set(event.date, { date: new Date(event.date), value: 1 })
    }
  })

  return Array.from(byDate.values())
}

export function EventHeatmapFiltered({ events }: EventHeatmapFilteredProps) {
  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type))
    return Array.from(types).sort()
  }, [events])

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set(eventTypes))

  const filteredEvents = useMemo(
    () => events.filter((e) => selectedTypes.has(e.type)),
    [events, selectedTypes]
  )

  const heatmapData = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents])

  const handleDayClick = useCallback(
    (date: Date, value: number) => {
      const dateStr = date.toISOString().split('T')[0]
      const eventsOnDate = filteredEvents.filter((e) => e.date === dateStr)
      const titles = eventsOnDate.map((e) => `• ${e.title}`).join('\n')
      alert(`${date.toLocaleDateString()} - ${value} event(s):\n\n${titles}`)
    },
    [filteredEvents]
  )

  return (
    <div>
      <FilterBarSmall
        items={eventTypes}
        selected={selectedTypes}
        onSelectedChange={setSelectedTypes}
        className="mb-4"
      />
      <EventHeatmap data={heatmapData} onDayClick={handleDayClick} />
    </div>
  )
}
