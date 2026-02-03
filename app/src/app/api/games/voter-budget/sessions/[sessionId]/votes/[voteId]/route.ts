import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// DELETE /api/games/voter-budget/sessions/:sessionId/votes/:voteId
// Remove a vote from a session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; voteId: string }> }
) {
  const { sessionId, voteId } = await params

  // Check session exists and is not completed
  const session = await db.query.gamvotSessions.findFirst({
    where: eq(gamvotSessions.id, sessionId),
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  if (session.status === 'completed') {
    return NextResponse.json(
      { error: 'Session is already completed' },
      { status: 400 }
    )
  }

  // Delete the vote
  const deleted = await db
    .delete(gamvotVotes)
    .where(
      and(
        eq(gamvotVotes.id, voteId),
        eq(gamvotVotes.sessionId, sessionId)
      )
    )
    .returning()

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: 'Vote not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
