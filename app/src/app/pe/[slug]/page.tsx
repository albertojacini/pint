import { db } from '@/lib/db/client'
import { entities, taggables, tags, administrations, members, people } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventsByEntity } from '@/lib/actions/events'
import { getGroupedEntityRelationships } from '@/lib/actions/entity-relationships'
import {
  EntityHeader,
  EntityActions,
  EssentialStats,
  PerformanceIndicators,
  CommunityMetrics,
  EntityMetadata,
} from '@/components/entities'
import { Section, Subsection } from '@/components/custom-ui/section'
import { Tags } from '@/components/custom-ui/tags'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { parseUrlSlug, idStartsWith, entityPath } from '@/lib/utils'
import { CouncilDots } from '@/components/administrations/council-dots'
import { ExecutiveMembers } from '@/components/administrations/executive-members'
import { ElectionsSection } from '@/components/administrations/election-cards'
import { EventFilteredList } from '@/components/events/event-filtered-list'
import { ProvisionsOverviewLoader } from '@/components/provisions/loaders/provisions-overview-loader'

// Priority order for relationship types (higher priority = shown first)
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'parent country': 100,
  'parent region': 90,
  'parent city': 80,
  'parent district': 70,
  'contains': 60,
  'member of': 50,
  'has member': 40,
  'sister city': 30,
  'partner': 20,
}

interface EntityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity by ID prefix
  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, idPrefix))

  if (!entity) {
    notFound()
  }

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
        role: members.roleType,
        roleTitle: members.roleTitle,
        icon: members.icon,
        party: members.party,
      })
      .from(members)
      .innerJoin(people, eq(members.personId, people.id))
      .where(and(eq(members.administrationId, activeAdmin.id), eq(members.status, 'active')))
  }

  // Build data for administration sub-components
  const councilComposition = activeAdmin?.councilComposition || undefined
  const mappedMembers = executiveMembers.map((m) => ({
    name: m.name,
    role: m.role as 'mayor' | 'councilor' | 'minister' | 'president' | 'governor' | 'member',
    roleTitle: m.roleTitle || undefined,
    icon: m.icon || undefined,
    party: m.party || undefined,
  }))
  const nextElection = activeAdmin?.electionData?.nextElection
    ? { date: activeAdmin.electionData.nextElection }
    : undefined
  const electionHistory = entityAdministrations
    .filter((admin) => admin.electionData?.electionDate)
    .map((admin) => ({
      date: admin.electionData!.electionDate!,
      turnout: admin.electionData!.turnout,
      results: admin.electionData!.results || [],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hasAdministrationContent =
    (councilComposition && councilComposition.length > 0) ||
    mappedMembers.length > 0 ||
    nextElection ||
    electionHistory.length > 0

  // Build related entities
  const allRelationships = Object.entries(relationships).flatMap(([type, ents]) =>
    ents.map(e => ({ ...e, relationshipType: type }))
  )
  const sortedRelationships = allRelationships.sort((a, b) => {
    const priorityA = RELATIONSHIP_PRIORITY[a.relationshipType] ?? 0
    const priorityB = RELATIONSHIP_PRIORITY[b.relationshipType] ?? 0
    if (priorityA !== priorityB) return priorityB - priorityA
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Entities', href: '/pe' }, { label: entity.name }]} />

      {/* Entity Type Badge + Tags */}
      <div className="flex items-center gap-2 mb-6">
        <EntityClassificationBadge type={entity.type as any} />
        <Tags tags={entityTags} />
      </div>

      {/* Main entity card */}
      <EntityHeader entity={entity} />

      {/* Related entities */}
      {sortedRelationships.length > 0 && (
        <div className="text-sm text-gray-600 mb-6">
          <span className="text-gray-500">Related: </span>
          {sortedRelationships.map((rel, index) => (
            <span key={rel.id}>
              <Link
                href={entityPath(rel)}
                className="text-link hover:text-blue-800 hover:underline"
              >
                {rel.name}
              </Link>
              {index < sortedRelationships.length - 1 && (
                <span className="text-gray-400"> · </span>
              )}
            </span>
          ))}
        </div>
      )}

      <EssentialStats population={entity.population} stats={entity.essentialStats} />
      <EntityActions entity={entity} />

      {/* Politics / Administrations */}
      {hasAdministrationContent && (
        <Section
          title="Politics"
          action={
            <Link href={`/pe/${entity.slug}/ad`} className="text-sm text-link hover:underline">
              View all
            </Link>
          }
        >
          <div className="space-y-6">
            <Subsection title="Consiglio comunale" className="mb-0">
              {councilComposition && councilComposition.length > 0 && (
                <CouncilDots composition={councilComposition} />
              )}
            </Subsection>

            <Subsection title="Giunta comunale" className="mb-0">
              {mappedMembers.length > 0 && (
                <ExecutiveMembers members={mappedMembers} variant="grid-minimal" />
              )}
            </Subsection>

            <ElectionsSection nextElection={nextElection} history={electionHistory} />
          </div>
        </Section>
      )}

      <Section
        title="Administration"
        action={
          <Link href={`/pe/${urlSlug}/pr`} className="text-sm text-link hover:underline">
            View all
          </Link>
        }
      >
        <ProvisionsOverviewLoader entityId={entity.id} entitySlug={entity.slug} />
      </Section>

      <Section title="Financials">
        <p className="text-muted-foreground">Coming soon...</p>
      </Section>

      <Section
        title="Events"
        action={
          <Link href={`${entityPath(entity)}/events`} className="text-sm text-link hover:underline">
            View all
          </Link>
        }
      >
        <EventFilteredList events={events} />
      </Section>

      <Section title="Performance Indicators">
        <PerformanceIndicators data={entity.performanceIndicators} />
      </Section>

      <Section title="Pint Community">
        <CommunityMetrics data={entity.communityMetrics} />
      </Section>

      <Section title="Metadata">
        <EntityMetadata id={entity.id} createdAt={entity.createdAt} updatedAt={entity.updatedAt} />
      </Section>
    </div>
  )
}
