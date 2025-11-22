import { db } from '@/lib/db/client'
import { politicalEntities, administrations, administrationMembers, people, taggables, tags } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { getEventsByEntity } from '@/lib/actions/events'
import {
  EntityTags,
  EntityHeader,
  EssentialStats,
  PoliticalLandscape,
  PerformanceIndicators,
  CommunityMetrics,
  ProvisionsOverview,
  EventsOverview,
  EntityMetadata,
  AdministrationsSection,
} from '@/components/entities'

interface EntityPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { id } = await params

  // Fetch the entity
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, id))

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
    })
    .from(administrations)
    .where(eq(administrations.entityId, id))
    .orderBy(desc(administrations.termStart))

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
  const provisions = await getProvisionsByEntity(id)

  // Fetch events for this entity
  const events = await getEventsByEntity(id)

  // Fetch tags for this entity
  const entityTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      category: tags.category,
    })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(
      and(
        eq(taggables.taggableType, 'entity'),
        eq(taggables.taggableId, id)
      )
    )

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <EntityTags tags={entityTags} />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/entities" className="hover:underline">
          {entity.identityData?.countryCode || 'Entities'}
        </Link>
        {entity.identityData?.regionName && (
          <>
            {' > '}
            <span>{entity.identityData.regionName}</span>
          </>
        )}
      </div>

      {/* Main entity card */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <EntityHeader entity={entity} />
        <EssentialStats population={entity.population} stats={entity.essentialStats} />
        <PoliticalLandscape data={entity.politicalLandscape} />
        <PerformanceIndicators data={entity.performanceIndicators} />
        <CommunityMetrics data={entity.communityMetrics} />
      </div>

      <AdministrationsSection administrations={administrationsWithMayor} />
      <ProvisionsOverview entityId={id} provisions={provisions} />
      <EventsOverview entityId={id} events={events} />
      <EntityMetadata id={entity.id} createdAt={entity.createdAt} updatedAt={entity.updatedAt} />
    </div>
  )
}
