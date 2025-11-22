interface PoliticalLandscapeProps {
  data: {
    currentMayor?: {
      name: string
      party: string
      partyColor: string
    }
    lastElection?: {
      date: string
      turnout: number
    }
    nextElection?: {
      date: string
    }
    councilComposition?: Array<{
      party: string
      seats: number
      color: string
    }>
  } | null
}

export function PoliticalLandscape({ data }: PoliticalLandscapeProps) {
  if (!data) return null

  return (
    <div className="py-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Political Landscape</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Mayor & Elections */}
        <div className="space-y-3">
          {/* Current Mayor */}
          {data.currentMayor && (
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: data.currentMayor.partyColor }}
              />
              <div>
                <div className="text-sm font-semibold">{data.currentMayor.name}</div>
                <div className="text-xs text-gray-500">Mayor - {data.currentMayor.party}</div>
              </div>
            </div>
          )}

          {/* Elections Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {data.lastElection && (
              <div>
                <div className="text-gray-500 text-xs mb-1">Last Election</div>
                <div className="font-semibold">
                  {new Date(data.lastElection.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
                <div className="text-xs text-gray-600">{data.lastElection.turnout}% turnout</div>
              </div>
            )}
            {data.nextElection && (
              <div>
                <div className="text-gray-500 text-xs mb-1">Next Election</div>
                <div className="font-semibold">
                  {new Date(data.nextElection.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
                {(() => {
                  const days = Math.ceil((new Date(data.nextElection.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return <div className="text-xs text-gray-600">{days > 0 ? `in ${days} days` : 'past'}</div>
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Council Composition */}
        {data.councilComposition && data.councilComposition.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">
              Council Composition ({data.councilComposition.reduce((sum, p) => sum + p.seats, 0)} seats)
            </div>

            {/* Visual bar */}
            <div className="h-8 rounded-full overflow-hidden flex mb-2">
              {data.councilComposition.map((party, idx) => {
                const totalSeats = data.councilComposition!.reduce((sum, p) => sum + p.seats, 0)
                const percentage = (party.seats / totalSeats) * 100
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center text-white text-xs font-semibold"
                    style={{
                      backgroundColor: party.color,
                      width: `${percentage}%`
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
              {data.councilComposition.map((party, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="text-gray-700">{party.party}</span>
                  <span className="text-gray-500">({party.seats})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
