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
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { Section } from '@/components/custom-ui/section'
import { PageTitle } from '@/components/custom-ui/typography'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'
import { getStorageUrl } from '@/lib/storage'
import { ProvisionTimeline } from '@/components/provisions/provision-timeline'
import { ProvisionChangesHeatmap } from '@/components/provisions/provision-changes-heatmap'
import { EvaluationConsole } from '@/components/provisions/evaluation-console'
import { ChangeProposals } from '@/components/provisions/change-proposals'
import { getChangesByProvision } from '@/lib/actions/changes'
import { MarkdownContent } from '@/components/custom-ui/markdown-content'
import { RelevanceDots } from '@/components/custom-ui/relevance-dots'

interface PageProps {
  params: Promise<{
    slug: string
    provisionSlug: string
  }>
}

function getArtifactTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    evolution: '📈',
    distribution: '📊',
    table: '📋',
    parameters: '⚙️',
    narrative: '📝',
  }
  return icons[type] || '📄'
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

function getDataQualityIndicator(quality: string): { label: string; color: string; icon: string } {
  const indicators: Record<string, { label: string; color: string; icon: string }> = {
    verified: { label: 'Verified', color: 'text-green-600 bg-green-50', icon: '✓' },
    estimated: { label: 'Estimated', color: 'text-yellow-600 bg-yellow-50', icon: '~' },
    placeholder: { label: 'Placeholder', color: 'text-red-600 bg-red-50', icon: '?' },
  }
  return indicators[quality] || { label: quality, color: 'text-gray-600 bg-gray-50', icon: '•' }
}

type Artifact = {
  id: string
  title: string
  description: string | null
  artifactType: string
  content: string | null
  dataQuality: string
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }

  result.push(current.trim())
  return result
}

function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => parseCsvLine(line))
  return { headers, rows }
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

function TimeSeriesWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0)
    return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>

  const timeLabels = rows.map((row) => row[0] || '')
  const seriesNames = headers.slice(1)
  const series = seriesNames.map((name, seriesIndex) => ({
    name,
    values: rows.map((row) => parseFloat(row[seriesIndex + 1] || '0') || 0),
  }))
  const maxValue = Math.max(...series.flatMap((s) => s.values), 1)
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs">
        {series.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${colors[i % colors.length]}`} />
            <span className="text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {timeLabels.map((label, timeIndex) => (
          <div key={timeIndex} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">
              {label}
            </span>
            <div className="flex-1 flex gap-1">
              {series.map((s, seriesIndex) => {
                const value = s.values[timeIndex]
                const width = (value / maxValue) * 100
                return (
                  <div
                    key={s.name}
                    className={`h-4 ${colors[seriesIndex % colors.length]} rounded-sm`}
                    style={{ width: `${width}%`, minWidth: value > 0 ? '2px' : '0' }}
                    title={`${s.name}: ${value.toLocaleString()}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BreakdownWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0)
    return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>

  const data = rows.map((row) => ({ label: row[0] || '', value: parseFloat(row[1] || '0') || 0 }))
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ]

  return (
    <div className="space-y-3">
      <div className="h-6 bg-muted rounded-md overflow-hidden flex">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          if (percentage < 1) return null
          return (
            <div
              key={i}
              className={`${colors[i % colors.length]} h-full transition-all`}
              style={{ width: `${percentage}%` }}
              title={`${item.label}: ${percentage.toFixed(1)}%`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-sm ${colors[i % colors.length]}`} />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{percentage.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
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
    case 'evolution':
      return <TimeSeriesWidget content={artifact.content} />
    case 'distribution':
      return <BreakdownWidget content={artifact.content} />
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
  const quality = getDataQualityIndicator(artifact.dataQuality)

  return (
    <div className="border border-border/30 rounded-md p-4 bg-background/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" title={getArtifactTypeLabel(artifact.artifactType)}>
          {getArtifactTypeIcon(artifact.artifactType)}
        </span>
        <h3 className="font-medium text-sm flex-1">{artifact.title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {getArtifactTypeLabel(artifact.artifactType)}
        </span>
        {artifact.dataQuality !== 'verified' && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${quality.color}`} title={quality.label}>
            {quality.icon} {quality.label}
          </span>
        )}
      </div>
      {artifact.description && (
        <p className="text-sm text-muted-foreground mb-3">{artifact.description}</p>
      )}
      <ArtifactWidget artifact={artifact} />
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
      descriptionShort: provisions.descriptionShort,
      summaryMd: provisions.summaryMd,
      avatarUrl: provisions.avatarUrl,
      relevance: provisions.relevance,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      displayData: provisions.displayData,
      evaluationSummary: provisions.evaluationSummary,
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

  const linkedArtifacts = await db
    .select({
      id: artifacts.id,
      title: artifacts.title,
      description: artifacts.description,
      artifactType: artifacts.artifactType,
      content: artifacts.content,
      dataQuality: artifacts.dataQuality,
    })
    .from(provisionArtifacts)
    .innerJoin(artifacts, eq(provisionArtifacts.artifactId, artifacts.id))
    .where(eq(provisionArtifacts.provisionId, provisionResult.id))

  const provision = {
    ...provisionResult,
    tags: provisionTags,
    displayData: provisionResult.displayData || { items: [] },
    evaluationSummary: provisionResult.evaluationSummary,
  }

  const mediaUrl = getStorageUrl('avatars', provision.avatarUrl)
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
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
              {provision.descriptionShort || 'No description available'}
            </p>
          </div>
        </div>

        {provision.effectiveFrom && (
          <div className="text-sm text-muted-foreground">
            Since {new Date(provision.effectiveFrom).getFullYear()}
          </div>
        )}
      </div>

      {/* Evaluation Console */}
      <EvaluationConsole data={provision.evaluationSummary} />

      {/* Key Data */}
      {provision.displayData?.items && provision.displayData.items.length > 0 && (
        <Section title="Key Data">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {provision.displayData.items.map((item, index) => (
              <div key={index}>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-lg font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Description */}
      {provision.description && (
        <Section title="Description">
          <MarkdownContent content={provision.description} />
        </Section>
      )}

      {/* Summary */}
      {provision.summaryMd && (
        <Section title="Summary">
          <MarkdownContent content={provision.summaryMd} />
        </Section>
      )}

      {/* Change Proposals */}
      {provision.evaluationSummary?.proposals &&
        provision.evaluationSummary.proposals.items.length > 0 && (
          <Section title="Proposte di Modifica">
            <ChangeProposals data={provision.evaluationSummary.proposals} />
          </Section>
        )}

      {/* Changes Heatmap */}
      {provisionChanges.length > 0 && (
        <Section title="Calendario Modifiche">
          <ProvisionChangesHeatmap changes={provisionChanges} />
        </Section>
      )}

      {/* Change History */}
      {provisionChanges.length > 0 && (
        <Section title="Change History">
          <ProvisionTimeline changes={provisionChanges} />
        </Section>
      )}

      {/* Artifacts */}
      {linkedArtifacts.length > 0 && (
        <Section title="Data & Artifacts">
          <div className="space-y-4">
            {linkedArtifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </Section>
      )}

      {/* Performance & Comparison - Coming Soon */}
      <Section title="Performance & Comparison">
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
      </Section>

      {/* Community & Sentiment - Coming Soon */}
      <Section title="Community & Sentiment">
        <div className="space-y-6">
          {/* Reactions */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>👍</span> Community Reactions
            </h4>
            <div className="flex gap-6 opacity-50">
              <div className="flex items-center gap-2">
                <span className="text-lg">👍</span>
                <span className="text-sm font-medium">--</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👎</span>
                <span className="text-sm font-medium">--</span>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>📊</span> Sentiment Analysis
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Overall public sentiment from discussions and comments
            </p>
            <div className="opacity-50">
              <div className="h-3 bg-background rounded-full overflow-hidden flex">
                <div className="bg-green-400 h-full" style={{ width: '40%' }}></div>
                <div className="bg-gray-300 h-full" style={{ width: '35%' }}></div>
                <div className="bg-red-400 h-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Positive --%</span>
                <span>Neutral --%</span>
                <span>Negative --%</span>
              </div>
            </div>
          </div>

          {/* Discussion Highlights */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>💬</span> Discussion Highlights
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Summarized forum posts and trending topics
            </p>
            <div className="space-y-2 opacity-50">
              <div className="bg-background rounded p-2">
                <div className="text-xs text-muted-foreground">No discussions yet</div>
              </div>
            </div>
          </div>

          {/* Recent Comments */}
          <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>✍️</span> Recent Comments
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Latest citizen feedback and opinions
            </p>
            <div className="space-y-2 opacity-50">
              <div className="bg-background rounded p-2">
                <div className="text-xs text-muted-foreground">No comments yet</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Back link */}
      <div className="mt-8 pt-4 border-t border-border">
        <Link
          href={`${entityPath(entity)}/pr`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to provisions
        </Link>
      </div>
    </div>
  )
}
