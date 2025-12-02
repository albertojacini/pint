interface ProvisionImpactChartProps {
  provisionId: string
}

// Generate consistent mock percentage based on provision ID
function getMockImpactPercentage(id: string): number {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return 45 + (hash % 40) // Returns 45-84
}

// Get color based on impact percentage
function getImpactColor(percentage: number): string {
  if (percentage >= 70) return 'rgb(34 197 94)' // green-500
  if (percentage >= 50) return 'rgb(234 179 8)' // yellow-500
  return 'rgb(239 68 68)' // red-500
}

export function ProvisionImpactChart({ provisionId }: ProvisionImpactChartProps) {
  const percentage = getMockImpactPercentage(provisionId)
  const color = getImpactColor(percentage)

  return (
    <div className="flex-shrink-0">
      <div
        className="relative w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${percentage}%, rgb(229 231 235) ${percentage}%)`
        }}
      >
        <div className="absolute inset-1 rounded-full bg-card flex items-center justify-center text-xs font-bold">
          {percentage}%
        </div>
      </div>
    </div>
  )
}
