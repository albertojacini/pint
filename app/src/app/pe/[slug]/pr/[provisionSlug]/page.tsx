import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import {
  entities,
  provisions,
  tags,
  taggables,
  provisionTypes,
  provisionTypeAssocs,
  artifacts,
  provisionArtifacts,
  artifactSources,
  documents,
} from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { SectionL1 } from '@/components/custom-ui/section'
import { PageTitle } from '@/components/custom-ui/typography'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { getStorageUrl } from '@/lib/storage'
import { ProvisionTimeline } from '@/components/provisions/provision-timeline'
import { ProvisionChangesHeatmap } from '@/components/provisions/provision-changes-heatmap'
import { EvaluationConsole } from '@/components/provisions/evaluation-console'
import { ChangeProposals } from '@/components/provisions/change-proposals'
import { getChangesByProvision } from '@/lib/actions/changes'
import { MarkdownContent } from '@/components/custom-ui/markdown-content'
import { RelevanceDots } from '@/components/custom-ui/relevance-dots'
import { parseCsv } from '@/lib/csv'
import { TimeSeriesChart } from '@/components/charts/time-series-chart'
import { BreakdownChart } from '@/components/charts/breakdown-chart'
import { getPosts } from '@/lib/actions/discussions'

interface PageProps {
  params: Promise<{
    slug: string
    provisionSlug: string
  }>
}

function getArtifactTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    evolution: 'Evolution',
    distribution: 'Distribution',
    table: 'Table',
    parameters: 'Parameters',
    narrative: 'Narrative',
  }
  return labels[type] || type
}

function getArtifactOriginIndicator(origin: string): { label: string; color: string; icon: string } | null {
  // 'extracted' is the default (source-backed), no indicator needed
  // 'curated' may contain gaps/estimates, show indicator
  if (origin === 'curated') {
    return { label: 'Curated', color: 'text-blue-600 bg-blue-50', icon: '◇' }
  }
  return null
}

function getStateIndicator(state: string): { label: string; color: string; icon: string } {
  const indicators: Record<string, { label: string; color: string; icon: string }> = {
    draft: { label: 'Draft', color: 'text-gray-600 bg-gray-100', icon: '○' },
    partial: { label: 'Partial', color: 'text-amber-600 bg-amber-50', icon: '◐' },
    complete: { label: 'Complete', color: 'text-green-600 bg-green-50', icon: '●' },
    stale: { label: 'Stale', color: 'text-red-600 bg-red-50', icon: '◌' },
  }
  return indicators[state] || indicators.draft
}

type ArtifactSource = {
  id: string
  title: string | null
  url: string | null
  documentType: string
}

type Artifact = {
  id: string
  title: string
  description: string | null
  artifactType: string
  content: string | null
  artifactOrigin: string
  state: string
  stateNotes: string | null
  derivationNotes: string | null
  sources: ArtifactSource[]
}

function parseParameters(content: string): { key: string; value: string }[] {
  const lines = content.trim().split('\n')
  return lines
    .map((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return null
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      return { key, value }
    })
    .filter((item): item is { key: string; value: string } => item !== null)
}

function ParametersWidget({ content }: { content: string }) {
  const params = parseParameters(content)
  if (params.length === 0) return <p className="text-sm text-yellow-600">No parameters found</p>

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {params.map((param, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-xs text-muted-foreground">{param.key}</span>
          <span className="text-sm font-medium">{param.value}</span>
        </div>
      ))}
    </div>
  )
}

function NarrativeWidget({ content }: { content: string }) {
  return (
    <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
  )
}

function DatasetWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0)
    return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="bg-muted px-3 py-2 text-left font-medium border-b border-border/50"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 border-b border-border/30">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ArtifactWidget({ artifact }: { artifact: Artifact }) {
  if (!artifact.content) return <p className="text-sm text-red-500">Error: content is empty</p>

  switch (artifact.artifactType) {
    case 'evolution': {
      const { headers, rows } = parseCsv(artifact.content)
      if (headers.length === 0)
        return <p className="text-sm text-red-500">Error: no CSV headers found</p>
      if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>
      const timeLabels = rows.map((row) => row[0] || '')
      const series = headers.slice(1).map((name, i) => ({
        name,
        values: rows.map((row) => parseFloat(row[i + 1] || '0') || 0),
      }))
      return <TimeSeriesChart data={{ timeLabels, series }} />
    }
    case 'distribution': {
      const { headers, rows } = parseCsv(artifact.content)
      if (headers.length === 0)
        return <p className="text-sm text-red-500">Error: no CSV headers found</p>
      if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>
      const items = rows.map((row) => ({
        label: row[0] || '',
        value: parseFloat(row[1] || '0') || 0,
      }))
      return <BreakdownChart data={{ items }} />
    }
    case 'parameters':
      return <ParametersWidget content={artifact.content} />
    case 'narrative':
      return <NarrativeWidget content={artifact.content} />
    case 'table':
      return <DatasetWidget content={artifact.content} />
    default:
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono">
          {artifact.content}
        </pre>
      )
  }
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const originIndicator = getArtifactOriginIndicator(artifact.artifactOrigin)
  const stateIndicator = getStateIndicator(artifact.state)
  const hasMetadata = artifact.derivationNotes || artifact.stateNotes || artifact.sources.length > 0

  return (
    <div className="border border-border/30 rounded-md p-4 bg-background/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-medium text-sm flex-1">{artifact.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {getArtifactTypeLabel(artifact.artifactType)}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${stateIndicator.color}`}
          title={`Data state: ${stateIndicator.label}`}
        >
          {stateIndicator.icon} {stateIndicator.label}
        </span>
        {originIndicator && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${originIndicator.color}`}
            title="May contain estimates or gaps"
          >
            {originIndicator.icon} {originIndicator.label}
          </span>
        )}
      </div>

      {/* Description */}
      {artifact.description && (
        <p className="text-sm text-muted-foreground mb-3">{artifact.description}</p>
      )}

      {/* Data Widget */}
      <ArtifactWidget artifact={artifact} />

      {/* Metadata Section */}
      {hasMetadata && (
        <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
          {/* State Notes */}
          {artifact.stateNotes && (
            <div className="text-xs">
              <span className="text-muted-foreground font-medium">Data notes: </span>
              <span className="text-muted-foreground">{artifact.stateNotes}</span>
            </div>
          )}

          {/* Derivation Notes */}
          {artifact.derivationNotes && (
            <div className="text-xs">
              <span className="text-muted-foreground font-medium">Methodology: </span>
              <span className="text-muted-foreground">{artifact.derivationNotes}</span>
            </div>
          )}

          {/* Sources */}
          {artifact.sources.length > 0 && (
            <div className="text-xs">
              <span className="text-muted-foreground font-medium">Sources: </span>
              <span className="text-muted-foreground">
                {artifact.sources.map((source, i) => (
                  <span key={source.id}>
                    {i > 0 && ', '}
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.title || 'Source document'}
                      </a>
                    ) : (
                      source.title || 'Source document'
                    )}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default async function ProvisionDetailPage({ params }: PageProps) {
  const { slug: entityUrlSlug, provisionSlug: provisionUrlSlug } = await params
  const { idPrefix: entityIdPrefix } = parseUrlSlug(entityUrlSlug)
  const { idPrefix: provisionIdPrefix } = parseUrlSlug(provisionUrlSlug)

  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, entityIdPrefix))
  if (!entity) notFound()

  const [provisionResult] = await db
    .select({
      id: provisions.id,
      title: provisions.title,
      slug: provisions.slug,
      description: provisions.description,
      tagline: provisions.tagline,
      analysis: provisions.analysis,
      avatarUrl: provisions.avatarUrl,
      relevance: provisions.relevance,
      highlights: provisions.highlights,
      console: provisions.console,
    })
    .from(provisions)
    .where(idStartsWith(provisions.id, provisionIdPrefix))

  if (!provisionResult) notFound()

  const provisionTypesList = await db
    .select({
      id: provisionTypes.id,
      code: provisionTypes.code,
      label: provisionTypes.label,
      description: provisionTypes.description,
      icon: provisionTypes.icon,
      color: provisionTypes.color,
    })
    .from(provisionTypeAssocs)
    .innerJoin(provisionTypes, eq(provisionTypeAssocs.typeId, provisionTypes.id))
    .where(eq(provisionTypeAssocs.provisionId, provisionResult.id))

  const provisionTags = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug, category: tags.category })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(
      and(eq(taggables.taggableType, 'provision'), eq(taggables.taggableId, provisionResult.id))
    )

  const provisionChanges = await getChangesByProvision(provisionResult.id)

  const artifactsData = await db
    .select({
      id: artifacts.id,
      title: artifacts.title,
      description: artifacts.description,
      artifactType: artifacts.artifactType,
      content: artifacts.content,
      artifactOrigin: artifacts.artifactOrigin,
      state: artifacts.state,
      stateNotes: artifacts.stateNotes,
      derivationNotes: artifacts.derivationNotes,
    })
    .from(provisionArtifacts)
    .innerJoin(artifacts, eq(provisionArtifacts.artifactId, artifacts.id))
    .where(eq(provisionArtifacts.provisionId, provisionResult.id))

  // Fetch sources for each artifact
  const artifactIds = artifactsData.map((a) => a.id)
  const sourcesData = artifactIds.length > 0
    ? await db
        .select({
          artifactId: artifactSources.artifactId,
          documentId: documents.id,
          title: documents.title,
          url: documents.url,
          documentType: documents.documentType,
        })
        .from(artifactSources)
        .innerJoin(documents, eq(artifactSources.documentId, documents.id))
        .where(inArray(artifactSources.artifactId, artifactIds))
    : []

  // Group sources by artifact
  const sourcesByArtifact = sourcesData.reduce(
    (acc, source) => {
      if (!acc[source.artifactId]) acc[source.artifactId] = []
      acc[source.artifactId].push({
        id: source.documentId,
        title: source.title,
        url: source.url,
        documentType: source.documentType,
      })
      return acc
    },
    {} as Record<string, ArtifactSource[]>
  )

  const linkedArtifacts: Artifact[] = artifactsData.map((a) => ({
    ...a,
    sources: sourcesByArtifact[a.id] || [],
  }))

  const recentPosts = await getPosts('provision', provisionResult.id, 'recent')

  const provision = {
    ...provisionResult,
    tags: provisionTags,
    highlights: provisionResult.highlights || { items: [] },
    console: provisionResult.console,
  }

  const mediaUrl = getStorageUrl('avatars', provision.avatarUrl)
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Entities', href: '/pe' },
          { label: entity.name, href: entityPath(entity) },
          { label: 'Provisions', href: `${entityPath(entity)}/pr` },
          { label: provision.title },
        ]}
      />

      {/* Type Badges + Tags */}
      <div className="flex items-center gap-2 mb-6">
        {provisionTypesList.map((type) => (
          <ProvisionClassificationBadge key={type.id} type={type.code as any} />
        ))}
        <Tags tags={visibleTags} maxTags={3} className="ml-auto" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          {mediaUrl && (
            <img
              src={mediaUrl}
              alt={provision.title}
              className="w-16 h-16 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-1">
              <PageTitle>{provision.title}</PageTitle>
              <div className="ml-auto">
                <RelevanceDots score={provision.relevance} size="md" />
              </div>
            </div>
            <p className="text-muted-foreground">
              {provision.tagline || 'No description available'}
            </p>
          </div>
        </div>

      </div>

      {/* Evaluation Console */}
      <EvaluationConsole data={provision.console} />

      {/* Key Data */}
      {provision.highlights?.items && provision.highlights.items.length > 0 && (
        <SectionL1 title="Key Data">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {provision.highlights.items.map((item, index) => (
              <div key={index}>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-lg font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </SectionL1>
      )}

      {/* Description */}
      {provision.description && (
        <SectionL1 title="Description">
          <MarkdownContent content={provision.description} />
        </SectionL1>
      )}

      {/* Analysis */}
      {provision.analysis && (
        <SectionL1 title="Analysis">
          <MarkdownContent content={provision.analysis} />
        </SectionL1>
      )}

      {/* Change Proposals */}
      {provision.console?.proposals &&
        provision.console.proposals.items.length > 0 && (
          <SectionL1 title="Proposte di Modifica">
            <ChangeProposals data={provision.console.proposals} />
          </SectionL1>
        )}

      {/* Changes Heatmap + Timeline */}
      {provisionChanges.length > 0 && (
        <SectionL1 title="Calendario">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <ProvisionChangesHeatmap changes={provisionChanges} />
            </div>
            <div className="flex-1 min-w-0">
              <ProvisionTimeline changes={provisionChanges} />
            </div>
          </div>
        </SectionL1>
      )}

      {/* Artifacts */}
      {linkedArtifacts.length > 0 && (
        <SectionL1 title="Data & Artifacts">
          <div className="space-y-4">
            {linkedArtifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </SectionL1>
      )}

      {/* Performance & Comparison - Coming Soon */}
      <SectionL1 title="Performance & Comparison">
        <div className="space-y-6">
          {/* Goals & Achievements */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🎯</span> Goals & Achievements
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              KPIs with targets vs. actuals, progress tracking over time
            </p>
            <div className="grid grid-cols-3 gap-3 opacity-50">
              <div className="bg-background rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Target</div>
                <div className="text-sm font-medium">--</div>
              </div>
              <div className="bg-background rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Actual</div>
                <div className="text-sm font-medium">--</div>
              </div>
              <div className="bg-background rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="text-sm font-medium">--%</div>
              </div>
            </div>
          </div>

          {/* Theory vs Implementation Analysis */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>⚖️</span> Theory vs. Implementation
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              How the general policy concept compares to this specific implementation
            </p>
            <div className="overflow-x-auto opacity-50">
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 font-medium">Aspect</th>
                    <th className="text-left py-2 px-2 font-medium">Theory (General)</th>
                    <th className="text-left py-2 px-2 font-medium">This Implementation</th>
                    <th className="text-center py-2 px-2 font-medium w-16">Rating</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/30">
                    <td className="py-2 px-2">Coverage</td>
                    <td className="py-2 px-2">City-wide zones</td>
                    <td className="py-2 px-2">Central area only</td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-block w-4 h-4 rounded bg-yellow-200"></span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 px-2">Pricing</td>
                    <td className="py-2 px-2">Dynamic pricing</td>
                    <td className="py-2 px-2">Fixed tariff</td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-block w-4 h-4 rounded bg-red-200"></span>
                    </td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 px-2">Exemptions</td>
                    <td className="py-2 px-2">Minimal</td>
                    <td className="py-2 px-2">Well-targeted</td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-block w-4 h-4 rounded bg-green-200"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stakeholder Impact */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>👥</span> Stakeholder Impact
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Who benefits, who is affected, interest group positions
            </p>
            <div className="flex gap-4 opacity-50">
              <div className="flex-1 bg-green-50 rounded p-2 text-center">
                <div className="text-xs text-green-700">Benefits</div>
                <div className="text-sm text-green-800">-- groups</div>
              </div>
              <div className="flex-1 bg-red-50 rounded p-2 text-center">
                <div className="text-xs text-red-700">Affected</div>
                <div className="text-sm text-red-800">-- groups</div>
              </div>
            </div>
          </div>

          {/* Financial Impact */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>💰</span> Financial & Economic Impact
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Budget allocation, revenue generated, cost-benefit analysis
            </p>
            <div className="grid grid-cols-2 gap-3 opacity-50">
              <div className="bg-background rounded p-2">
                <div className="text-xs text-muted-foreground">Annual Budget</div>
                <div className="text-sm font-medium">€--</div>
              </div>
              <div className="bg-background rounded p-2">
                <div className="text-xs text-muted-foreground">Revenue Generated</div>
                <div className="text-sm font-medium">€--</div>
              </div>
            </div>
          </div>

          {/* Comparative Benchmarking */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>🌍</span> Comparative Benchmarking
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Similar provisions in other places, effectiveness comparison
            </p>
            <div className="flex flex-wrap gap-2 opacity-50">
              <span className="text-xs bg-background px-2 py-1 rounded">London</span>
              <span className="text-xs bg-background px-2 py-1 rounded">Stockholm</span>
              <span className="text-xs bg-background px-2 py-1 rounded">Singapore</span>
              <span className="text-xs text-muted-foreground px-2 py-1">+ more</span>
            </div>
          </div>
        </div>
      </SectionL1>

      {/* Community Discussions */}
      <SectionL1
        title="Discussions"
        action={
          <Link
            href={`/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions`}
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        }
      >
        {recentPosts.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 bg-muted/20 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No discussions yet. Be the first to start a conversation!
            </p>
            <Link
              href={`/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions/new`}
              className="text-sm text-primary hover:underline"
            >
              Start a discussion
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPosts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions/${post.id}`}
                className="block border border-border/50 rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {post.postType}
                  </span>
                  {post.isPinned && <span className="text-xs text-muted-foreground">Pinned</span>}
                </div>
                <h4 className="text-sm font-medium">{post.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{post.score} votes</span>
                  <span>{post.commentCount} comments</span>
                  <span>{post.authorName || 'Anonymous'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionL1>

    </div>
  )
}
