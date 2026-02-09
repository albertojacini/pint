import { Vote } from 'lucide-react'
import { Box } from '@/components/custom-ui/box'
import { formatTimeUntil, formatElectionDate, formatFullElectionDate } from './election-utils'

export interface ElectionResult {
  candidate: string
  coalition: string
  percentage: number
  color: string
}

export interface Election {
  date: string
  turnout?: number
  results: ElectionResult[]
}

const MAX_CANDIDATES = 6

function ThinResultBar({ results }: { results: ElectionResult[] }) {
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

export function ElectionCard({ election }: { election: Election }) {
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

export function NextElectionCard({ date }: { date: string }) {
  const countdown = formatTimeUntil(date)
  const fullDate = formatFullElectionDate(date)

  return (
    <Box variant="highlighted" className="flex items-center gap-3 mb-4">
      <Vote className="w-6 h-6 text-amber-500" />
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
    </Box>
  )
}

export function ElectionsSection({
  nextElection,
  history,
}: {
  nextElection?: { date: string }
  history?: Election[]
}) {
  if (!nextElection && (!history || history.length === 0)) return null

  const electionsWithResults = history?.filter((election) => election.results.length > 0) || []

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Elezioni</h4>

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
