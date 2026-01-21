'use client'

import type { EvaluationSummary } from '@/lib/db/schema/government'

type ProposalItem = NonNullable<EvaluationSummary['proposals']>['items'][number]

function ProposalCard({ proposal }: { proposal: ProposalItem }) {
  const total = proposal.support + proposal.oppose
  const supportPercent = total > 0 ? Math.round((proposal.support / total) * 100) : 50
  const isControversial = supportPercent >= 40 && supportPercent <= 60
  const isPopular = supportPercent > 60
  const isUnpopular = supportPercent < 40

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-background/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <span className="inline-block text-xs font-medium bg-muted px-2 py-0.5 rounded mb-2">
            {proposal.label}
          </span>
          <p className="text-sm text-foreground">{proposal.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${supportPercent}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${100 - supportPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-green-600 font-medium">+{proposal.support}</span>
          <span className="text-red-600 font-medium">-{proposal.oppose}</span>
        </div>
      </div>
      {(isControversial || isPopular || isUnpopular) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {isControversial && 'Controversa'}
          {isPopular && 'Popolare'}
          {isUnpopular && 'Impopolare'}
        </div>
      )}
    </div>
  )
}

export function ChangeProposals({
  data,
}: {
  data: EvaluationSummary['proposals'] | null | undefined
}) {
  if (!data || data.items.length === 0) return null

  const sortedProposals = [...data.items].sort(
    (a, b) => (b.support + b.oppose) - (a.support + a.oppose)
  )

  const totalSupport = data.items.reduce((sum, item) => sum + item.support, 0)
  const totalOppose = data.items.reduce((sum, item) => sum + item.oppose, 0)
  const overallRatio =
    totalSupport + totalOppose > 0
      ? Math.round((totalSupport / (totalSupport + totalOppose)) * 100)
      : 50

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>{data.items.length} proposte attive</span>
        <div className="flex items-center gap-2">
          <span>Supporto complessivo:</span>
          <span className={overallRatio >= 50 ? 'text-green-600' : 'text-red-600'}>
            {overallRatio}%
          </span>
        </div>
      </div>
      <div className="grid gap-3">
        {sortedProposals.map((proposal, index) => (
          <ProposalCard key={index} proposal={proposal} />
        ))}
      </div>
    </div>
  )
}
