import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotSessions, gamvotVotes, gamvotItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/games/voter-budget/sessions/:sessionId
// Get session with all votes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  const session = await db.query.gamvotSessions.findFirst({
    where: eq(gamvotSessions.id, sessionId),
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  const votes = await db
    .select({
      id: gamvotVotes.id,
      itemId: gamvotVotes.itemId,
      text: gamvotItems.text,
      dimension: gamvotItems.dimension,
      amount: gamvotVotes.amount,
      notes: gamvotVotes.notes,
    })
    .from(gamvotVotes)
    .innerJoin(gamvotItems, eq(gamvotItems.id, gamvotVotes.itemId))
    .where(eq(gamvotVotes.sessionId, sessionId))

  return NextResponse.json({
    session: {
      id: session.id,
      entityId: session.entityId,
      status: session.status,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    },
    votes: votes.map(v => ({
      id: v.id,
      itemId: v.itemId,
      text: v.text,
      dimension: v.dimension,
      amount: v.amount,
      notes: v.notes,
    })),
  })
}
