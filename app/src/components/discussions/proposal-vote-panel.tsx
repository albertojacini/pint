'use client'

import { useTransition } from 'react'
import { setProposalPosition } from '@/lib/actions/discussions'
import { Button } from '@/components/ui/button'

interface ProposalVotePanelProps {
  postId: string
  userId?: string
  counts: { agree: number; disagree: number; abstain: number }
}

export function ProposalVotePanel({ postId, userId, counts }: ProposalVotePanelProps) {
  const [isPending, startTransition] = useTransition()
  const total = counts.agree + counts.disagree + counts.abstain

  function handleVote(position: 'agree' | 'disagree' | 'abstain') {
    if (!userId) return
    startTransition(async () => {
      await setProposalPosition(postId, userId, position)
    })
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/20">
      <h4 className="text-sm font-medium mb-3">Proposal Vote</h4>
      <div className="flex gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('agree')}
          disabled={!userId || isPending}
          className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
        >
          Agree ({counts.agree})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('disagree')}
          disabled={!userId || isPending}
          className="flex-1 text-red-700 border-red-300 hover:bg-red-50"
        >
          Disagree ({counts.disagree})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('abstain')}
          disabled={!userId || isPending}
          className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          Abstain ({counts.abstain})
        </Button>
      </div>
      {total > 0 && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
          {counts.agree > 0 && (
            <div
              className="bg-green-500 h-full"
              style={{ width: `${(counts.agree / total) * 100}%` }}
            />
          )}
          {counts.disagree > 0 && (
            <div
              className="bg-red-500 h-full"
              style={{ width: `${(counts.disagree / total) * 100}%` }}
            />
          )}
          {counts.abstain > 0 && (
            <div
              className="bg-gray-400 h-full"
              style={{ width: `${(counts.abstain / total) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  )
}
