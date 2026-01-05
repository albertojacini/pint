import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import {
  politicalEntities,
  provisions,
  tags,
  taggables,
  ideas,
  provisionTypes,
  provisionTypeAssociations,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ProvisionCardRow4 } from '@/components/provisions/provision-card-row4'
import { ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'
import { getStorageUrl } from '@/lib/storage'

interface PageProps {
  params: Promise<{
    slug: string
    provisionSlug: string
  }>
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    repealed: 'bg-red-500',
    suspended: 'bg-yellow-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Map 0-10 to 1-5 dots
function getScoreDots(score: number | null): number {
  if (score === null || score === undefined) return 0
  return Math.ceil(score / 2)
}

// Get color based on score (0-10 scale)
function getScoreColor(score: number | null): string {
  if (score === null || score === undefined) return 'rgb(209 213 219)'
  if (score >= 7) return 'rgb(34 197 94)'
  if (score >= 4) return 'rgb(234 179 8)'
  return 'rgb(239 68 68)'
}

export default async function ProvisionDetailPage({ params }: PageProps) {
  const { slug: entityUrlSlug, provisionSlug: provisionUrlSlug } = await params
  const { idPrefix: entityIdPrefix } = parseUrlSlug(entityUrlSlug)
  const { idPrefix: provisionIdPrefix } = parseUrlSlug(provisionUrlSlug)

  // Fetch the entity
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(idStartsWith(politicalEntities.id, entityIdPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch the provision
  const [provisionResult] = await db
    .select({
      id: provisions.id,
      title: provisions.title,
      slug: provisions.slug,
      description: provisions.description,
      descriptionShort: provisions.descriptionShort,
      summaryMd: provisions.summaryMd,
      avatarUrl: provisions.avatarUrl,
      status: provisions.status,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      ideaId: provisions.ideaId,
      displayData: provisions.displayData,
    })
    .from(provisions)
    .where(idStartsWith(provisions.id, provisionIdPrefix))

  if (!provisionResult) {
    notFound()
  }

  // Fetch types for this provision
  const provisionTypesList = await db
    .select({
      id: provisionTypes.id,
      code: provisionTypes.code,
      label: provisionTypes.label,
      description: provisionTypes.description,
      icon: provisionTypes.icon,
      color: provisionTypes.color,
    })
    .from(provisionTypeAssociations)
    .innerJoin(provisionTypes, eq(provisionTypeAssociations.typeId, provisionTypes.id))
    .where(eq(provisionTypeAssociations.provisionId, provisionResult.id))

  // Fetch idea if linked
  let ideaTitle: string | null = null
  if (provisionResult.ideaId) {
    const [idea] = await db
      .select({ title: ideas.title })
      .from(ideas)
      .where(eq(ideas.id, provisionResult.ideaId))
    ideaTitle = idea?.title || null
  }

  // Fetch tags for this provision
  const provisionTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      category: tags.category,
    })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(
      and(eq(taggables.taggableType, 'provision'), eq(taggables.taggableId, provisionResult.id))
    )

  const provision = {
    ...provisionResult,
    tags: provisionTags,
    ideaTitle,
    displayData: provisionResult.displayData || { items: [] },
  }

  const relevanceDots = getScoreDots(provision.relevance)
  const relevanceColor = getScoreColor(provision.relevance)
  const mediaUrl = getStorageUrl('avatars', provision.avatarUrl)

  // Filter tags to only show policy-topic and impact-area categories
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href={`${entityPath(entity)}/pr`}
        className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
      >
        ← Back to provisions
      </Link>

      <div className="border border-border/50 rounded-lg p-6 bg-card">
        {/* Row 1: Type Badges + Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {provisionTypesList.map((type) => (
            <ProvisionClassificationBadge key={type.id} type={type.code as any} />
          ))}
          <Tags tags={visibleTags} maxTags={3} />
        </div>

        {/* Row 2: Title + Relevance Dots */}
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold flex-1">{provision.title}</h1>

          {/* Relevance indicator (5 dots) */}
          <div className="flex items-center gap-0.5 flex-shrink-0" title="Relevance">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{
                  backgroundColor: dot <= relevanceDots ? relevanceColor : 'rgb(229 231 235)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Row 3: Avatar Image + Description */}
        <div className="flex gap-4 mb-6">
          {/* Avatar image (only show if exists) */}
          {mediaUrl && (
            <img
              src={mediaUrl}
              alt={provision.title}
              className="w-16 h-16 flex-shrink-0 rounded-lg object-cover"
            />
          )}

          {/* Description */}
          <p className="text-base text-muted-foreground flex-1">
            {provision.descriptionShort || 'No description available'}
          </p>
        </div>

        {/* Row 4: Type-Specific Content */}
        <ProvisionCardRow4 types={provisionTypesList} displayData={provision.displayData} />

        {/* Row 5: Stats + Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Left: Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(provision.status)}`} />
              <span className="capitalize">{provision.status}</span>
            </div>

            {/* Effective year */}
            {provision.effectiveFrom && (
              <span>Since {new Date(provision.effectiveFrom).getFullYear()}</span>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex items-center gap-2 text-sm">
            {/* Linked idea */}
            {provision.ideaTitle && provision.ideaId && (
              <Link
                href={`/ideas/${provision.ideaId}`}
                className="text-primary hover:underline flex items-center gap-1.5"
              >
                <span>💡</span>
                <span className="max-w-[150px] truncate">{provision.ideaTitle}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Full Description */}
      {provision.description && (
        <div className="mt-6 border border-border/50 rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{provision.description}</p>
        </div>
      )}

      {/* Summary */}
      {provision.summaryMd && (
        <div className="mt-6 border border-border/50 rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <pre className="whitespace-pre-wrap font-sans text-sm">{provision.summaryMd}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
