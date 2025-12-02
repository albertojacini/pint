'use server'

import { db } from '@/lib/db/client'
import { provisions, politicalEntities, ideas } from '@/lib/db/schema'
import { eq, desc, asc, or, ilike, and, SQL } from 'drizzle-orm'

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

export async function getFilteredProvisions(
  entityId: string,
  filters: {
    search?: string
    type?: string
    status?: string
    sort?: string
  }
) {
  // Build where conditions
  const conditions: SQL[] = [eq(provisions.entityId, entityId)]

  if (filters.search) {
    conditions.push(
      or(
        ilike(provisions.title, `%${filters.search}%`),
        ilike(provisions.description, `%${filters.search}%`)
      )!
    )
  }

  if (filters.type) {
    conditions.push(eq(provisions.type, filters.type as any))
  }

  if (filters.status) {
    conditions.push(eq(provisions.status, filters.status as any))
  }

  // Build base query
  const baseQuery = db
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
    .where(and(...conditions))

  // Apply sorting and execute
  switch (filters.sort) {
    case 'date-asc':
      return await baseQuery.orderBy(asc(provisions.effectiveFrom))
    case 'title-asc':
      return await baseQuery.orderBy(asc(provisions.title))
    case 'title-desc':
      return await baseQuery.orderBy(desc(provisions.title))
    default: // 'date-desc'
      return await baseQuery.orderBy(desc(provisions.effectiveFrom))
  }
}
