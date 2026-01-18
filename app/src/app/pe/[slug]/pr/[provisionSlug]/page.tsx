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
  knoArtifacts,
  govProvisionArtifacts,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'
import { getStorageUrl } from '@/lib/storage'
import { ProvisionTimeline } from '@/components/provisions/provision-timeline'
import { getChangesByProvision } from '@/lib/actions/changes'

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

// Get icon for artifact type
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

// Get label for artifact type
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

// Get data quality indicator
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

// Parse a single CSV line handling quoted fields
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true
      } else if (char === ',') {
        // Field separator
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }

  // Push the last field
  result.push(current.trim())
  return result
}

// Parse CSV content into rows
function parseCsv(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => parseCsvLine(line))
  return { headers, rows }
}

// Parse YAML-like parameters content
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

// Time Series Widget - horizontal bar chart
function TimeSeriesWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0) return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows (only header: {headers.join(', ')})</p>

  // Assume first column is label (e.g., year), second is value
  const labelIndex = 0
  const valueIndex = headers.length > 1 ? 1 : 0
  const valueHeader = headers[valueIndex] || 'Value'

  const data = rows.map((row) => ({
    label: row[labelIndex] || '',
    value: parseFloat(row[valueIndex] || '0') || 0,
  }))

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-3">{valueHeader}</div>
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-sm transition-all"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium w-16 flex-shrink-0">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// Breakdown Widget - horizontal stacked bar or individual bars with percentages
function BreakdownWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0) return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows</p>

  // Assume first column is category, second is value
  const data = rows.map((row) => ({
    label: row[0] || '',
    value: parseFloat(row[1] || '0') || 0,
  }))

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
      {/* Stacked bar */}
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
      {/* Legend */}
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

// Parameters Widget - key-value grid
function ParametersWidget({ content }: { content: string }) {
  const params = parseParameters(content)
  if (params.length === 0) return <p className="text-sm text-yellow-600">No parameters found (content: {content.slice(0, 100)}...)</p>

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

// Narrative Widget - formatted prose
function NarrativeWidget({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
    </div>
  )
}

// Dataset Widget - enhanced table
function DatasetWidget({ content }: { content: string }) {
  const { headers, rows } = parseCsv(content)
  if (headers.length === 0) return <p className="text-sm text-red-500">Error: no CSV headers found</p>
  if (rows.length === 0) return <p className="text-sm text-yellow-600">No data rows (only header: {headers.join(', ')})</p>

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

// Artifact Widget Router
function ArtifactWidget({ artifact }: { artifact: Artifact }) {
  if (artifact.content === null || artifact.content === undefined) {
    return <p className="text-sm text-red-500">Error: content is null</p>
  }

  if (artifact.content === '') {
    return <p className="text-sm text-red-500">Error: content is empty string</p>
  }

  try {
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
          <div>
            <p className="text-sm text-yellow-600 mb-2">Unknown type: {artifact.artifactType}</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono">
              {artifact.content}
            </pre>
          </div>
        )
    }
  } catch (error) {
    return (
      <div className="text-sm text-red-500">
        <p>Error rendering widget: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap font-mono">
          {artifact.content.slice(0, 200)}...
        </pre>
      </div>
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

  // Fetch changes for this provision
  const provisionChanges = await getChangesByProvision(provisionResult.id)

  // Fetch artifacts linked to this provision
  const provisionArtifacts = await db
    .select({
      id: knoArtifacts.id,
      title: knoArtifacts.title,
      description: knoArtifacts.description,
      artifactType: knoArtifacts.artifactType,
      content: knoArtifacts.content,
      dataQuality: knoArtifacts.dataQuality,
    })
    .from(govProvisionArtifacts)
    .innerJoin(knoArtifacts, eq(govProvisionArtifacts.artifactId, knoArtifacts.id))
    .where(eq(govProvisionArtifacts.provisionId, provisionResult.id))

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

        {/* Row 4: Display Data */}
        {provision.displayData?.items && provision.displayData.items.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {provision.displayData.items.map((item, index) => (
              <div key={index}>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        )}

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

      {/* Change History */}
      {provisionChanges.length > 0 && (
        <div className="mt-6 border border-border/50 rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Change History</h2>
          <ProvisionTimeline changes={provisionChanges} />
        </div>
      )}

      {/* Artifacts */}
      {provisionArtifacts.length > 0 && (
        <div className="mt-6 border border-border/50 rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Data & Artifacts</h2>
          <div className="space-y-4">
            {provisionArtifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
