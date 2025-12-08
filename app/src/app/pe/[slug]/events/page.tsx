import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventsByEntity } from '@/lib/actions/events'
import { db } from '@/lib/db/client'
import { politicalEntities, administrations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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
    .from(politicalEntities)
    .where(idStartsWith(politicalEntities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch events for this entity
  const events = await getEventsByEntity(entity.id)

  // Fetch all administrations for this entity for the filter dropdown
  const entityAdministrations = await db
    .select({
      id: administrations.id,
      name: administrations.name,
    })
    .from(administrations)
    .where(eq(administrations.entityId, entity.id))

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href={entityPath(entity)} className="text-blue-600 hover:underline">
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
      <EventsClient events={events} administrations={entityAdministrations} />
    </div>
  )
}
