import { getIdea } from '@/lib/actions/ideas'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getIdea(id)

  if (!data) {
    notFound()
  }

  const { idea, effects, goalContributions, provisions } = data

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
                      {/* Arrow Icon */}
                      <div className="mt-1 text-primary">
                        <ArrowRight className="w-6 h-6" />
                      </div>

                      {/* Effect Content */}
                      <div className="flex-1">
                        {/* Effect Title */}
                        <CardTitle className="text-xl mb-3">{effect.title}</CardTitle>

                        {/* Effect Description */}
                        {effect.description && (
                          <CardDescription className="mb-4">
                            {effect.description}
                          </CardDescription>
                        )}

                        {/* Mechanism */}
                        {effect.mechanism && (
                          <div className="bg-muted p-3 rounded-md text-sm mb-4">
                            <div className="font-semibold mb-1">Mechanism:</div>
                            <div className="text-muted-foreground">{effect.mechanism}</div>
                          </div>
                        )}

                        {/* Measurable Info */}
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-mono">MEASURABLE</Badge>
                            <span className="font-medium">{effect.measurableTitle}</span>
                            <Badge variant="outline">
                              Unit: {effect.measurableUnit}
                            </Badge>
                          </div>
                          {effect.measurableDescription && (
                            <p className="text-sm text-muted-foreground ml-24">
                              {effect.measurableDescription}
                            </p>
                          )}
                        </div>
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

      {/* Provisions Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Inspired Provisions</h2>

        {provisions.length === 0 ? (
          <p className="text-muted-foreground">No provisions inspired by this idea yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {provisions.map((provision) => (
              <Card key={provision.provisionId}>
                <CardHeader>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="outline" className="text-xs font-mono">PROVISION</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {provision.type}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{provision.provisionTitle}</CardTitle>
                    <Badge variant={
                      provision.status === 'active' ? 'default' :
                      provision.status === 'repealed' ? 'destructive' :
                      'outline'
                    }>
                      {provision.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{provision.entityName}</span>
                    <Badge variant="outline" className="text-xs">
                      {provision.entityType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {provision.provisionDescription && (
                    <p className="text-sm mb-3">{provision.provisionDescription}</p>
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
        )}
      </section>
    </div>
  )
}
