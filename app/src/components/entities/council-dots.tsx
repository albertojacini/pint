export interface CouncilParty {
  party: string
  seats: number
  color?: string // Optional - component assigns colors from palette if not provided
}

export interface CouncilDotsProps {
  composition: CouncilParty[]
}

// Tag palette colors in order of assignment
const PALETTE_COLORS = [
  'hsl(var(--tag-pink))',
  'hsl(var(--tag-blue))',
  'hsl(var(--tag-cyan))',
  'hsl(var(--tag-teal))',
  'hsl(var(--tag-green))',
  'hsl(var(--tag-orange))',
  'hsl(var(--tag-purple))',
  'hsl(var(--tag-slate))',
]

export function CouncilDots({ composition }: CouncilDotsProps) {
  if (!composition || composition.length === 0) return null

  const sortedComposition = [...composition].sort((a, b) => b.seats - a.seats)
  const totalSeats = composition.reduce((sum, p) => sum + p.seats, 0)
  const majority = Math.floor(totalSeats / 2) + 1

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {totalSeats} seats · Majority: {majority}
      </div>
      <div className="space-y-1.5">
        {sortedComposition.map((p, partyIdx) => {
          const color = PALETTE_COLORS[partyIdx % PALETTE_COLORS.length]
          return (
            <div key={partyIdx} className="flex items-center gap-3">
              <span className="text-xs font-medium text-foreground w-12 truncate" title={p.party}>
                {p.party}
              </span>
              <span className="text-xs text-muted-foreground w-6 text-right">
                {p.seats}
              </span>
              <div className="flex flex-wrap gap-1 flex-1">
                {Array.from({ length: p.seats }).map((_, seatIdx) => (
                  <div
                    key={seatIdx}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
