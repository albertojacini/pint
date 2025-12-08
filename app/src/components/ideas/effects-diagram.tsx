import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EffectsDiagram } from '@repo/types'

interface StakeholderGroupData {
  id: string
  name: string
  title: string
  category: string | null
  icon: string | null
}

interface EffectsDiagramProps {
  effectsDiagram: EffectsDiagram | null | undefined
  stakeholderGroups: StakeholderGroupData[]
}

export function EffectsDiagram({ effectsDiagram, stakeholderGroups }: EffectsDiagramProps) {
  if (!effectsDiagram || !effectsDiagram.stakeholderGroups || effectsDiagram.stakeholderGroups.length === 0) {
    return (
      <p className="text-muted-foreground">No effects diagram defined for this idea yet.</p>
    )
  }

  // Create a lookup map for stakeholder groups
  const stakeholderGroupMap = new Map(
    stakeholderGroups.map(sg => [sg.id, sg])
  )

  return (
    <div className="space-y-4">
      {effectsDiagram.stakeholderGroups.map((stakeholderGroupEffects, index) => {
        const stakeholderGroup = stakeholderGroupMap.get(stakeholderGroupEffects.stakeholderGroupId)

        if (!stakeholderGroup) {
          return null
        }

        return (
          <Card key={stakeholderGroupEffects.stakeholderGroupId} className="border-l-4 border-l-muted">
            <CardHeader>
              <div className="flex items-start gap-3">
                {stakeholderGroup.icon && (
                  <span className="text-2xl" aria-hidden="true">
                    {stakeholderGroup.icon}
                  </span>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">
                    {stakeholderGroup.title}
                  </CardTitle>
                  {stakeholderGroupEffects.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {stakeholderGroupEffects.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stakeholderGroupEffects.effects.map((effect, effectIndex) => {
                  const isPositive = effect.sentiment === 'positive'
                  const severityDots = '●'.repeat(effect.severity)

                  return (
                    <div
                      key={effectIndex}
                      className={`p-3 rounded-md border-l-4 ${
                        isPositive
                          ? 'bg-green-50 border-l-green-500 dark:bg-green-950/30'
                          : 'bg-red-50 border-l-red-500 dark:bg-red-950/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium flex-1">{effect.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isPositive ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {isPositive ? '+' : '−'}
                          </Badge>
                          <span
                            className={`text-xs ${
                              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                            title={`Severity: ${effect.severity}/5`}
                          >
                            {severityDots}
                          </span>
                        </div>
                      </div>
                      {effect.description && (
                        <p className="text-sm text-muted-foreground">
                          {effect.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
