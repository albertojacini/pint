'use server'

import { db } from '@/lib/db/client'
import { events, changes } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function getEvents() {
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      type: events.type,
      date: events.date,
    })
    .from(events)
    .orderBy(desc(events.date))

  return allEvents
}

export async function getEventsByEntity(entityId: string) {
  const entityEvents = await db
    .selectDistinct({
      id: events.id,
      title: events.title,
      description: events.description,
      descriptionShort: events.descriptionShort,
      type: events.type,
      date: events.date,
    })
    .from(events)
    .innerJoin(changes, eq(changes.eventId, events.id))
    .where(and(
      eq(changes.targetType, 'entity'),
      eq(changes.targetId, entityId),
    ))
    .orderBy(desc(events.date))

  return entityEvents
}
