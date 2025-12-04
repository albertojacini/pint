'use server'

import { db } from '@/lib/db/client'
import { provisions, politicalEntities, ideas, tags, taggables } from '@/lib/db/schema'
import { eq, desc, asc, or, ilike, and, SQL, inArray } from 'drizzle-orm'

// Tag type definition
export type Tag = {
  id: string
  name: string
  slug: string
  category: string | null
  color: string | null
}

// Provision with tags and extraData
export type ProvisionWithTags = {
  id: string
  title: string
  descriptionShort: string | null
  avatarUrl: string | null
  type: string
  status: string
  significance: number | null
  effectiveFrom: string | null
  effectiveUntil: string | null
  ideaId: string | null
  ideaTitle: string | null
  extraData: Record<string, unknown> | null
  tags: Tag[]
}

export async function getProvisionsByEntity(entityId: string) {
  const entityProvisions = await db
    .select({
      id: provisions.id,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      type: provisions.type,
      status: provisions.status,
      significance: provisions.significance,
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
): Promise<ProvisionWithTags[]> {
  // Build where conditions
  const conditions: SQL[] = [eq(provisions.entityId, entityId)]

  if (filters.search) {
    conditions.push(
      or(
        ilike(provisions.title, `%${filters.search}%`),
        ilike(provisions.descriptionShort, `%${filters.search}%`)
      )!
    )
  }

  if (filters.type) {
    conditions.push(eq(provisions.type, filters.type as any))
  }

  if (filters.status) {
    conditions.push(eq(provisions.status, filters.status as any))
  }

  // Build base query with extraData included
  const baseQuery = db
    .select({
      id: provisions.id,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      avatarUrl: provisions.avatarUrl,
      type: provisions.type,
      status: provisions.status,
      significance: provisions.significance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      extraData: provisions.extraData,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(and(...conditions))

  // Apply sorting and execute
  let provisionResults: any[]
  switch (filters.sort) {
    case 'date-asc':
      provisionResults = await baseQuery.orderBy(asc(provisions.effectiveFrom))
      break
    case 'title-asc':
      provisionResults = await baseQuery.orderBy(asc(provisions.title))
      break
    case 'title-desc':
      provisionResults = await baseQuery.orderBy(desc(provisions.title))
      break
    default: // 'date-desc'
      provisionResults = await baseQuery.orderBy(desc(provisions.effectiveFrom))
      break
  }

  // If no provisions, return empty array
  if (provisionResults.length === 0) {
    return []
  }

  // Fetch tags for all provisions (two-query approach)
  const provisionIds = provisionResults.map(p => p.id)

  const provisionTags = await db
    .select({
      provisionId: taggables.taggableId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
      tagCategory: tags.category,
      tagColor: tags.color,
    })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(and(
      eq(taggables.taggableType, 'provision'),
      inArray(taggables.taggableId, provisionIds)
    ))

  // Group tags by provision
  const tagsByProvision = provisionTags.reduce((acc, row) => {
    if (!acc[row.provisionId]) {
      acc[row.provisionId] = []
    }
    acc[row.provisionId].push({
      id: row.tagId,
      name: row.tagName,
      slug: row.tagSlug,
      category: row.tagCategory,
      color: row.tagColor,
    })
    return acc
  }, {} as Record<string, Tag[]>)

  // Merge provisions with tags
  return provisionResults.map(p => ({
    id: p.id,
    title: p.title,
    descriptionShort: p.descriptionShort,
    avatarUrl: p.avatarUrl,
    type: p.type,
    status: p.status,
    significance: p.significance,
    effectiveFrom: p.effectiveFrom,
    effectiveUntil: p.effectiveUntil,
    ideaId: p.ideaId,
    ideaTitle: p.ideaTitle,
    extraData: p.extraData as Record<string, unknown> | null,
    tags: tagsByProvision[p.id] || []
  }))
}
