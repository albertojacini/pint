'use client'

import {
  Coins,
  FileText,
  Scale,
  Landmark,
  BarChart3,
  HardHat,
  Tag,
  GitBranch,
} from 'lucide-react'
import { SpecialButton } from '@/components/custom-ui/buttons'
import { ProvisionCardExtraSmall } from './provision-cards'
import { SectionL3Title } from '@/components/custom-ui/typography'

const typeConfig: Record<string, { icon: typeof Coins; label: string }> = {
  taxation: { icon: Coins, label: 'Taxation' },
  contract: { icon: FileText, label: 'Contracts' },
  regulation: { icon: Scale, label: 'Regulations' },
  ownership: { icon: Landmark, label: 'Ownership' },
  allocation: { icon: BarChart3, label: 'Allocations' },
  infrastructure: { icon: HardHat, label: 'Infrastructure' },
  designation: { icon: Tag, label: 'Designations' },
}

interface ProvisionType {
  type: string
  count: number
}

interface TopProvision {
  title: string
  type: string
}

interface ProvisionsOverviewProps {
  total: number
  types: ProvisionType[]
  topProvisions: TopProvision[]
  treeLink?: string
}

export function ProvisionsOverview({
  total,
  types,
  topProvisions,
  treeLink,
}: ProvisionsOverviewProps) {
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
            const config = typeConfig[t.type]
            if (!config) return null
            const Icon = config.icon
            return (
              <div
                key={t.type}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded text-xs shrink-0"
              >
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span>{config.label}</span>
                <span className="text-muted-foreground">{t.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top provisions */}
      {topProvisions.length > 0 && (
        <div className="mt-3">
          <SectionL3Title>Relevant provisions</SectionL3Title>
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
