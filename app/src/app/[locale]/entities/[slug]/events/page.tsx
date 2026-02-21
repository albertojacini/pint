import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db/client'
import { entities } from '@/lib/db/schema'
import { getEventsByEntity } from '@/lib/actions/events'
import { EventCardMedium } from '@/components/events/event-cards'
import { EventHeatmapLoader } from '@/components/events/loaders'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { PageHeader } from '@/components/custom-ui/section'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'

interface EventsPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventsPage({ params }: EventsPageProps) {
  const t = await getTranslations('events')
  const te = await getTranslations('entities')
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  const [entity] = await db
    .select()
    .from(entities)
    .where(idStartsWith(entities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  const events = await getEventsByEntity(entity.id)

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: te('breadcrumb'), href: '/entities' },
          { label: entity.name, href: entityPath(entity) },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        title={t('title')}
        description={t('eventCount', { name: entity.name, count: events.length })}
      />

      <div className="mb-8">
        <EventHeatmapLoader entityId={entity.id} showFilters={false} />
      </div>

      {events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCardMedium key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 text-center">{t('noEventsFound')}</p>
        </div>
      )}
    </div>
  )
}
