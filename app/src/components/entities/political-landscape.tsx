interface PoliticalLandscapeProps {
  data: {
    councilComposition?: Array<{
      party: string
      seats: number
      color: string
    }>
    executiveMembers?: Array<{
      name: string
      role: 'mayor' | 'vice-mayor' | 'assessor' | 'councilor'
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
}

// Fallback role icons (used when icon not specified in data)
const ROLE_ICONS: Record<string, string> = {
  mayor: '🎖️',
  'vice-mayor': '🎖️',
  assessor: '📋',
  councilor: '🏛️',
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

// Section header component
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-blue-600 mb-2">{children}</h4>
}

// Legislative section - Council composition bar chart
function LegislativeSection({
  composition,
}: {
  composition: NonNullable<PoliticalLandscapeProps['data']>['councilComposition']
}) {
  if (!composition || composition.length === 0) return null

  const totalSeats = composition.reduce((sum, p) => sum + p.seats, 0)

  return (
    <div>
      <SectionHeader>Consiglio comunale</SectionHeader>
      <div className="text-xs text-gray-500 mb-2">Council Composition ({totalSeats} seats)</div>

      {/* Visual bar */}
      <div className="h-8 rounded-full overflow-hidden flex mb-2">
        {composition.map((party, idx) => {
          const percentage = (party.seats / totalSeats) * 100
          return (
            <div
              key={idx}
              className="flex items-center justify-center text-white text-xs font-semibold"
              style={{
                backgroundColor: party.color,
                width: `${percentage}%`,
              }}
              title={`${party.party}: ${party.seats} seats (${percentage.toFixed(1)}%)`}
            >
              {percentage > 15 && party.seats}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {composition.map((party, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: party.color }} />
            <span className="text-gray-700">{party.party}</span>
            <span className="text-gray-500">({party.seats})</span>
          </div>
        ))}
      </div>
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
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {members.map((member, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span>{member.icon || ROLE_ICONS[member.role] || '👤'}</span>
            <span className="text-gray-700">{member.name}</span>
          </div>
        ))}
      </div>
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

  return (
    <div className="h-6 rounded overflow-hidden flex">
      {results.map((result, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center text-white text-xs font-medium"
          style={{
            backgroundColor: result.color,
            width: `${result.percentage}%`,
          }}
        >
          {result.percentage >= 10 && `${result.candidate} ${result.percentage}%`}
        </div>
      ))}
      {othersPercentage > 0 && (
        <div
          className="flex items-center justify-center text-white text-xs font-medium"
          style={{
            backgroundColor: '#9E9E9E',
            width: `${othersPercentage}%`,
          }}
        >
          {othersPercentage >= 5 && `Altri ${othersPercentage.toFixed(1)}%`}
        </div>
      )}
    </div>
  )
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
              <div key={idx} className="flex items-center gap-3">
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

export function PoliticalLandscape({ data }: PoliticalLandscapeProps) {
  if (!data) return null

  const hasContent =
    (data.councilComposition && data.councilComposition.length > 0) ||
    (data.executiveMembers && data.executiveMembers.length > 0) ||
    data.nextElection ||
    (data.electionHistory && data.electionHistory.length > 0)

  if (!hasContent) return null

  return (
    <div className="py-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Amministrazione</h3>

      <div className="space-y-6">
        <LegislativeSection composition={data.councilComposition} />
        <ExecutiveSection members={data.executiveMembers} />
        <ElectionsSection nextElection={data.nextElection} history={data.electionHistory} />
      </div>
    </div>
  )
}
