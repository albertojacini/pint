'use server'

import { db } from '@/lib/db/client'
import { events, changes } from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

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

interface GetEventsByEntityOptions {
  startDate?: string
  endDate?: string
}

export async function getEventsByEntity(entityId: string, options?: GetEventsByEntityOptions) {
  const conditions = [
    eq(changes.targetType, 'entity'),
    eq(changes.targetId, entityId),
  ]

  if (options?.startDate) conditions.push(gte(events.date, options.startDate))
  if (options?.endDate) conditions.push(lte(events.date, options.endDate))

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
    .where(and(...conditions))
    .orderBy(desc(events.date))

  return entityEvents
}
