import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { entityPath } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventsOverviewProps {
  entity: { id: string; slug: string }
  events: Event[]
}

// Re-export for use in page (view all link)
export function getEventsViewAllLink(entity: { id: string; slug: string }) {
  return `${entityPath(entity)}/events`
}

export function EventsOverview({ entity, events }: EventsOverviewProps) {
  if (events.length === 0) return null

  return (
    <div className="space-y-4">
        {events.slice(0, 10).map((event) => (
          <div
            key={event.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  EVENT
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {event.type}
                </Badge>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {format(new Date(event.date), 'PPP')}
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-2">{event.title}</h3>

            {event.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
            )}
          </div>
        ))}
    </div>
  )
}
