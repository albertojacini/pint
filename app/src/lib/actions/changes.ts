'use server'

import { db } from '@/lib/db/client'
import { changes, events, provisions, administrations, provisionTypes, provisionTypeAssociations } from '@/lib/db/schema'
import { eq, desc, and, or, inArray, sql } from 'drizzle-orm'

export interface ChangeWithContext {
  id: string
  description: string | null
  effectiveAt: Date | null
  targetType: string
  targetId: string
  targetTitle: string | null
  targetProvisionTypes: string[] // provision type codes (taxation, ownership, etc.)
  eventId: string | null
  eventTitle: string | null
  eventType: string | null
  occurredAt: Date | null
}

/**
 * Get all changes related to an entity:
 * - Changes targeting provisions owned by the entity
 * - Changes targeting the entity itself
 * - Changes targeting administrations of this entity
 */
export async function getChangesByEntity(entityId: string): Promise<ChangeWithContext[]> {
  // First, get all provision IDs for this entity
  const entityProvisions = await db
    .select({ id: provisions.id })
    .from(provisions)
    .where(eq(provisions.entityId, entityId))

  const provisionIds = entityProvisions.map((p) => p.id)

  // Get all administration IDs for this entity
  const entityAdministrations = await db
    .select({ id: administrations.id })
    .from(administrations)
    .where(eq(administrations.entityId, entityId))

  const administrationIds = entityAdministrations.map((a) => a.id)

  // Build conditions for the changes query
  const conditions = []

  // Changes targeting provisions of this entity
  if (provisionIds.length > 0) {
    conditions.push(
      and(eq(changes.targetType, 'provision'), inArray(changes.targetId, provisionIds))
    )
  }

  // Changes targeting the entity itself
  conditions.push(and(eq(changes.targetType, 'entity'), eq(changes.targetId, entityId)))

  // Changes targeting administrations of this entity
  if (administrationIds.length > 0) {
    conditions.push(
      and(eq(changes.targetType, 'administration'), inArray(changes.targetId, administrationIds))
    )
  }

  if (conditions.length === 0) {
    return []
  }

  // Query changes with event context
  const result = await db
    .select({
      id: changes.id,
      description: changes.description,
      effectiveAt: changes.effectiveAt,
      targetType: changes.targetType,
      targetId: changes.targetId,
      eventId: events.id,
      eventTitle: events.title,
      eventType: events.type,
      occurredAt: events.occurredAt,
    })
    .from(changes)
    .leftJoin(events, eq(changes.eventId, events.id))
    .where(or(...conditions))
    .orderBy(desc(changes.effectiveAt))

  // Enrich with target titles and provision types
  const enrichedChanges: ChangeWithContext[] = await Promise.all(
    result.map(async (change) => {
      let targetTitle: string | null = null
      let targetProvisionTypes: string[] = []

      if (change.targetType === 'provision') {
        const [provision] = await db
          .select({ title: provisions.title })
          .from(provisions)
          .where(eq(provisions.id, change.targetId))
          .limit(1)
        targetTitle = provision?.title || null

        // Fetch types for this provision
        const types = await db
          .select({ code: provisionTypes.code })
          .from(provisionTypeAssociations)
          .innerJoin(provisionTypes, eq(provisionTypeAssociations.typeId, provisionTypes.id))
          .where(eq(provisionTypeAssociations.provisionId, change.targetId))

        targetProvisionTypes = types.map(t => t.code)
      }

      return {
        ...change,
        targetTitle,
        targetProvisionTypes,
      }
    })
  )

  return enrichedChanges
}
