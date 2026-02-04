import { Vote } from 'lucide-react'
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

function formatTimeUntil(dateStr: string): { text: string; isPast: boolean; isNear: boolean } {
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return { text: 'passate', isPast: true, isNear: false }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  const isNear = months < 6

  if (years > 0) {
    const yearText = years === 1 ? '1 anno' : `${years} anni`
    const monthText = remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mese' : 'mesi'}` : ''
    return { text: `tra ${yearText}${monthText}`, isPast: false, isNear }
  } else if (months > 0) {
    return { text: `tra ${months} ${months === 1 ? 'mese' : 'mesi'}`, isPast: false, isNear }
  } else if (days > 1) {
    return { text: `tra ${days} giorni`, isPast: false, isNear: true }
  } else if (days === 1) {
    return { text: 'domani', isPast: false, isNear: true }
  } else {
    return { text: 'oggi', isPast: false, isNear: true }
  }
}

function formatElectionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatFullElectionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
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

// Election card constants
const MAX_CANDIDATES = 6

// Thin bar component for election results
function ThinResultBar({
  results,
}: {
  results: Array<{ candidate: string; coalition: string; percentage: number; color: string }>
}) {
  const visibleResults = results.slice(0, MAX_CANDIDATES)
  const aggregatedResults = results.slice(MAX_CANDIDATES)
  const altriPercentage = aggregatedResults.reduce((sum, r) => sum + r.percentage, 0)

  const allResults = [
    ...visibleResults,
    ...(altriPercentage > 0
      ? [{ candidate: 'Altri', coalition: '', percentage: altriPercentage, color: '#9E9E9E' }]
      : []),
  ]

  const total = allResults.reduce((sum, r) => sum + r.percentage, 0)

  return (
    <div className="w-full h-1 rounded-full overflow-hidden flex">
      {allResults.map((result, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: result.color,
            width: `${(result.percentage / total) * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

// Single election card with bar + list
function ElectionCard({
  election,
}: {
  election: {
    date: string
    turnout?: number
    results: Array<{ candidate: string; coalition: string; percentage: number; color: string }>
  }
}) {
  const visibleResults = election.results.slice(0, MAX_CANDIDATES)
  const aggregatedResults = election.results.slice(MAX_CANDIDATES)
  const altriPercentage = aggregatedResults.reduce((sum, r) => sum + r.percentage, 0)

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="text-xs text-muted-foreground">
        {formatElectionDate(election.date)}
        {election.turnout && ` · Affluenza ${election.turnout.toFixed(1)}%`}
      </div>

      {/* Thin bar */}
      <ThinResultBar results={election.results} />

      {/* Results list */}
      <div className="space-y-0.5">
        {visibleResults.map((result, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: result.color }} />
            <span className="text-xs flex-1 truncate">
              <span className="font-medium">{result.candidate}</span>
              <span className="text-muted-foreground"> ({result.coalition})</span>
            </span>
            <span className="text-xs font-semibold tabular-nums">{result.percentage.toFixed(1)}%</span>
          </div>
        ))}
        {altriPercentage > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-400" />
            <span className="text-xs text-muted-foreground flex-1">Altri</span>
            <span className="text-xs tabular-nums text-muted-foreground">{altriPercentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Next election card with countdown
function NextElectionCard({ date }: { date: string }) {
  const countdown = formatTimeUntil(date)
  const fullDate = formatFullElectionDate(date)

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
      <Vote className="w-6 h-6 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">Prossime elezioni</div>
        <div className="text-xs text-muted-foreground">{fullDate}</div>
      </div>
      <div
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          countdown.isNear
            ? 'bg-warning/15 text-warning'
            : countdown.isPast
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary'
        }`}
      >
        {countdown.text}
      </div>
    </div>
  )
}

// Elections section - Next election + historical results in grid
function ElectionsSection({
  nextElection,
  history,
}: {
  nextElection: NonNullable<PoliticalLandscapeProps['data']>['nextElection']
  history: NonNullable<PoliticalLandscapeProps['data']>['electionHistory']
}) {
  if (!nextElection && (!history || history.length === 0)) return null

  const electionsWithResults = history?.filter((election) => election.results.length > 0) || []

  return (
    <div>
      <SectionHeader>Elezioni</SectionHeader>

      {/* Next election */}
      {nextElection && <NextElectionCard date={nextElection.date} />}

      {/* Historical elections in grid */}
      {electionsWithResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionsWithResults.map((election, idx) => (
            <ElectionCard key={idx} election={election} />
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
