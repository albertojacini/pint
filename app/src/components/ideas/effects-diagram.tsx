import type { EffectsDiagram, StakeholderGroupEffects, StakeholderEffect } from '@pint/types'

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
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <tbody>
          {effectsDiagram.stakeholderGroups.map((stakeholderGroupEffects: StakeholderGroupEffects, _index: number) => {
            const stakeholderGroup = stakeholderGroupMap.get(stakeholderGroupEffects.stakeholderGroupId)

            if (!stakeholderGroup) {
              return null
            }

            return (
              <tr key={stakeholderGroupEffects.stakeholderGroupId} className="border-b last:border-b-0">
                {/* First column: Stakeholder info */}
                <td className="p-3 align-top bg-muted/30 w-64">
                  <div className="flex items-start gap-2">
                    {stakeholderGroup.icon && (
                      <span className="text-xl" aria-hidden="true">
                        {stakeholderGroup.icon}
                      </span>
                    )}
                    <div>
                      <div className="font-semibold text-sm">
                        {stakeholderGroup.title}
                      </div>
                      {stakeholderGroupEffects.subtitle && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {stakeholderGroupEffects.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Second column: Effects table */}
                <td className="p-0">
                  <table className="w-full">
                    <tbody>
                      {stakeholderGroupEffects.effects.map((effect: StakeholderEffect, effectIndex: number) => {
                        const isPositive = effect.sentiment === 'positive'
                        const severityDots = '●'.repeat(effect.severity)

                        return (
                          <tr
                            key={effectIndex}
                            className={`border-b last:border-b-0 ${
                              isPositive
                                ? 'bg-green-50/50 dark:bg-green-950/20'
                                : 'bg-red-50/50 dark:bg-red-950/20'
                            }`}
                          >
                            <td className="p-2 pl-3">
                              <div className="font-medium text-sm">{effect.title}</div>
                              {effect.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {effect.description}
                                </div>
                              )}
                            </td>
                            <td className="p-2 pr-3 text-right w-20">
                              <span
                                className={`text-lg font-bold ${
                                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                                title={`Severity: ${effect.severity}/5`}
                              >
                                {severityDots}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
