'use server'

import { db } from '@/lib/db/client'
import { events, administrations, politicalEntities } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getEvents() {
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      type: events.type,
      createdAt: events.createdAt,
      administrationId: administrations.id,
      administrationName: administrations.name,
      entityId: politicalEntities.id,
      entityName: politicalEntities.name,
      entityType: politicalEntities.type,
    })
    .from(events)
    .leftJoin(administrations, eq(events.administrationId, administrations.id))
    .leftJoin(politicalEntities, eq(administrations.entityId, politicalEntities.id))
    .orderBy(desc(events.createdAt))

  return allEvents
}

export async function getEventsByAdministration(administrationId: string) {
  const administrationEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      type: events.type,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.administrationId, administrationId))
    .orderBy(desc(events.createdAt))

  return administrationEvents
}

export async function getEventsByEntity(entityId: string) {
  const entityEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      type: events.type,
      createdAt: events.createdAt,
      administrationId: administrations.id,
      administrationName: administrations.name,
    })
    .from(events)
    .leftJoin(administrations, eq(events.administrationId, administrations.id))
    .where(eq(administrations.entityId, entityId))
    .orderBy(desc(events.createdAt))

  return entityEvents
}
