import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventsByEntity } from '@/lib/actions/events'
import { db } from '@/lib/db/client'
import { entities } from '@/lib/db/schema'
import { EventsClient } from './events-client'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'

interface EventsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity to verify it exists
  const [entity] = await db
    .select()
    .from(entities)
    .where(idStartsWith(entities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch events for this entity
  const events = await getEventsByEntity(entity.id)

  return (
    <div className="py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href={entityPath(entity)} className="text-link hover:underline">
          ← Back to {entity.name}
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-gray-600">
          All events for {entity.name}
        </p>
      </div>

      {/* Client component for filtering */}
      <EventsClient events={events} />
    </div>
  )
}
