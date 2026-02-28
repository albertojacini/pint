'use server'

import { db } from '@/lib/db/client'
import { provisions, ideas, tags, taggables, provisionTypes, provisionTypeAssocs } from '@/lib/db/schema'
import { eq, desc, asc, or, ilike, and, sql, SQL, inArray } from 'drizzle-orm'

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
  tagline: string | null
  avatarUrl: string | null
  types: ProvisionType[]
  status: string
  relevance: number | null
  ideaId: string | null
  ideaTitle: string | null
  highlights: { items: Array<{ label: string; value: string }> } | null
  changelog: { items: Array<{ timestamp: string; label: string }> } | null
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
      tagline: provisions.tagline,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      highlights: provisions.highlights,
      changelog: provisions.changelog,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.entityId, entityId))
    .orderBy(desc(provisions.title))

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
      tagline: provisions.tagline,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      highlights: provisions.highlights,
      changelog: provisions.changelog,
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
    tagline: provision.tagline,
    avatarUrl: provision.avatarUrl,
    types: typesByProvision[provisionId] || [],
    status: provision.status,
    relevance: provision.relevance,
    ideaId: provision.ideaId,
    ideaTitle: provision.ideaTitle,
    highlights: provision.highlights as { items: Array<{ label: string; value: string }> } | null,
    changelog: provision.changelog as { items: Array<{ timestamp: string; label: string }> } | null,
    tags: provisionTags.map(t => ({
      id: t.tagId,
      name: t.tagName,
      slug: t.tagSlug,
      category: t.tagCategory,
      color: t.tagColor,
    }))
  }
}

// Tree node for hierarchical provision display
export type ProvisionTreeNode = {
  id: string
  slug: string
  title: string
  parentId: string | null
  status: string
  relevance: number | null
  types: ProvisionType[]
  children: ProvisionTreeNode[]
}

export async function getProvisionTreeByEntity(entityId: string): Promise<ProvisionTreeNode[]> {
  const rows = await db
    .select({
      id: provisions.id,
      slug: provisions.slug,
      title: provisions.title,
      parentId: provisions.parentId,
      status: provisions.status,
      relevance: provisions.relevance,
    })
    .from(provisions)
    .where(eq(provisions.entityId, entityId))
    .orderBy(asc(provisions.title))

  const provisionIds = rows.map(r => r.id)
  const typesByProvision = await getProvisionTypes(provisionIds)

  const nodes: ProvisionTreeNode[] = rows.map(r => ({
    ...r,
    types: typesByProvision[r.id] || [],
    children: [],
  }))

  // Build tree: index by id, then attach children
  const byId = new Map(nodes.map(n => [n.id, n]))
  const roots: ProvisionTreeNode[] = []

  for (const node of nodes) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
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
        ilike(provisions.tagline, `%${filters.search}%`)
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
      tagline: provisions.tagline,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      highlights: provisions.highlights,
      changelog: provisions.changelog,
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
    case 'title-asc':
      provisionResults = await baseQuery.orderBy(asc(provisions.title))
      break
    case 'title-desc':
      provisionResults = await baseQuery.orderBy(desc(provisions.title))
      break
    default:
      provisionResults = await baseQuery.orderBy(asc(provisions.title))
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
    tagline: p.tagline,
    avatarUrl: p.avatarUrl,
    types: typesByProvision[p.id] || [],
    status: p.status,
    relevance: p.relevance,
    ideaId: p.ideaId,
    ideaTitle: p.ideaTitle,
    highlights: p.highlights as { items: Array<{ label: string; value: string }> } | null,
    changelog: p.changelog as { items: Array<{ timestamp: string; label: string }> } | null,
    tags: tagsByProvision[p.id] || []
  }))
}

// Temporal provision with date bounds and ranking score
export type TemporalProvision = {
  id: string
  slug: string
  title: string
  tagline: string | null
  avatarUrl: string | null
  status: string
  relevance: number | null
  startsOn: string | null
  endsOn: string | null
  highlights: { items: Array<{ label: string; value: string }> } | null
  types: ProvisionType[]
  score: number
}

// Fetches temporal provisions (those with starts_on or ends_on set), ranked by
// a combined score of relevance and temporal proximity. Provisions happening now
// or very soon with high relevance float to the top.
export async function getTemporalProvisions(entityId: string): Promise<TemporalProvision[]> {
  // proximity: 1.0 when happening today, decays with distance in days.
  // Uses the closest bound (start or end) to "now" for the distance.
  // relevance is normalized to 0-1 (max 10), then blended 50/50 with proximity.
  const scoreExpr = sql<number>`
    COALESCE(relevance, 0) / 10.0 * 0.5
    + 1.0 / (1.0 + LEAST(
        ABS(CURRENT_DATE - COALESCE(starts_on, ends_on)),
        ABS(CURRENT_DATE - COALESCE(ends_on, starts_on))
      )) * 0.5
  `

  const rows = await db
    .select({
      id: provisions.id,
      slug: provisions.slug,
      title: provisions.title,
      tagline: provisions.tagline,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      startsOn: provisions.startsOn,
      endsOn: provisions.endsOn,
      highlights: provisions.highlights,
      score: scoreExpr,
    })
    .from(provisions)
    .where(and(
      eq(provisions.entityId, entityId),
      or(
        sql`${provisions.startsOn} IS NOT NULL`,
        sql`${provisions.endsOn} IS NOT NULL`
      )
    ))
    .orderBy(desc(scoreExpr))

  const provisionIds = rows.map(r => r.id)
  const typesByProvision = await getProvisionTypes(provisionIds)

  return rows.map(r => ({
    ...r,
    score: Number(r.score),
    highlights: r.highlights as { items: Array<{ label: string; value: string }> } | null,
    types: typesByProvision[r.id] || [],
  }))
}

// Recent temporal provisions: ended before today, ordered by most recent first
export async function getRecentTemporalProvisions(entityId: string, limit = 6): Promise<TemporalProvision[]> {
  const all = await getTemporalProvisions(entityId)
  const today = new Date().toISOString().slice(0, 10)
  return all
    .filter(p => {
      const end = p.endsOn ?? p.startsOn
      return end && end < today
    })
    .sort((a, b) => {
      const endA = a.endsOn ?? a.startsOn ?? ''
      const endB = b.endsOn ?? b.startsOn ?? ''
      return endB.localeCompare(endA)
    })
    .slice(0, limit)
}

// Upcoming temporal provisions: starts today or later, ordered by soonest first
export async function getUpcomingTemporalProvisions(entityId: string, limit = 6): Promise<TemporalProvision[]> {
  const all = await getTemporalProvisions(entityId)
  const today = new Date().toISOString().slice(0, 10)
  return all
    .filter(p => {
      const start = p.startsOn ?? p.endsOn
      return start && start >= today
    })
    .sort((a, b) => {
      const startA = a.startsOn ?? a.endsOn ?? ''
      const startB = b.startsOn ?? b.endsOn ?? ''
      return startA.localeCompare(startB)
    })
    .slice(0, limit)
}
