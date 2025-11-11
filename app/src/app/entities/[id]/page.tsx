import { db } from '@/lib/db/client'
import { politicalEntities, administrations, administrationMembers, people } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { AdministrationsSection } from '@/components/entities/administrations-section'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MessageCircle } from 'lucide-react'

interface EntityPageProps {
  params: Promise<{
    id: string
  }>
}

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Helper function to get country name from code
function getCountryName(countryCode?: string): string | undefined {
  if (!countryCode) return undefined
  const countries: Record<string, string> = {
    IT: 'Italy',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    AT: 'Austria',
    GB: 'United Kingdom',
    US: 'United States',
  }
  return countries[countryCode.toUpperCase()]
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { id } = await params

  // Fetch the entity
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, id))

  if (!entity) {
    notFound()
  }

  // Fetch administrations for this entity
  const entityAdministrations = await db
    .select({
      id: administrations.id,
      name: administrations.name,
      termStart: administrations.termStart,
      termEnd: administrations.termEnd,
      status: administrations.status,
      description: administrations.description,
    })
    .from(administrations)
    .where(eq(administrations.entityId, id))
    .orderBy(desc(administrations.termStart))

  // For each administration, get the mayor
  const administrationsWithMayor = await Promise.all(
    entityAdministrations.map(async (admin) => {
      const [mayorMember] = await db
        .select({
          person: {
            fullName: people.fullName,
          },
        })
        .from(administrationMembers)
        .innerJoin(people, eq(administrationMembers.personId, people.id))
        .where(eq(administrationMembers.administrationId, admin.id))
        .where(eq(administrationMembers.roleType, 'mayor'))
        .limit(1)

      return {
        ...admin,
        mayor: mayorMember?.person || null,
      }
    })
  )

  // Fetch provisions for this entity
  const provisions = await getProvisionsByEntity(id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/entities" className="text-blue-600 hover:underline">
          ← Back to entities
        </Link>
      </div>

      {/* Entity header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        {/* Row 1: City Identity Header */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
          {/* Left: Coat of Arms or Avatar */}
          <div className="flex-shrink-0">
            {entity.identityData?.coatOfArmsUrl ? (
              <img
                src={entity.identityData.coatOfArmsUrl}
                alt={`${entity.name} coat of arms`}
                className="w-24 h-24 object-contain"
              />
            ) : entity.avatarUrl ? (
              <img
                src={entity.avatarUrl}
                alt={entity.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-400">
                  {entity.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Center: Name, Location, Classification */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-4xl font-bold">{entity.name}</h1>
              {entity.identityData?.countryCode && (
                <span className="text-3xl" title={entity.identityData.countryCode}>
                  {getFlagEmoji(entity.identityData.countryCode)}
                </span>
              )}
            </div>

            {/* Location breadcrumb */}
            {(entity.identityData?.regionName || entity.identityData?.countryCode) && (
              <p className="text-lg text-gray-600 mb-3">
                {[entity.identityData?.regionName, getCountryName(entity.identityData?.countryCode)]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                {entity.type}
              </Badge>
              {entity.identityData?.cityType && (
                <Badge variant="outline" className="text-sm">
                  {entity.identityData.cityType}
                </Badge>
              )}
              {entity.identityData?.sisterCities && (
                <Badge variant="outline" className="text-sm">
                  🤝 {entity.identityData.sisterCities} sister cities
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            {entity.identityData?.officialWebsite && (
              <a
                href={entity.identityData.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-center"
              >
                Official Website →
              </a>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                title="Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <Link
              href={`/entities/${id}/compare`}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-center"
            >
              Compare
            </Link>
          </div>
        </div>

        {/* Row 2: Essential Context Strip */}
        {(entity.population || entity.essentialStats) && (
          <div className="py-3 mb-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {entity.population && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Population:</span>
                  <span className="font-semibold">{entity.population.toLocaleString()}</span>
                </div>
              )}
              {entity.essentialStats?.area && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Area:</span>
                  <span className="font-semibold">{entity.essentialStats.area.toLocaleString()} km²</span>
                </div>
              )}
              {entity.essentialStats?.density && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Density:</span>
                  <span className="font-semibold">{entity.essentialStats.density.toLocaleString()}/km²</span>
                </div>
              )}
              {entity.essentialStats?.gdpPerCapita && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">GDP per capita:</span>
                  <span className="font-semibold">${entity.essentialStats.gdpPerCapita.toLocaleString()}</span>
                </div>
              )}
              {entity.essentialStats?.timezone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Timezone:</span>
                  <span className="font-semibold">{entity.essentialStats.timezone}</span>
                </div>
              )}
              {entity.essentialStats?.languages && entity.essentialStats.languages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Languages:</span>
                  <span className="font-semibold">{entity.essentialStats.languages.join(', ')}</span>
                </div>
              )}
              {entity.essentialStats?.elevation && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Elevation:</span>
                  <span className="font-semibold">{entity.essentialStats.elevation}m</span>
                </div>
              )}
              {entity.essentialStats?.founded && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Founded:</span>
                  <span className="font-semibold">{entity.essentialStats.founded}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Political Landscape */}
        {entity.politicalLandscape && (
          <div className="py-4 mb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Political Landscape</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column: Mayor & Elections */}
              <div className="space-y-3">
                {/* Current Mayor */}
                {entity.politicalLandscape.currentMayor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entity.politicalLandscape.currentMayor.partyColor }}
                    />
                    <div>
                      <div className="text-sm font-semibold">{entity.politicalLandscape.currentMayor.name}</div>
                      <div className="text-xs text-gray-500">Mayor • {entity.politicalLandscape.currentMayor.party}</div>
                    </div>
                  </div>
                )}

                {/* Elections Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {entity.politicalLandscape.lastElection && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Last Election</div>
                      <div className="font-semibold">{new Date(entity.politicalLandscape.lastElection.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                      <div className="text-xs text-gray-600">{entity.politicalLandscape.lastElection.turnout}% turnout</div>
                    </div>
                  )}
                  {entity.politicalLandscape.nextElection && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Next Election</div>
                      <div className="font-semibold">{new Date(entity.politicalLandscape.nextElection.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                      {(() => {
                        const days = Math.ceil((new Date(entity.politicalLandscape.nextElection.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        return <div className="text-xs text-gray-600">{days > 0 ? `in ${days} days` : 'past'}</div>
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: Council Composition */}
              {entity.politicalLandscape.councilComposition && entity.politicalLandscape.councilComposition.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Council Composition ({entity.politicalLandscape.councilComposition.reduce((sum, p) => sum + p.seats, 0)} seats)</div>

                  {/* Visual bar */}
                  <div className="h-8 rounded-full overflow-hidden flex mb-2">
                    {entity.politicalLandscape.councilComposition.map((party, idx) => {
                      const totalSeats = entity.politicalLandscape.councilComposition!.reduce((sum, p) => sum + p.seats, 0)
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
                    {entity.politicalLandscape.councilComposition.map((party, idx) => (
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
        )}

        {/* Row 4: Performance Indicators */}
        {entity.performanceIndicators && (
          <div className="py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Indicators</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Innovation */}
              {entity.performanceIndicators.innovation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Innovation</span>
                    <span className="text-2xl font-bold text-blue-600">{entity.performanceIndicators.innovation.overall}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${(entity.performanceIndicators.innovation.overall / 10) * 100}%` }}
                    />
                  </div>

                  {/* Subcategories */}
                  {entity.performanceIndicators.innovation.subcategories && entity.performanceIndicators.innovation.subcategories.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {entity.performanceIndicators.innovation.subcategories.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-400 rounded-full"
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
              )}

              {/* Sustainability */}
              {entity.performanceIndicators.sustainability && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Sustainability</span>
                    <span className="text-2xl font-bold text-green-600">{entity.performanceIndicators.sustainability.overall}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${(entity.performanceIndicators.sustainability.overall / 10) * 100}%` }}
                    />
                  </div>

                  {/* Subcategories */}
                  {entity.performanceIndicators.sustainability.subcategories && entity.performanceIndicators.sustainability.subcategories.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {entity.performanceIndicators.sustainability.subcategories.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-400 rounded-full"
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
              )}

              {/* Impact */}
              {entity.performanceIndicators.impact && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Impact</span>
                    <span className="text-2xl font-bold text-purple-600">{entity.performanceIndicators.impact.overall}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${(entity.performanceIndicators.impact.overall / 10) * 100}%` }}
                    />
                  </div>

                  {/* Subcategories */}
                  {entity.performanceIndicators.impact.subcategories && entity.performanceIndicators.impact.subcategories.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {entity.performanceIndicators.impact.subcategories.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-400 rounded-full"
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
              )}
            </div>
          </div>
        )}

        {/* Row 5: Pint Community Metrics */}
        {entity.communityMetrics && (
          <div className="py-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pint Community Metrics</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column: Overall satisfaction & engagement */}
              <div className="space-y-4">
                {/* User Satisfaction */}
                {entity.communityMetrics.userSatisfaction && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">User Satisfaction</span>
                      <span className="text-2xl font-bold text-orange-600">{entity.communityMetrics.userSatisfaction.overall.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full"
                        style={{ width: `${(entity.communityMetrics.userSatisfaction.overall / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {entity.communityMetrics.userSatisfaction.responsesCount.toLocaleString()} responses
                    </div>
                  </div>
                )}

                {/* Community Engagement Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {entity.communityMetrics.activeProjects !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-800">{entity.communityMetrics.activeProjects}</div>
                      <div className="text-xs text-gray-600">Active Projects</div>
                    </div>
                  )}
                  {entity.communityMetrics.communityEngagement && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-gray-800">{entity.communityMetrics.communityEngagement.totalUsers.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Users</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                        <div className="text-2xl font-bold text-gray-800">{entity.communityMetrics.communityEngagement.activeContributors}</div>
                        <div className="text-xs text-gray-600">Active Contributors</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right column: Topic surveys */}
              {entity.communityMetrics.surveys && entity.communityMetrics.surveys.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Topic Satisfaction</div>
                  <div className="space-y-2">
                    {entity.communityMetrics.surveys.map((survey, idx) => (
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
        )}

        {entity.description && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{entity.description}</p>
          </div>
        )}
      </div>

      {/* Administrations Section */}
      <AdministrationsSection administrations={administrationsWithMayor} />

      {/* Provisions Section */}
      {provisions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Provisions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {provisions.map((provision) => (
              <Card key={provision.id}>
                <CardHeader>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="outline" className="text-xs font-mono">PROVISION</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {provision.type}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{provision.title}</CardTitle>
                    <Badge variant={
                      provision.status === 'active' ? 'default' :
                      provision.status === 'repealed' ? 'destructive' :
                      'outline'
                    }>
                      {provision.status}
                    </Badge>
                  </div>
                  {provision.ideaTitle && (
                    <div className="text-sm text-muted-foreground">
                      Inspired by: <Link href={`/ideas/${provision.ideaId}`} className="text-blue-600 hover:underline">
                        {provision.ideaTitle}
                      </Link>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {provision.description && (
                    <p className="text-sm text-muted-foreground mb-3">{provision.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {provision.effectiveFrom && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective From:</span>
                        <span>{provision.effectiveFrom}</span>
                      </div>
                    )}
                    {provision.effectiveUntil && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective Until:</span>
                        <span>{provision.effectiveUntil}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Metadata</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>{' '}
            <span className="font-medium">
              {format(new Date(entity.createdAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>{' '}
            <span className="font-medium">
              {format(new Date(entity.updatedAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ID:</span>{' '}
            <span className="font-mono text-xs">{entity.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
