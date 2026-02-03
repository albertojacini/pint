import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotItems, gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and, desc, sql, sum, count, countDistinct } from 'drizzle-orm'

// GET /api/games/voter-budget/:entityId
// Returns intro data: entity info, community stats, top items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params

  // Get completed sessions count and total invested for this entity
  const statsQuery = await db
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

  const stats = statsQuery[0] || { participantCount: 0, totalInvested: 0 }

  // Get top items with vote totals
  const topItems = await db
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
    .where(eq(gamvotItems.entityId, entityId))
    .groupBy(gamvotItems.id)
    .having(sql`${sum(gamvotVotes.amount)} > 0`)
    .orderBy(desc(sum(gamvotVotes.amount)))
    .limit(10)

  return NextResponse.json({
    entityId,
    stats: {
      participants: Number(stats.participantCount) || 0,
      totalInvested: Number(stats.totalInvested) || 0,
    },
    topItems: topItems.map(item => ({
      id: item.id,
      text: item.text,
      dimension: item.dimension,
      totalAmount: Number(item.totalAmount) || 0,
      voterCount: Number(item.voterCount) || 0,
    })),
  })
}
