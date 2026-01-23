interface RelevanceDotsProps {
  score: number | null
  size?: 'sm' | 'md'
}

function getScoreDots(score: number | null): number {
  if (score === null || score === undefined) return 0
  return Math.ceil(score / 2) // 0→0, 1-2→1, 3-4→2, 5-6→3, 7-8→4, 9-10→5
}

function getScoreColor(score: number | null): string {
  if (score === null || score === undefined) return 'hsl(var(--neutral-light))'
  if (score >= 7) return 'hsl(var(--positive))'
  if (score >= 4) return 'hsl(var(--warning))'
  return 'hsl(var(--negative))'
}

export function RelevanceDots({ score, size = 'sm' }: RelevanceDotsProps) {
  const filledDots = getScoreDots(score)
  const fillColor = getScoreColor(score)
  const emptyColor = 'hsl(var(--neutral-light))'
  const dotSize = size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'

  return (
    <div className="flex items-center gap-1" title="Relevance">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`${dotSize} rounded-full transition-colors`}
          style={{
            backgroundColor: dot <= filledDots ? fillColor : emptyColor,
          }}
        />
      ))}
    </div>
  )
}
