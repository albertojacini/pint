'use client'

import { useTransition } from 'react'
import { toggleVote } from '@/lib/actions/discussions'
import { Button } from '@/components/ui/button'

interface VoteButtonProps {
  targetType: 'post' | 'comment'
  targetId: string
  score: number
  userId?: string
}

export function VoteButton({ targetType, targetId, score, userId }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleVote() {
    if (!userId) return
    startTransition(async () => {
      await toggleVote(userId, targetType, targetId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVote}
      disabled={!userId || isPending}
      className="h-7 px-2 text-xs gap-1"
    >
      <span>&#9650;</span>
      <span>{score}</span>
    </Button>
  )
}
