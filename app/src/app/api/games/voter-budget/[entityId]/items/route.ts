import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotItems, gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and, desc, ilike, countDistinct } from 'drizzle-orm'

// GET /api/games/voter-budget/:entityId/items?q=bike
// Search items for autocomplete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params
  const { searchParams } = new URL(request.url)

  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ items: [] })
  }

  const items = await db
    .select({
      id: gamvotItems.id,
      text: gamvotItems.text,
      voteCount: countDistinct(gamvotVotes.sessionId),
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
    .where(
      and(
        eq(gamvotItems.entityId, entityId),
        ilike(gamvotItems.text, `%${query}%`)
      )
    )
    .groupBy(gamvotItems.id)
    .orderBy(desc(countDistinct(gamvotVotes.sessionId)))
    .limit(10)

  return NextResponse.json({
    items: items.map(item => ({
      id: item.id,
      text: item.text,
      voteCount: Number(item.voteCount) || 0,
    })),
  })
}
