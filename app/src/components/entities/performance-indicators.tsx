interface IndicatorData {
  overall: number
  subcategories?: Array<{
    name: string
    score: number
  }>
}

interface PerformanceIndicatorsProps {
  data: {
    innovation?: IndicatorData
    sustainability?: IndicatorData
    impact?: IndicatorData
  } | null
}

function IndicatorCard({
  title,
  data,
  color
}: {
  title: string
  data: IndicatorData
  color: { primary: string; secondary: string; text: string }
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span className={`text-2xl font-bold ${color.text}`}>{data.overall}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.primary} rounded-full transition-all`}
          style={{ width: `${(data.overall / 10) * 100}%` }}
        />
      </div>

      {/* Subcategories */}
      {data.subcategories && data.subcategories.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {data.subcategories.map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{sub.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color.secondary} rounded-full`}
                    style={{ width: `${(sub.score / 10) * 100}%` }}
                  />
                </div>
                <span className="text-gray-500 w-5 text-right">{sub.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PerformanceIndicators({ data }: PerformanceIndicatorsProps) {
  if (!data) return null

  return (
    <div className="grid md:grid-cols-3 gap-6">
        {data.innovation && (
          <IndicatorCard
            title="Innovation"
            data={data.innovation}
            color={{ primary: 'bg-blue-600', secondary: 'bg-blue-400', text: 'text-blue-600' }}
          />
        )}
        {data.sustainability && (
          <IndicatorCard
            title="Sustainability"
            data={data.sustainability}
            color={{ primary: 'bg-green-600', secondary: 'bg-green-400', text: 'text-green-600' }}
          />
        )}
        {data.impact && (
          <IndicatorCard
            title="Impact"
            data={data.impact}
            color={{ primary: 'bg-purple-600', secondary: 'bg-purple-400', text: 'text-purple-600' }}
          />
        )}
    </div>
  )
}
