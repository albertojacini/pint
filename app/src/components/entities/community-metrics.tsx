interface CommunityMetricsProps {
  data: {
    userSatisfaction?: {
      overall: number
      responsesCount: number
    }
    activeProjects?: number
    communityEngagement?: {
      totalUsers: number
      activeContributors: number
    }
    surveys?: Array<{
      title: string
      score: number
      responses: number
    }>
  } | null
}

export function CommunityMetrics({ data }: CommunityMetricsProps) {
  if (!data) return null

  return (
    <div className="py-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Pint Community Metrics</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Overall satisfaction & engagement */}
        <div className="space-y-4">
          {/* User Satisfaction */}
          {data.userSatisfaction && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">User Satisfaction</span>
                <span className="text-2xl font-bold text-orange-600">
                  {data.userSatisfaction.overall.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full"
                  style={{ width: `${(data.userSatisfaction.overall / 10) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {data.userSatisfaction.responsesCount.toLocaleString()} responses
              </div>
            </div>
          )}

          {/* Community Engagement Stats */}
          <div className="grid grid-cols-2 gap-3">
            {data.activeProjects !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-800">{data.activeProjects}</div>
                <div className="text-xs text-gray-600">Active Projects</div>
              </div>
            )}
            {data.communityEngagement && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800">
                    {data.communityEngagement.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Total Users</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <div className="text-2xl font-bold text-gray-800">
                    {data.communityEngagement.activeContributors}
                  </div>
                  <div className="text-xs text-gray-600">Active Contributors</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column: Topic surveys */}
        {data.surveys && data.surveys.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Topic Satisfaction</div>
            <div className="space-y-2">
              {data.surveys.map((survey, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{survey.title}</span>
                      <span className="text-sm font-semibold text-gray-800">{survey.score.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(survey.score / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{survey.responses} responses</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
