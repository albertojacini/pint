'use server'

import { db } from '@/lib/db/client'
import { events, changes } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, max, sql } from 'drizzle-orm'

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
  limit?: number
}

export async function getEventsByEntity(entityId: string, options?: GetEventsByEntityOptions) {
  const conditions = [
    eq(changes.targetType, 'entity'),
    eq(changes.targetId, entityId),
  ]

  if (options?.startDate) conditions.push(gte(events.date, options.startDate))
  if (options?.endDate) conditions.push(lte(events.date, options.endDate))

  let query = db
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
    .$dynamic()

  if (options?.limit) query = query.limit(options.limit)

  return await query
}

export async function getMostRelevantEventsByEntity(entityId: string, limit = 5) {
  const results = await db
    .select({
      id: events.id,
      title: events.title,
      descriptionShort: events.descriptionShort,
      type: events.type,
      date: events.date,
      relevance: max(changes.relevance).as('max_relevance'),
    })
    .from(events)
    .innerJoin(changes, eq(changes.eventId, events.id))
    .where(and(
      eq(changes.targetType, 'entity'),
      eq(changes.targetId, entityId),
    ))
    .groupBy(events.id)
    .orderBy(sql`max_relevance desc nulls last`)
    .limit(limit)

  return results
}
