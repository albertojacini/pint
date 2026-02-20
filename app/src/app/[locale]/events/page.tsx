export const dynamic = 'force-dynamic'

import { getEvents } from '@/lib/actions/events'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { SectionL2Title } from '@/components/custom-ui/typography'
import { PageHeader } from '@/components/custom-ui/section'
import { getTranslations } from 'next-intl/server'

export default async function EventsPage() {
  const t = await getTranslations('events')
  const events = await getEvents()

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noEvents')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 flex gap-2">
                  <Badge variant="outline" className="text-xs font-mono">{t('event')}</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                <SectionL2Title>{event.title}</SectionL2Title>
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
