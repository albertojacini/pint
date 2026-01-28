'use client'

import type { EvaluationSummary } from '@/lib/db/schema/government'

type ProposalItem = NonNullable<EvaluationSummary['proposals']>['items'][number]

function getSentiment(support: number, oppose: number) {
  const total = support + oppose
  const pct = total > 0 ? Math.round((support / total) * 100) : 50
  if (pct >= 60) return 'popular' as const
  if (pct <= 40) return 'unpopular' as const
  return 'controversial' as const
}

function ProposalCard({ proposal }: { proposal: ProposalItem }) {
  const total = proposal.support + proposal.oppose
  const pct = total > 0 ? Math.round((proposal.support / total) * 100) : 50
  const sentiment = getSentiment(proposal.support, proposal.oppose)

  const accentColor = {
    popular: 'text-positive',
    unpopular: 'text-negative',
    controversial: 'text-warning',
  }[sentiment]

  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{proposal.label}</span>
          <span className={`text-xs tabular-nums ${accentColor}`}>{pct}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {proposal.description}
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden flex">
          <div className="bg-positive-light h-full" style={{ width: `${pct}%` }} />
          <div className="bg-negative-light h-full" style={{ width: `${100 - pct}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          +{proposal.support} / -{proposal.oppose}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button className="text-[10px] text-muted-foreground hover:text-foreground">Vota</button>
          <span className="text-muted-foreground/30">·</span>
          <button className="text-[10px] text-muted-foreground hover:text-foreground">Discuti</button>
          <span className="text-muted-foreground/30">·</span>
          <button className="text-[10px] text-muted-foreground hover:text-foreground">Condividi</button>
        </div>
      </div>
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
  const totalVotes = data.items.reduce((sum, p) => sum + p.support + p.oppose, 0)

  return (
    <div className="border border-border/50 rounded-lg px-3">
      <div className="py-2 border-b border-border/30 text-xs text-muted-foreground">
        {data.items.length} proposte · {totalVotes} voti totali
      </div>
      {sortedProposals.map((proposal, index) => (
        <ProposalCard key={index} proposal={proposal} />
      ))}
    </div>
  )
}
