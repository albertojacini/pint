import { getEvents } from '@/lib/actions/events'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Events</h1>
        <p className="text-muted-foreground">
          Temporal occurrences that shape provisions
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found. Run the seed script to populate data.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 flex gap-2">
                  <Badge variant="outline" className="text-xs font-mono">EVENT</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="text-sm">
                  {format(new Date(event.occurredAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {event.administrationName && event.entityName && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Administration: </span>
                      <Link
                        href={`/administrations/${event.administrationId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {event.administrationName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Entity: </span>
                      <Link
                        href={`/entities/${event.entityId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {event.entityName}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {event.entityType}
                      </Badge>
                    </div>
                  </div>
                )}

                {!event.administrationName && (
                  <div className="text-sm text-muted-foreground">
                    Independent event (no administration)
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
