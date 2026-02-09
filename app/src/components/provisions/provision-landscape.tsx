'use client'

import type { LucideIcon } from 'lucide-react'
import { GitBranch } from 'lucide-react'
import { SpecialButton } from '@/components/custom-ui/buttons'
import { ProvisionCardExtraSmall } from './provision-cards'

interface ProvisionType {
  type: string
  icon: LucideIcon
  label: string
  count: number
}

interface TopProvision {
  title: string
  type: string
}

interface ProvisionLandscapeProps {
  total: number
  types: ProvisionType[]
  topProvisions: TopProvision[]
  treeLink?: string
}

export function ProvisionLandscape({ total, types, topProvisions, treeLink }: ProvisionLandscapeProps) {
  return (
    <div>
      {/* Header: total + view tree + type chips */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold shrink-0">{total}</span>
        <span className="text-sm text-muted-foreground shrink-0 mr-1">provisions</span>
        {treeLink && (
          <div className="shrink-0">
            <SpecialButton href={treeLink} icon={<GitBranch className="w-3 h-3" />}>
              View tree
            </SpecialButton>
          </div>
        )}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
          {types.map((t) => {
            const Icon = t.icon
            return (
              <div
                key={t.type}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded text-xs shrink-0"
              >
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span>{t.label}</span>
                <span className="text-muted-foreground">{t.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top provisions */}
      {topProvisions.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Relevant provisions</div>
          <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[180px] grid-rows-3 gap-x-4 gap-y-0 w-max">
            {topProvisions.map((p) => (
              <ProvisionCardExtraSmall key={p.title} provision={p} className="max-w-[180px]" />
            ))}
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
