import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { gamvotSessions, gamvotVotes, gamvotItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/games/voter-budget/sessions/:sessionId/votes
// Add a vote (creates item if it doesn't exist)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const body = await request.json()

  const { text, notes, amount } = body

  // Validate input
  if (!text || !amount) {
    return NextResponse.json(
      { error: 'text and amount are required' },
      { status: 400 }
    )
  }

  if (amount < 5 || amount > 100) {
    return NextResponse.json(
      { error: 'Amount must be between 5 and 100' },
      { status: 400 }
    )
  }

  // Get session to check it exists and get entityId
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

  // Find or create the item (using 'ideas' as default dimension for backwards compatibility)
  let item = await db.query.gamvotItems.findFirst({
    where: and(
      eq(gamvotItems.entityId, session.entityId),
      eq(gamvotItems.text, text)
    ),
  })

  if (!item) {
    const [newItem] = await db
      .insert(gamvotItems)
      .values({
        entityId: session.entityId,
        text,
        dimension: 'ideas', // Default dimension for backwards compatibility
        createdBy: session.userId,
      })
      .returning()
    item = newItem
  }

  // Check if vote already exists for this item in this session
  const existingVote = await db.query.gamvotVotes.findFirst({
    where: and(
      eq(gamvotVotes.sessionId, sessionId),
      eq(gamvotVotes.itemId, item.id)
    ),
  })

  if (existingVote) {
    return NextResponse.json(
      { error: 'Vote already exists for this item' },
      { status: 409 }
    )
  }

  // Create the vote
  const [vote] = await db
    .insert(gamvotVotes)
    .values({
      sessionId,
      itemId: item.id,
      amount,
      notes: notes || null,
    })
    .returning()

  return NextResponse.json({
    vote: {
      id: vote.id,
      itemId: vote.itemId,
      text: item.text,
      amount: vote.amount,
      notes: vote.notes,
    },
  }, { status: 201 })
}
