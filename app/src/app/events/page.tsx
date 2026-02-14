export const dynamic = 'force-dynamic'

import { getEvents } from '@/lib/actions/events'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { SubsectionTitle } from '@/components/custom-ui/typography'
import { PageHeader } from '@/components/custom-ui/section'

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div>
      <PageHeader
        title="Events"
        description="Temporal occurrences that shape provisions"
      />

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
                <SubsectionTitle>{event.title}</SubsectionTitle>
                <CardDescription className="text-sm">
                  {format(new Date(event.date), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
