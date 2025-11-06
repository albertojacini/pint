import { getIdea } from '@/lib/actions/ideas'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getIdea(id)

  if (!data) {
    notFound()
  }

  const { idea, effects, goalContributions, policies } = data

  // Group goals by measurable for better visualization
  const goalsByMeasurable = goalContributions.reduce((acc, gc) => {
    if (!acc[gc.measurableId]) {
      acc[gc.measurableId] = []
    }
    acc[gc.measurableId].push(gc)
    return acc
  }, {} as Record<string, typeof goalContributions>)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/ideas" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Ideas
        </Link>
        <div className="mb-2">
          <Badge variant="outline" className="text-xs font-mono">IDEA</Badge>
        </div>
        <h1 className="text-4xl font-bold mb-2">{idea.title}</h1>
        {idea.categoryTitle && (
          <Badge variant="secondary" className="mb-4">
            {idea.categoryTitle}
          </Badge>
        )}
        {idea.description && (
          <p className="text-muted-foreground text-lg">{idea.description}</p>
        )}
      </div>

      {/* Effects Chain Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Impact Chain: Effects → Measurables → Goals</h2>

        {effects.length === 0 ? (
          <p className="text-muted-foreground">No effects defined for this idea yet.</p>
        ) : (
          <div className="space-y-6">
            {effects.map((effect) => {
              const effectGoals = goalsByMeasurable[effect.measurableId] || []

              return (
                <Card key={effect.effectId} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {/* Direction Icon */}
                      <div className={`mt-1 ${
                        effect.direction === 'positive' ? 'text-green-600' :
                        effect.direction === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {effect.direction === 'positive' ? (
                          <TrendingUp className="w-6 h-6" />
                        ) : effect.direction === 'negative' ? (
                          <TrendingDown className="w-6 h-6" />
                        ) : (
                          <ArrowRight className="w-6 h-6" />
                        )}
                      </div>

                      {/* Measurable Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">MEASURABLE</Badge>
                          <CardTitle className="text-xl">{effect.measurableTitle}</CardTitle>
                        </div>
                        {effect.measurableDescription && (
                          <CardDescription className="mb-3">
                            {effect.measurableDescription}
                          </CardDescription>
                        )}

                        {/* Effect Metadata */}
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs font-mono mr-2">EFFECT</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className={
                            effect.direction === 'positive' ? 'border-green-600 text-green-600' :
                            effect.direction === 'negative' ? 'border-red-600 text-red-600' :
                            'border-gray-600 text-gray-600'
                          }>
                            {effect.direction}
                          </Badge>
                          {effect.intensity && (
                            <Badge variant="outline">
                              Intensity: {effect.intensity}
                            </Badge>
                          )}
                          {effect.confidence && (
                            <Badge variant={effect.confidence === 'proven' ? 'default' : 'secondary'}>
                              {effect.confidence} confidence
                            </Badge>
                          )}
                          <Badge variant="outline">
                            Unit: {effect.measurableUnit}
                          </Badge>
                        </div>

                        {/* Evidence */}
                        {effect.evidenceDescription && (
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <strong>Evidence:</strong> {effect.evidenceDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Goals Contribution */}
                  {effectGoals.length > 0 && (
                    <CardContent>
                      <Separator className="mb-4" />
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Contributes to Goals
                      </h3>
                      <div className="space-y-2">
                        {effectGoals.map((gc) => (
                          <div key={gc.goalId} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-mono">GOAL</Badge>
                                <span className="font-medium">{gc.goalTitle}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-mono">CONTRIBUTION</Badge>
                                <Badge variant="outline" className="text-xs">
                                  {gc.contributionType}
                                </Badge>
                              </div>
                              {gc.weight && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  Weight: {parseFloat(gc.weight).toFixed(1)}
                                </div>
                              )}
                              {gc.goalMaslowLevel && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  Maslow Level: {gc.goalMaslowLevel}
                                </div>
                              )}
                              {gc.contributionDescription && (
                                <p className="text-sm text-muted-foreground">
                                  {gc.contributionDescription}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Policies Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Real-World Implementations</h2>

        {policies.length === 0 ? (
          <p className="text-muted-foreground">No implementations found for this idea yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {policies.map((policy) => (
              <Card key={policy.policyId}>
                <CardHeader>
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs font-mono">POLICY</Badge>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{policy.policyTitle}</CardTitle>
                    <Badge variant={
                      policy.status === 'active' ? 'default' :
                      policy.status === 'completed' ? 'secondary' :
                      policy.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{policy.entityName}</span>
                    <Badge variant="outline" className="text-xs">
                      {policy.entityType}
                    </Badge>
                  </div>
                  {policy.administrationName && (
                    <div className="text-sm text-muted-foreground">
                      {policy.administrationName}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {policy.policyDescription && (
                    <p className="text-sm mb-3">{policy.policyDescription}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {policy.startDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start:</span>
                        <span>{new Date(policy.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {policy.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End:</span>
                        <span>{new Date(policy.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {policy.budgetAllocated && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-semibold">
                          {parseFloat(policy.budgetAllocated).toLocaleString()} {policy.budgetCurrency}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
