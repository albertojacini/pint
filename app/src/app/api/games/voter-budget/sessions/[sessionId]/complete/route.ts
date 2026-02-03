import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, sum, count } from 'drizzle-orm'

// POST /api/games/voter-budget/sessions/:sessionId/complete
// Complete a session
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  // Check session exists
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

  // Calculate total spent and vote count
  const [totals] = await db
    .select({
      totalSpent: sum(gamvotVotes.amount),
      voteCount: count(gamvotVotes.id),
    })
    .from(gamvotVotes)
    .where(eq(gamvotVotes.sessionId, sessionId))

  const totalSpent = Number(totals?.totalSpent) || 0
  const voteCount = Number(totals?.voteCount) || 0

  // Require at least one vote
  if (voteCount === 0) {
    return NextResponse.json(
      { error: 'Must have at least one vote to complete' },
      { status: 400 }
    )
  }

  // Mark session as completed
  const [updated] = await db
    .update(gamvotSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(gamvotSessions.id, sessionId))
    .returning()

  return NextResponse.json({
    session: {
      id: updated.id,
      status: updated.status,
      completedAt: updated.completedAt,
      totalSpent,
      voteCount,
    },
  })
}
