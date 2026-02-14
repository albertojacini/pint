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

interface ProvisionsOverviewProps {
  total: number
  types: ProvisionType[]
  treeLink?: string
}

export function ProvisionsOverview({
  total,
  types,
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
    </div>
  )
}
