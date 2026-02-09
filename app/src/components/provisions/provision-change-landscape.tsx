'use client'

import { ProvisionChangeCardExtraSmall } from './provision-change-cards'

interface ProvisionChange {
  date: string
  provisionTitle: string
  changeTitle: string
}

interface ProvisionChangeLandscapeProps {
  total: number
  changes: ProvisionChange[]
}

export function ProvisionChangeLandscape({ total, changes }: ProvisionChangeLandscapeProps) {
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
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Latest changes</div>
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
