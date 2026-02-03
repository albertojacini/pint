import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotItems, gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and, desc, sum, countDistinct } from 'drizzle-orm'

// GET /api/games/voter-budget/:entityId/results
// Get community results
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params

  // Get overall stats
  const [stats] = await db
    .select({
      participantCount: countDistinct(gamvotSessions.id),
      totalInvested: sum(gamvotVotes.amount),
    })
    .from(gamvotSessions)
    .leftJoin(gamvotVotes, eq(gamvotVotes.sessionId, gamvotSessions.id))
    .where(
      and(
        eq(gamvotSessions.entityId, entityId),
        eq(gamvotSessions.status, 'completed')
      )
    )

  // Get top items
  const items = await db
    .select({
      id: gamvotItems.id,
      text: gamvotItems.text,
      totalAmount: sum(gamvotVotes.amount),
      voterCount: countDistinct(gamvotVotes.sessionId),
    })
    .from(gamvotItems)
    .leftJoin(gamvotVotes, eq(gamvotVotes.itemId, gamvotItems.id))
    .leftJoin(
      gamvotSessions,
      and(
        eq(gamvotSessions.id, gamvotVotes.sessionId),
        eq(gamvotSessions.status, 'completed')
      )
    )
    .where(eq(gamvotItems.entityId, entityId))
    .groupBy(gamvotItems.id)
    .orderBy(desc(sum(gamvotVotes.amount)))
    .limit(50)

  return NextResponse.json({
    stats: {
      participants: Number(stats?.participantCount) || 0,
      totalInvested: Number(stats?.totalInvested) || 0,
    },
    items: items
      .filter(item => Number(item.totalAmount) > 0)
      .map(item => ({
        id: item.id,
        text: item.text,
        totalAmount: Number(item.totalAmount) || 0,
        voterCount: Number(item.voterCount) || 0,
      })),
  })
}
