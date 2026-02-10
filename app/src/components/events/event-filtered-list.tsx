'use client'

import { useState, useMemo } from 'react'
import { FilterButton } from '@/components/custom-ui/buttons'
import { EventCardSmall } from '@/components/events/event-cards'
import { EventDaysOfTheYearHeatmap } from '@/components/events/event-heatmaps'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventFilteredListProps {
  events: Event[]
}

function CompactEventList({ events }: { events: Event[] }) {
  if (events.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-max grid-rows-6 gap-x-6 gap-y-0 w-max">
        {events.slice(0, 30).map((event) => (
          <EventCardSmall key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export function EventFilteredList({ events }: EventFilteredListProps) {
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

  const filteredEvents = useMemo(
    () => events.filter((e) => selectedTypes.has(e.type)),
    [events, selectedTypes]
  )

  if (events.length === 0) {
    return <p className="text-muted-foreground">No events to display.</p>
  }

  return (
    <div>
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

      <EventDaysOfTheYearHeatmap events={filteredEvents} />
      <div className="mt-6">
        <CompactEventList events={filteredEvents} />
      </div>
    </div>
  )
}
