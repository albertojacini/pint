import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { entityPath } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  occurredAt: Date
  administrationId: string | null
  administrationName: string | null
}

interface EventsOverviewProps {
  entity: { id: string; slug: string }
  events: Event[]
}

export function EventsOverview({ entity, events }: EventsOverviewProps) {
  if (events.length === 0) return <h1>EVENTS WILL GO HERE!!!!</h1>

  return (
    <div className="bg-white p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recent Events</h2>
        <Link
          href={`${entityPath(entity)}/events`}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View all
        </Link>
      </div>

      {/* Most recent 10 events */}
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
                {format(new Date(event.occurredAt), 'PPP')}
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-2">{event.title}</h3>

            {event.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
            )}

            {event.administrationName && event.administrationId && (
              <div className="text-xs text-gray-500">
                Administration:{' '}
                <Link
                  href={`/administrations/${event.administrationId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {event.administrationName}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
