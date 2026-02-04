import { PercentageBar, type PercentageBarItem } from '@/components/custom-ui/percentage-bar'
import { CouncilDots } from './council-dots'
import { ExecutiveMembers } from './executive-members'

interface PoliticalLandscapeProps {
  data: {
    councilComposition?: Array<{
      party: string
      seats: number
      color?: string // Optional - CouncilDots assigns colors from palette
    }>
    executiveMembers?: Array<{
      name: string
      role: 'mayor' | 'councilor' | 'minister' | 'president' | 'governor' | 'member'
      roleTitle?: string
      icon?: string
      party?: string
    }>
    nextElection?: {
      date: string
    }
    electionHistory?: Array<{
      date: string
      turnout?: number
      results: Array<{
        candidate: string
        coalition: string
        percentage: number
        color: string
      }>
    }>
  } | null
  entitySlug?: string
}

function formatTimeUntil(dateStr: string): string {
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return 'past'

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years > 0) {
    return `in ${years}y ${remainingMonths}m`
  } else if (months > 0) {
    return `in ${months}m`
  } else {
    return `in ${days}d`
  }
}

function formatElectionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Section header component - uses muted foreground for secondary hierarchy
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-medium text-muted-foreground mb-2">{children}</h4>
}

// Legislative section - Council composition with dots
function LegislativeSection({
  composition,
}: {
  composition: NonNullable<PoliticalLandscapeProps['data']>['councilComposition']
}) {
  if (!composition || composition.length === 0) return null

  return (
    <div>
      <SectionHeader>Consiglio comunale</SectionHeader>
      <CouncilDots composition={composition} />
    </div>
  )
}

// Executive section - Council members with role icons
function ExecutiveSection({
  members,
}: {
  members: NonNullable<PoliticalLandscapeProps['data']>['executiveMembers']
}) {
  if (!members || members.length === 0) return null

  return (
    <div>
      <SectionHeader>Giunta comunale</SectionHeader>
      <ExecutiveMembers members={members} variant="grid-minimal" />
    </div>
  )
}

// Election result bar
function ElectionResultBar({
  results,
}: {
  results: Array<{ candidate: string; coalition: string; percentage: number; color: string }>
}) {
  if (results.length === 0) return null

  const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0)
  const othersPercentage = Math.max(0, 100 - totalPercentage)

  // Transform results to PercentageBar format
  const items: PercentageBarItem[] = results.map((result) => ({
    label: result.candidate,
    value: result.percentage,
    color: result.color,
    metadata: result.coalition,
  }))

  // Add "Others" if there's remaining percentage
  if (othersPercentage > 0) {
    items.push({
      label: 'Altri',
      value: othersPercentage,
      color: '#9E9E9E',
      metadata: undefined,
    })
  }

  return <PercentageBar items={items} valueType="percentage" />
}

// Elections section - Next election + historical results
function ElectionsSection({
  nextElection,
  history,
}: {
  nextElection: NonNullable<PoliticalLandscapeProps['data']>['nextElection']
  history: NonNullable<PoliticalLandscapeProps['data']>['electionHistory']
}) {
  if (!nextElection && (!history || history.length === 0)) return null

  return (
    <div>
      <SectionHeader>Elezioni</SectionHeader>

      {/* Next election */}
      {nextElection && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Prossime elezioni</span>
          <span className="text-sm text-gray-600">
            {formatElectionDate(nextElection.date)} ({formatTimeUntil(nextElection.date)})
          </span>
        </div>
      )}

      {/* Historical elections */}
      {history && history.length > 0 && (
        <div className="space-y-2">
          {history
            .filter((election) => election.results.length > 0)
            .map((election, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                  {formatElectionDate(election.date)}
                </span>
                <div className="flex-1">
                  <ElectionResultBar results={election.results} />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// Re-export for use in page (view all link)
export function getPoliticalLandscapeViewAllLink(entitySlug: string) {
  return `/pe/${entitySlug}/ad`
}

export function PoliticalLandscape({ data, entitySlug }: PoliticalLandscapeProps) {
  if (!data) return null

  const hasContent =
    (data.councilComposition && data.councilComposition.length > 0) ||
    (data.executiveMembers && data.executiveMembers.length > 0) ||
    data.nextElection ||
    (data.electionHistory && data.electionHistory.length > 0)

  if (!hasContent) return null

  return (
    <div className="space-y-6">
      <LegislativeSection composition={data.councilComposition} />
      <ExecutiveSection members={data.executiveMembers} />
      <ElectionsSection nextElection={data.nextElection} history={data.electionHistory} />
    </div>
  )
}
