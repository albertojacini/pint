import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotItems, gamvotSessions, gamvotVotes } from '@/lib/db/schema'
import { eq, and, desc, ilike, sum } from 'drizzle-orm'

type Dimension = 'ideas' | 'likes' | 'dislikes'

// GET /api/games/voter-budget/:entityId/items?dimension=ideas&q=bike
// Search items for autocomplete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params
  const { searchParams } = new URL(request.url)

  const dimension = searchParams.get('dimension')
  const query = searchParams.get('q')

  if (!dimension || !['ideas', 'likes', 'dislikes'].includes(dimension)) {
    return NextResponse.json(
      { error: 'Invalid or missing dimension parameter' },
      { status: 400 }
    )
  }

  const typedDimension = dimension as Dimension

  const baseConditions = and(
    eq(gamvotItems.entityId, entityId),
    eq(gamvotItems.dimension, typedDimension)
  )

  const conditions = query && query.length >= 2
    ? and(baseConditions, ilike(gamvotItems.text, `%${query}%`))
    : baseConditions

  const items = await db
    .select({
      id: gamvotItems.id,
      text: gamvotItems.text,
      dimension: gamvotItems.dimension,
      popularity: sum(gamvotVotes.amount),
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
    .where(conditions)
    .groupBy(gamvotItems.id)
    .orderBy(desc(sum(gamvotVotes.amount)))
    .limit(10)

  return NextResponse.json({
    items: items.map(item => ({
      id: item.id,
      text: item.text,
      dimension: item.dimension,
      popularity: Number(item.popularity) || 0,
    })),
  })
}
