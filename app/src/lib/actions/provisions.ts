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
  slug: string
  title: string
  descriptionShort: string | null
  avatarUrl: string | null
  type: string
  status: string
  relevance: number | null
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
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      extraData: provisions.extraData,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.entityId, entityId))
    .orderBy(desc(provisions.effectiveFrom))

  return entityProvisions
}

// Aggregate types for the provisions overview
export type ProvisionAggregates = {
  total: number
  byType: {
    taxation: { count: number; totalRevenue: number | null; avgGrowth: number | null }
    ownership: { count: number; totalValuation: number | null; totalCashFlow: number | null }
    contract: { count: number; byContractType: Record<string, number> }
    regulation: { count: number; byRegulationType: Record<string, number> }
    allocation: { count: number }
    designation: { count: number }
  }
  tags: Array<{ id: string; name: string; slug: string; category: string | null; count: number }>
}

export async function getProvisionAggregatesByEntity(entityId: string): Promise<ProvisionAggregates> {
  // Fetch all provisions with extraData
  const entityProvisions = await db
    .select({
      id: provisions.id,
      type: provisions.type,
      extraData: provisions.extraData,
    })
    .from(provisions)
    .where(eq(provisions.entityId, entityId))

  // Initialize aggregates
  const byType: ProvisionAggregates['byType'] = {
    taxation: { count: 0, totalRevenue: null, avgGrowth: null },
    ownership: { count: 0, totalValuation: null, totalCashFlow: null },
    contract: { count: 0, byContractType: {} },
    regulation: { count: 0, byRegulationType: {} },
    allocation: { count: 0 },
    designation: { count: 0 },
  }

  // Temporary arrays for averaging
  const taxationGrowths: number[] = []

  // Process each provision
  for (const p of entityProvisions) {
    const extra = p.extraData as Record<string, unknown> | null

    switch (p.type) {
      case 'taxation':
        byType.taxation.count++
        if (extra?.taxRevenueAmount != null) {
          byType.taxation.totalRevenue = (byType.taxation.totalRevenue ?? 0) + Number(extra.taxRevenueAmount)
        }
        if (extra?.revenueGrowth != null) {
          taxationGrowths.push(Number(extra.revenueGrowth))
        }
        break

      case 'ownership':
        byType.ownership.count++
        if (extra?.valuationAmount != null) {
          byType.ownership.totalValuation = (byType.ownership.totalValuation ?? 0) + Number(extra.valuationAmount)
        }
        if (extra?.annualCashFlow != null) {
          byType.ownership.totalCashFlow = (byType.ownership.totalCashFlow ?? 0) + Number(extra.annualCashFlow)
        }
        break

      case 'contract':
        byType.contract.count++
        if (extra?.contractType) {
          const ct = String(extra.contractType)
          byType.contract.byContractType[ct] = (byType.contract.byContractType[ct] ?? 0) + 1
        }
        break

      case 'regulation':
        byType.regulation.count++
        if (extra?.regulationType) {
          const rt = String(extra.regulationType)
          byType.regulation.byRegulationType[rt] = (byType.regulation.byRegulationType[rt] ?? 0) + 1
        }
        break

      case 'allocation':
        byType.allocation.count++
        break

      case 'designation':
        byType.designation.count++
        break
    }
  }

  // Calculate average growth for taxation
  if (taxationGrowths.length > 0) {
    byType.taxation.avgGrowth = taxationGrowths.reduce((a, b) => a + b, 0) / taxationGrowths.length
  }

  // Fetch tags with counts for provisions of this entity
  const provisionIds = entityProvisions.map(p => p.id)

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
      type: provisions.type,
      status: provisions.status,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: ideas.id,
      ideaTitle: ideas.title,
      extraData: provisions.extraData,
    })
    .from(provisions)
    .leftJoin(ideas, eq(provisions.ideaId, ideas.id))
    .where(eq(provisions.id, provisionId))
    .limit(1)

  if (provisionResult.length === 0) {
    return null
  }

  const provision = provisionResult[0]

  // Fetch tags
  const provisionTags = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
      tagCategory: tags.category,
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
    type: provision.type,
    status: provision.status,
    relevance: provision.relevance,
    effectiveFrom: provision.effectiveFrom,
    effectiveUntil: provision.effectiveUntil,
    ideaId: provision.ideaId,
    ideaTitle: provision.ideaTitle,
    extraData: provision.extraData as Record<string, unknown> | null,
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
      slug: provisions.slug,
      title: provisions.title,
      descriptionShort: provisions.descriptionShort,
      avatarUrl: provisions.avatarUrl,
      type: provisions.type,
      status: provisions.status,
      relevance: provisions.relevance,
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
    slug: p.slug,
    title: p.title,
    descriptionShort: p.descriptionShort,
    avatarUrl: p.avatarUrl,
    type: p.type,
    status: p.status,
    relevance: p.relevance,
    effectiveFrom: p.effectiveFrom,
    effectiveUntil: p.effectiveUntil,
    ideaId: p.ideaId,
    ideaTitle: p.ideaTitle,
    extraData: p.extraData as Record<string, unknown> | null,
    tags: tagsByProvision[p.id] || []
  }))
}
