'use server'

import { db } from '@/lib/db/client'
import { provisions, politicalEntities, ideas } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getProvisionsByEntity(entityId: string) {
  const entityProvisions = await db
    .select({
      id: provisions.id,
      title: provisions.title,
      description: provisions.description,
      type: provisions.type,
      status: provisions.status,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.entityId, entityId))
    .orderBy(desc(provisions.effectiveFrom))

  return entityProvisions
}
