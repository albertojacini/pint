export interface PercentageBarItem {
  label: string
  value: number
  color: string
  metadata?: string
}

interface PercentageBarProps {
  items: PercentageBarItem[]
  showLegend?: boolean
  barHeight?: string
  rounded?: boolean
  showInBarLabels?: boolean
  valueType?: 'percentage' | 'count' // For display formatting
}

export function PercentageBar({
  items,
  showLegend = true,
  barHeight = 'h-2',
  rounded = true,
  showInBarLabels = false,
  valueType = 'percentage',
}: PercentageBarProps) {
  if (items.length === 0) return null

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full">
      {/* Visual bar */}
      <div
        className={`w-full ${barHeight} ${rounded ? 'rounded-full' : 'rounded'} overflow-hidden flex ${showLegend ? 'mb-2' : ''}`}
      >
        {items.map((item, idx) => {
          const percentage = (item.value / total) * 100
          return (
            <div
              key={idx}
              className="flex items-center justify-center text-white text-xs font-semibold"
              style={{
                backgroundColor: item.color,
                width: `${percentage}%`,
              }}
              title={`${item.label}: ${item.value}${valueType === 'percentage' ? '%' : ''} (${percentage.toFixed(1)}%)`}
            >
              {showInBarLabels && percentage > 15 && (
                <span>
                  {item.label} {item.value}
                  {valueType === 'percentage' ? '%' : ''}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-3 text-xs overflow-x-auto overflow-y-hidden">
          {items.map((item, idx) => {
            const displayValue =
              valueType === 'percentage' ? item.value.toFixed(1) : item.value.toString()
            return (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-500">
                  ({displayValue}
                  {valueType === 'percentage' ? '%' : ''})
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
