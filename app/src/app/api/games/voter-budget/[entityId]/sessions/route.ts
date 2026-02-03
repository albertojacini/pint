import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotSessions } from '@/lib/db/schema'

// POST /api/games/voter-budget/:entityId/sessions
// Create a new game session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params
  const body = await request.json()

  const { userId, anonymousId } = body

  if (!userId && !anonymousId) {
    return NextResponse.json(
      { error: 'Either userId or anonymousId is required' },
      { status: 400 }
    )
  }

  const [session] = await db
    .insert(gamvotSessions)
    .values({
      entityId,
      userId: userId || null,
      anonymousId: anonymousId || null,
    })
    .returning()

  return NextResponse.json({ session }, { status: 201 })
}
