import { db } from '@/lib/db/client'
import { entities, taggables, tags } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventsByEntity } from '@/lib/actions/events'
import { getGroupedEntityRelationships } from '@/lib/actions/entity-relationships'
import {
  EntityHeader,
  EntityActions,
  EssentialStats,
  AdministrationsSection,
  PerformanceIndicators,
  CommunityMetrics,
  ProvisionsSection,
  EventsSection,
  EntityMetadata,
  RelatedEntitiesSection,
} from '@/components/entities'
import { Section } from '@/components/custom-ui/section'
import { Tags } from '@/components/custom-ui/tags'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { parseUrlSlug, idStartsWith, entityPath } from '@/lib/utils'

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
      <RelatedEntitiesSection relationships={relationships} />
      <EssentialStats population={entity.population} stats={entity.essentialStats} />
      <EntityActions entity={entity} />
      <AdministrationsSection entity={entity} />

      <Section
        title="Administration"
        action={
          <Link href={`/pe/${urlSlug}/pr`} className="text-sm text-link hover:underline">
            View all
          </Link>
        }
      >
        <ProvisionsSection entity={entity} />
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
        <EventsSection entity={entity} events={events} />
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
