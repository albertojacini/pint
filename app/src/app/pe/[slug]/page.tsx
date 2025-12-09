import { db } from '@/lib/db/client'
import {
  politicalEntities,
  administrations,
  administrationMembers,
  people,
  taggables,
  tags,
} from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { getEventsByEntity } from '@/lib/actions/events'
import { getGroupedEntityRelationships } from '@/lib/actions/entity-relationships'
import {
  EntityHeader,
  EntityActions,
  EssentialStats,
  PoliticalLandscape,
  PerformanceIndicators,
  CommunityMetrics,
  ProvisionsOverview,
  EventsOverview,
  EntityMetadata,
  RelatedEntitiesSection,
} from '@/components/entities'
import { Tags } from '@/components/custom-ui/tags'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'

interface EntityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity by ID prefix
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(idStartsWith(politicalEntities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch administrations for this entity
  const entityAdministrations = await db
    .select({
      id: administrations.id,
      name: administrations.name,
      termStart: administrations.termStart,
      termEnd: administrations.termEnd,
      status: administrations.status,
      description: administrations.description,
      councilComposition: administrations.councilComposition,
      electionData: administrations.electionData,
    })
    .from(administrations)
    .where(eq(administrations.entityId, entity.id))
    .orderBy(desc(administrations.termStart))

  // Get active administration
  const [activeAdmin] = entityAdministrations.filter((a) => a.status === 'active')

  // Fetch executive members for active administration
  let executiveMembers: Array<{
    name: string
    role: string
    roleTitle: string | null
    icon: string | null
    party: string | null
  }> = []

  if (activeAdmin) {
    executiveMembers = await db
      .select({
        name: people.fullName,
        role: administrationMembers.roleType,
        roleTitle: administrationMembers.roleTitle,
        icon: administrationMembers.icon,
        party: administrationMembers.party,
      })
      .from(administrationMembers)
      .innerJoin(people, eq(administrationMembers.personId, people.id))
      .where(
        and(
          eq(administrationMembers.administrationId, activeAdmin.id),
          eq(administrationMembers.status, 'active')
        )
      )
  }

  // For each administration, get the mayor
  const administrationsWithMayor = await Promise.all(
    entityAdministrations.map(async (admin) => {
      const [mayorMember] = await db
        .select({
          person: {
            fullName: people.fullName,
          },
        })
        .from(administrationMembers)
        .innerJoin(people, eq(administrationMembers.personId, people.id))
        .where(
          and(
            eq(administrationMembers.administrationId, admin.id),
            eq(administrationMembers.roleType, 'mayor')
          )
        )
        .limit(1)

      return {
        ...admin,
        mayor: mayorMember?.person || null,
      }
    })
  )

  // Fetch provisions for this entity
  const provisions = await getProvisionsByEntity(entity.id)

  // Fetch events for this entity
  const events = await getEventsByEntity(entity.id)

  // Fetch relationships for this entity
  const relationships = await getGroupedEntityRelationships(entity.id)

  // Fetch tags for this entity
  const entityTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      category: tags.category,
    })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(and(eq(taggables.taggableType, 'entity'), eq(taggables.taggableId, entity.id)))

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Entity Type Badge + Tags */}
      <div className="flex items-center gap-2 mb-6">
        <EntityClassificationBadge type={entity.type as any} />
        <Tags tags={entityTags} />
      </div>

      {/* Main entity card */}
      <EntityHeader entity={entity} />
      <RelatedEntitiesSection relationships={relationships} />
      <EssentialStats population={entity.population} stats={entity.essentialStats} />
      <EntityActions entity={entity} />
      <PoliticalLandscape
        data={
          activeAdmin
            ? {
                councilComposition: activeAdmin.councilComposition || undefined,
                executiveMembers: executiveMembers.map((m) => ({
                  name: m.name,
                  role: m.role as 'mayor' | 'vice-mayor' | 'assessor' | 'councilor',
                  roleTitle: m.roleTitle || undefined,
                  icon: m.icon || undefined,
                  party: m.party || undefined,
                })),
                nextElection: activeAdmin.electionData?.nextElection
                  ? { date: activeAdmin.electionData.nextElection }
                  : undefined,
                electionHistory: entityAdministrations
                  .filter((admin) => admin.electionData?.electionDate)
                  .map((admin) => ({
                    date: admin.electionData!.electionDate!,
                    turnout: admin.electionData!.turnout,
                    results: admin.electionData!.results || [],
                  }))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              }
            : null
        }
        entitySlug={urlSlug}
      />
      <PerformanceIndicators data={entity.performanceIndicators} />
      <CommunityMetrics data={entity.communityMetrics} />

      <ProvisionsOverview entity={entity} provisions={provisions} />
      <EventsOverview entity={entity} events={events} />
      <EntityMetadata id={entity.id} createdAt={entity.createdAt} updatedAt={entity.updatedAt} />
    </div>
  )
}
