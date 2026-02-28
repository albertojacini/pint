import { db } from '@/lib/db/client'
import { entities, taggables, tags, administrations, members, people } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getGroupedEntityRelationships } from '@/lib/actions/entity-relationships'
import { EntityActions, EssentialStats, FinancialTrends } from '@/components/entities'
import { PageTitle } from '@/components/custom-ui/typography'
import { getStorageUrl } from '@/lib/storage'
import { Box } from '@/components/custom-ui/box'
import { SectionL1, SectionL2 } from '@/components/custom-ui/section'
import { Tags } from '@/components/custom-ui/tags'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { parseUrlSlug, idStartsWith, entityPath } from '@/lib/utils'
import { CouncilDots } from '@/components/administrations/council-dots'
import { ExecutiveMembers } from '@/components/administrations/executive-members'
import { ElectionsSection } from '@/components/administrations/election-cards'
import { getEventsByEntity, getMostRelevantEventsByEntity } from '@/lib/actions/events'
import { EventHeatmapLoader } from '@/components/events/loaders'
import { EventList } from '@/components/events/event-list'
import { ProvisionsOverviewLoader } from '@/components/provisions/loaders'
import { ProvisionCardExtraSmall } from '@/components/provisions/provision-cards'
import { getProvisionsByEntity, getRecentTemporalProvisions, getUpcomingTemporalProvisions } from '@/lib/actions/provisions'
import { SectionInsight } from '@/components/custom-ui/section-insight'
import { PageNavLayout, type PageNavSection } from '@/components/custom-ui/page-nav'
import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations('entities')
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity by ID prefix
  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch events, provisions, and relationships for this entity
  const [latestEvents, mostRelevantEvents] = await Promise.all([
    getEventsByEntity(entity.id, { limit: 10 }),
    getMostRelevantEventsByEntity(entity.id, 10),
  ])

  const [provisions, recentProvisions, upcomingProvisions] = await Promise.all([
    getProvisionsByEntity(entity.id),
    getRecentTemporalProvisions(entity.id),
    getUpcomingTemporalProvisions(entity.id),
  ])
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

  const insights = entity.sectionInsights

  // Build page nav sections dynamically based on available data
  const pageNavSections: PageNavSection[] = [
    { id: 'overview', label: t('overview') },
    ...(hasAdministrationContent ? [{ id: 'politics', label: t('politics') }] : []),
    { id: 'administration', label: t('administration') },
    ...(entity.financialOverview ? [{ id: 'financials', label: t('financials') }] : []),
    { id: 'events', label: t('events') },
    { id: 'performance', label: t('performanceIndicators') },
    { id: 'community', label: t('pintCommunity') },
  ]

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: t('breadcrumb'), href: '/entities' }, { label: entity.name }]} />

      <PageNavLayout sections={pageNavSections}>
        {/* Overview: badges, header, stats */}
        <section id="overview" className="scroll-mt-32 lg:scroll-mt-20 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <EntityClassificationBadge type={entity.type as any} />
            <Tags tags={entityTags} />
            <div className="ml-auto">
              <EntityActions entity={entity} />
            </div>
          </div>

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

          <Box variant="muted" padding="md" className="space-y-2">
            <EssentialStats population={entity.population} stats={entity.essentialStats} />
            {sortedRelationships.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="text-muted-foreground/60 mr-1.5">{t('relatedEntities')}</span>
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
        </section>
        {/* Politics / Administrations */}
        {hasAdministrationContent && (
          <SectionL1
            id="politics"
            title={t('politics')}
            action={
              <Link href={`/entities/${entity.slug}/ad`} className="text-sm text-link hover:underline">
                {t('viewAll')}
              </Link>
            }
          >
            {insights?.politics && <SectionInsight content={insights.politics} className="mb-4" />}
            <div className="space-y-6">
              <SectionL2 title="Consiglio comunale" className="mb-0">
                {councilComposition && councilComposition.length > 0 && (
                  <CouncilDots composition={councilComposition} />
                )}
              </SectionL2>

              <SectionL2 title="Giunta comunale" className="mb-0">
                {mappedMembers.length > 0 && (
                  <ExecutiveMembers members={mappedMembers} variant="grid-minimal" />
                )}
              </SectionL2>

              <ElectionsSection nextElection={nextElection} history={electionHistory} />
            </div>
          </SectionL1>
        )}

        <SectionL1
          id="administration"
          title={t('administration')}
          action={
            <Link href={`/entities/${urlSlug}/provisions`} className="text-sm text-link hover:underline">
              {t('viewAll')}
            </Link>
          }
        >
          {insights?.administration && (
            <SectionInsight content={insights.administration} className="mb-4" />
          )}
          <SectionL2>
            <ProvisionsOverviewLoader entityId={entity.id} entitySlug={entity.slug} />
          </SectionL2>
          {provisions.length > 0 && (
            <SectionL2 title={t('relevantProvisions')}>
              <div className="overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-[180px] grid-rows-3 gap-x-4 gap-y-0 w-max">
                  {provisions.slice(0, 6).map((p) => (
                    <ProvisionCardExtraSmall
                      key={p.title}
                      provision={{ title: p.title, type: p.types[0]?.code ?? 'regulation', avatarUrl: p.avatarUrl }}
                      className="max-w-[180px]"
                    />
                  ))}
                </div>
              </div>
            </SectionL2>
          )}
          {(recentProvisions.length > 0 || upcomingProvisions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentProvisions.length > 0 && (
                <SectionL2 title={t('recentProvisions')}>
                  {recentProvisions.map((p) => (
                    <ProvisionCardExtraSmall
                      key={p.id}
                      provision={{
                        title: p.title,
                        type: p.types[0]?.code ?? 'program',
                        avatarUrl: p.avatarUrl,
                      }}
                    />
                  ))}
                </SectionL2>
              )}
              {upcomingProvisions.length > 0 && (
                <SectionL2 title={t('upcomingProvisions')}>
                  {upcomingProvisions.map((p) => (
                    <ProvisionCardExtraSmall
                      key={p.id}
                      provision={{
                        title: p.title,
                        type: p.types[0]?.code ?? 'program',
                        avatarUrl: p.avatarUrl,
                      }}
                    />
                  ))}
                </SectionL2>
              )}
            </div>
          )}

          <SectionL2 title={t('community')}>
            <p className="text-xs text-muted-foreground italic">{t('comingSoon')}</p>
          </SectionL2>
        </SectionL1>

        {entity.financialOverview && (
          <SectionL1 id="financials" title={t('financials')}>
            {insights?.financials && (
              <SectionInsight content={insights.financials} className="mb-4" />
            )}
            <FinancialTrends data={entity.financialOverview} />
          </SectionL1>
        )}

        <SectionL1
          id="events"
          title={t('events')}
          action={
            <Link href={`${entityPath(entity)}/events`} className="text-sm text-link hover:underline">
              {t('viewAll')}
            </Link>
          }
        >
          {insights?.events && <SectionInsight content={insights.events} className="mb-4" />}
          <EventHeatmapLoader entityId={entity.id} showFilters={false} />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionL2 title={t('mostRelevant')}>
              <EventList events={mostRelevantEvents} />
            </SectionL2>

            <SectionL2 title={t('latest')}>
              <EventList events={latestEvents} />
            </SectionL2>
          </div>
        </SectionL1>

        <SectionL1 id="performance" title={t('performanceIndicators')}>
          {insights?.performanceIndicators && (
            <SectionInsight content={insights.performanceIndicators} className="mb-4" />
          )}
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </SectionL1>

        <SectionL1 id="community" title={t('pintCommunity')}>
          {insights?.community && <SectionInsight content={insights.community} className="mb-4" />}
          <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
        </SectionL1>
      </PageNavLayout>
    </div>
  )
}
