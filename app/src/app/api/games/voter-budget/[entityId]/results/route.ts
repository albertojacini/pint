import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotItems, gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and, desc, sum, countDistinct } from 'drizzle-orm'

type Dimension = 'ideas' | 'likes' | 'dislikes'

// GET /api/games/voter-budget/:entityId/results?dimension=ideas
// Get community results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params
  const { searchParams } = new URL(request.url)

  const dimension = searchParams.get('dimension') as Dimension | null

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

  // Build conditions for items query
  const itemConditions = dimension
    ? and(
        eq(gamvotItems.entityId, entityId),
        eq(gamvotItems.dimension, dimension)
      )
    : eq(gamvotItems.entityId, entityId)

  // Get top items
  const items = await db
    .select({
      id: gamvotItems.id,
      text: gamvotItems.text,
      dimension: gamvotItems.dimension,
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
    .where(itemConditions)
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
        dimension: item.dimension,
        totalAmount: Number(item.totalAmount) || 0,
        voterCount: Number(item.voterCount) || 0,
      })),
  })
}
