'use server'

import { db } from '@/lib/db/client'
import { provisions, ideas, tags, taggables, provisionTypes, provisionTypeAssocs } from '@/lib/db/schema'
import { eq, desc, asc, or, ilike, and, SQL, inArray } from 'drizzle-orm'

// Tag type definition
export type Tag = {
  id: string
  name: string
  slug: string
  category: string | null
  color: string | null
}

// Provision type definition
export type ProvisionType = {
  id: string
  code: string
  label: string
  description: string | null
  icon: string | null
  color: string | null
}

// Provision with tags
export type ProvisionWithTags = {
  id: string
  slug: string
  title: string
  descriptionShort: string | null
  avatarUrl: string | null
  types: ProvisionType[]
  status: string
  relevance: number | null
  effectiveFrom: string | null
  effectiveUntil: string | null
  ideaId: string | null
  ideaTitle: string | null
  displayData: { items: Array<{ label: string; value: string }> } | null
  displayChanges: { items: Array<{ timestamp: string; label: string }> } | null
  tags: Tag[]
}

/**
 * Helper function to fetch types for provisions
 */
async function getProvisionTypes(provisionIds: string[]): Promise<Record<string, ProvisionType[]>> {
  if (provisionIds.length === 0) return {}

  const typeResults = await db
    .select({
      provisionId: provisionTypeAssocs.provisionId,
      typeId: provisionTypes.id,
      code: provisionTypes.code,
      label: provisionTypes.label,
      description: provisionTypes.description,
      icon: provisionTypes.icon,
      color: provisionTypes.color,
    })
    .from(provisionTypeAssocs)
    .innerJoin(provisionTypes, eq(provisionTypeAssocs.typeId, provisionTypes.id))
    .where(inArray(provisionTypeAssocs.provisionId, provisionIds))

  // Group types by provision
  return typeResults.reduce((acc, row) => {
    if (!acc[row.provisionId]) {
      acc[row.provisionId] = []
    }
    acc[row.provisionId].push({
      id: row.typeId,
      code: row.code,
      label: row.label,
      description: row.description,
      icon: row.icon,
      color: row.color,
    })
    return acc
  }, {} as Record<string, ProvisionType[]>)
}

export async function getProvisionsByEntity(entityId: string) {
  const entityProvisions = await db
    .select({
      id: provisions.id,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      status: provisions.status,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      displayData: provisions.displayData,
      displayChanges: provisions.displayChanges,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.entityId, entityId))
    .orderBy(desc(provisions.effectiveFrom))

  // Fetch types for all provisions
  const provisionIds = entityProvisions.map(p => p.id)
  const typesByProvision = await getProvisionTypes(provisionIds)

  // Merge types with provisions
  return entityProvisions.map(p => ({
    ...p,
    types: typesByProvision[p.id] || []
  }))
}

// Aggregate types for the provisions overview
export type ProvisionAggregates = {
  total: number
  byType: {
    taxation: { count: number }
    ownership: { count: number }
    contract: { count: number }
    regulation: { count: number }
    allocation: { count: number }
    designation: { count: number }
    infrastructure: { count: number }
  }
  tags: Array<{ id: string; name: string; slug: string; category: string | null; count: number }>
}

export async function getProvisionAggregatesByEntity(entityId: string): Promise<ProvisionAggregates> {
  // Fetch all provisions
  const entityProvisions = await db
    .select({
      id: provisions.id,
    })
    .from(provisions)
    .where(eq(provisions.entityId, entityId))

  // Fetch types for all provisions
  const provisionIds = entityProvisions.map(p => p.id)
  const typesByProvision = await getProvisionTypes(provisionIds)

  // Initialize aggregates
  const byType: ProvisionAggregates['byType'] = {
    taxation: { count: 0 },
    ownership: { count: 0 },
    contract: { count: 0 },
    regulation: { count: 0 },
    allocation: { count: 0 },
    designation: { count: 0 },
    infrastructure: { count: 0 },
  }

  // Process each provision
  for (const p of entityProvisions) {
    const provisionTypes = typesByProvision[p.id] || []

    // Process each type associated with this provision
    for (const type of provisionTypes) {
      switch (type.code) {
        case 'taxation':
          byType.taxation.count++
          break

        case 'ownership':
          byType.ownership.count++
          break

        case 'contract':
          byType.contract.count++
          break

        case 'regulation':
          byType.regulation.count++
          break

        case 'allocation':
          byType.allocation.count++
          break

        case 'designation':
          byType.designation.count++
          break

        case 'infrastructure':
          byType.infrastructure.count++
          break
      }
    }
  }

  // Fetch tags with counts for provisions of this entity
  let tagAggregates: Array<{ id: string; name: string; slug: string; category: string | null; count: number }> = []

  if (provisionIds.length > 0) {
    const tagResults = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        category: tags.category,
      })
      .from(taggables)
      .innerJoin(tags, eq(taggables.tagId, tags.id))
      .where(and(
        eq(taggables.taggableType, 'provision'),
        inArray(taggables.taggableId, provisionIds)
      ))

    // Count occurrences of each tag
    const tagCounts = tagResults.reduce((acc, t) => {
      if (!acc[t.id]) {
        acc[t.id] = { ...t, count: 0 }
      }
      acc[t.id].count++
      return acc
    }, {} as Record<string, { id: string; name: string; slug: string; category: string | null; count: number }>)

    tagAggregates = Object.values(tagCounts).sort((a, b) => b.count - a.count)
  }

  return {
    total: entityProvisions.length,
    byType,
    tags: tagAggregates,
  }
}

export async function getProvisionById(provisionId: string): Promise<ProvisionWithTags | null> {
  // Fetch provision
  const provisionResult = await db
    .select({
      id: provisions.id,
      slug: provisions.slug,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      displayData: provisions.displayData,
      displayChanges: provisions.displayChanges,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.id, provisionId))
    .limit(1)

  if (provisionResult.length === 0) {
    return null
  }

  const provision = provisionResult[0]

  // Fetch types
  const typesByProvision = await getProvisionTypes([provisionId])

  // Fetch tags
  const provisionTags = await db
    .select({
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
      eq(taggables.taggableId, provisionId)
    ))

  return {
    id: provision.id,
    slug: provision.slug,
    title: provision.title,
    descriptionShort: provision.descriptionShort,
    avatarUrl: provision.avatarUrl,
    types: typesByProvision[provisionId] || [],
    status: provision.status,
    relevance: provision.relevance,
    effectiveFrom: provision.effectiveFrom,
    effectiveUntil: provision.effectiveUntil,
    ideaId: provision.ideaId,
    ideaTitle: provision.ideaTitle,
    displayData: provision.displayData as { items: Array<{ label: string; value: string }> } | null,
    displayChanges: provision.displayChanges as { items: Array<{ timestamp: string; label: string }> } | null,
    tags: provisionTags.map(t => ({
      id: t.tagId,
      name: t.tagName,
      slug: t.tagSlug,
      category: t.tagCategory,
      color: t.tagColor,
    }))
  }
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

  if (filters.status) {
    conditions.push(eq(provisions.status, filters.status as any))
  }

  // Build base query
  let baseQuery = db
    .select({
      id: provisions.id,
      slug: provisions.slug,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      displayData: provisions.displayData,
      displayChanges: provisions.displayChanges,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .$dynamic()

  // If filtering by type, join with type associations
  if (filters.type) {
    baseQuery = baseQuery
      .innerJoin(provisionTypeAssocs, eq(provisions.id, provisionTypeAssocs.provisionId))
      .innerJoin(provisionTypes, eq(provisionTypeAssocs.typeId, provisionTypes.id))
      .where(and(...conditions, eq(provisionTypes.code, filters.type)))
  } else {
    baseQuery = baseQuery.where(and(...conditions))
  }

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

  // Fetch types for all provisions
  const provisionIds = provisionResults.map(p => p.id)
  const typesByProvision = await getProvisionTypes(provisionIds)

  // Fetch tags for all provisions
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

  // Merge provisions with types and tags
  return provisionResults.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    descriptionShort: p.descriptionShort,
    avatarUrl: p.avatarUrl,
    types: typesByProvision[p.id] || [],
    status: p.status,
    relevance: p.relevance,
    effectiveFrom: p.effectiveFrom,
    effectiveUntil: p.effectiveUntil,
    ideaId: p.ideaId,
    ideaTitle: p.ideaTitle,
    displayData: p.displayData as { items: Array<{ label: string; value: string }> } | null,
    displayChanges: p.displayChanges as { items: Array<{ timestamp: string; label: string }> } | null,
    tags: tagsByProvision[p.id] || []
  }))
}
