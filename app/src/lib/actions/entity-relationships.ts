'use server'

import { db } from '@/lib/db/client'
import { entityRelationships, politicalEntities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Type definitions
export type RelatedEntity = {
  id: string
  name: string
  slug: string
  type: string
  avatarUrl: string | null
  identityData: {
    coatOfArmsUrl?: string
  } | null
  relationshipType: string
  direction: 'outgoing' | 'incoming'
}

export type GroupedRelationships = {
  [relationshipType: string]: RelatedEntity[]
}

/**
 * Fetch all relationships for an entity (both outgoing and incoming)
 * Outgoing: entity_id = entityId (this entity points to related entity)
 * Incoming: related_entity_id = entityId (other entities point to this entity)
 */
export async function getEntityRelationships(entityId: string): Promise<RelatedEntity[]> {
  // Fetch outgoing relationships (this entity -> related entity)
  const outgoing = await db
    .select({
      relationshipType: entityRelationships.relationshipType,
      relatedId: politicalEntities.id,
      relatedName: politicalEntities.name,
      relatedSlug: politicalEntities.slug,
      relatedType: politicalEntities.type,
      relatedAvatarUrl: politicalEntities.avatarUrl,
      relatedIdentityData: politicalEntities.identityData,
    })
    .from(entityRelationships)
    .innerJoin(politicalEntities, eq(entityRelationships.relatedEntityId, politicalEntities.id))
    .where(eq(entityRelationships.entityId, entityId))

  // Fetch incoming relationships (other entity -> this entity)
  const incoming = await db
    .select({
      relationshipType: entityRelationships.relationshipType,
      relatedId: politicalEntities.id,
      relatedName: politicalEntities.name,
      relatedSlug: politicalEntities.slug,
      relatedType: politicalEntities.type,
      relatedAvatarUrl: politicalEntities.avatarUrl,
      relatedIdentityData: politicalEntities.identityData,
    })
    .from(entityRelationships)
    .innerJoin(politicalEntities, eq(entityRelationships.entityId, politicalEntities.id))
    .where(eq(entityRelationships.relatedEntityId, entityId))

  // Transform outgoing relationships
  const outgoingRelated: RelatedEntity[] = outgoing.map(r => ({
    id: r.relatedId,
    name: r.relatedName,
    slug: r.relatedSlug,
    type: r.relatedType,
    avatarUrl: r.relatedAvatarUrl,
    identityData: r.relatedIdentityData,
    relationshipType: r.relationshipType,
    direction: 'outgoing' as const,
  }))

  // Transform incoming relationships (invert the relationship type label)
  const incomingRelated: RelatedEntity[] = incoming.map(r => ({
    id: r.relatedId,
    name: r.relatedName,
    slug: r.relatedSlug,
    type: r.relatedType,
    avatarUrl: r.relatedAvatarUrl,
    identityData: r.relatedIdentityData,
    relationshipType: invertRelationshipType(r.relationshipType),
    direction: 'incoming' as const,
  }))

  return [...outgoingRelated, ...incomingRelated]
}

/**
 * Group relationships by type for UI display
 */
export async function getGroupedEntityRelationships(entityId: string): Promise<GroupedRelationships> {
  const relationships = await getEntityRelationships(entityId)

  return relationships.reduce((acc, rel) => {
    const type = rel.relationshipType
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(rel)
    return acc
  }, {} as GroupedRelationships)
}

/**
 * Helper to invert relationship types for incoming relationships
 * e.g., "parent region" from Milano's perspective becomes "contains" from Lombardia's perspective
 */
function invertRelationshipType(type: string): string {
  const inversions: Record<string, string> = {
    'parent city': 'contains',
    'parent region': 'contains',
    'parent country': 'contains',
    'parent district': 'contains',
    'contains': 'part of',
    'partner': 'partner',
    'sister city': 'sister city',
    'member of': 'has member',
    'has member': 'member of',
    'successor of': 'predecessor of',
    'predecessor of': 'successor of',
  }
  return inversions[type] || type
}
