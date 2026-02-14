import { db } from '@/lib/db/client'
import { entities, taggables, tags, administrations, members, people } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGroupedEntityRelationships } from '@/lib/actions/entity-relationships'
import {
  EntityActions,
  EssentialStats,
  FinancialTrends,
} from '@/components/entities'
import { PageTitle } from '@/components/custom-ui/typography'
import { getStorageUrl } from '@/lib/storage'
import { Box } from '@/components/custom-ui/box'
import { Section, Subsection } from '@/components/custom-ui/section'
import { Tags } from '@/components/custom-ui/tags'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { parseUrlSlug, idStartsWith, entityPath } from '@/lib/utils'
import { CouncilDots } from '@/components/administrations/council-dots'
import { ExecutiveMembers } from '@/components/administrations/executive-members'
import { ElectionsSection } from '@/components/administrations/election-cards'
import { getEventsByEntity } from '@/lib/actions/events'
import { EventDaysOfTheYearHeatmap } from '@/components/events/event-heatmaps'
import { EventList } from '@/components/events/event-list'
import { ProvisionsOverviewLoader } from '@/components/provisions/provisions-overview-loader'

// Priority order for relationship types (higher priority = shown first)
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'parent country': 100,
  'parent region': 90,
  'parent city': 80,
  'parent district': 70,
  contains: 60,
  'member of': 50,
  'has member': 40,
  'sister city': 30,
  partner: 20,
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

  // Fetch events and relationships for this entity
  const events = await getEventsByEntity(entity.id)
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
    ents.map((e) => ({ ...e, relationshipType: type }))
  )
  const sortedRelationships = allRelationships.sort((a, b) => {
    const priorityA = RELATIONSHIP_PRIORITY[a.relationshipType] ?? 0
    const priorityB = RELATIONSHIP_PRIORITY[b.relationshipType] ?? 0
    if (priorityA !== priorityB) return priorityB - priorityA
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Entities', href: '/pe' }, { label: entity.name }]} />

      {/* Entity Type Badge + Tags + Quick Actions */}
      <div className="flex items-center gap-3 mb-6">
        <EntityClassificationBadge type={entity.type as any} />
        <Tags tags={entityTags} />
        <div className="ml-auto">
          <EntityActions entity={entity} />
        </div>
      </div>

      {/* Entity Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-shrink-0">
          {getStorageUrl('avatars', entity.avatarUrl) ? (
            <img
              src={getStorageUrl('avatars', entity.avatarUrl)!}
              alt={entity.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-400">{entity.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <PageTitle>{entity.name}</PageTitle>
      </div>

      {/* Information block: stats + related entities */}
      <Box variant="muted" padding="md" className="space-y-2 mb-10">
        <EssentialStats population={entity.population} stats={entity.essentialStats} />
        {sortedRelationships.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/60 mr-1.5">Related entities:</span>
            {sortedRelationships.map((rel, index) => (
              <span key={rel.id}>
                <Link href={entityPath(rel)} className="text-link hover:underline">
                  {rel.name}
                </Link>
                {index < sortedRelationships.length - 1 && (
                  <span className="text-foreground/20"> · </span>
                )}
              </span>
            ))}
          </div>
        )}
      </Box>

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

        {/* ─── Block 3: Community ─── */}
        <p className="text-xs text-muted-foreground italic">Community — work in progress</p>

        {/* ─── Block 4: Highlights ─── */}
        <p className="text-xs text-muted-foreground italic">Highlights — work in progress</p>
      </Section>

      {entity.financialOverview && (
        <Section title="Financials">
          <FinancialTrends data={entity.financialOverview} />
        </Section>
      )}

      <Section
        title="Events"
        action={
          <Link href={`${entityPath(entity)}/events`} className="text-sm text-link hover:underline">
            View all
          </Link>
        }
      >
        <EventDaysOfTheYearHeatmap events={events} />
        <div className="mt-6">
          <EventList events={events} />
        </div>
      </Section>

      <Section title="Performance Indicators">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </Section>

      <Section title="Pint Community">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </Section>
    </div>
  )
}
