'use client'

import { ProvisionChangeCardExtraSmall } from './provision-change-cards'
import { SubsubsectionTitle } from '@/components/custom-ui/typography'

interface ProvisionChange {
  date: string
  provisionTitle: string
  changeTitle: string
}

interface ProvisionChangesOverviewProps {
  total: number
  changes: ProvisionChange[]
}

export function ProvisionChangesOverview({ total, changes }: ProvisionChangesOverviewProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold shrink-0">{total}</span>
        <span className="text-sm text-muted-foreground shrink-0">recent changes</span>
      </div>

      {/* Changes grid */}
      {changes.length > 0 && (
        <div className="mt-3">
          <SubsubsectionTitle>Latest changes</SubsubsectionTitle>
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col auto-cols-[240px] grid-rows-3 gap-x-4 gap-y-0 w-max">
              {changes.map((c, i) => (
                <ProvisionChangeCardExtraSmall key={i} change={c} className="max-w-[240px]" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
