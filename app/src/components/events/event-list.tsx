'use client'

import { EventCardSmall } from '@/components/events/event-cards'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventListProps {
  events: Event[]
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-muted-foreground">No events to display.</p>
  }

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
