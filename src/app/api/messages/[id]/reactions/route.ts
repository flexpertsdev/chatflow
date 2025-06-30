import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, messageReactions, roomMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Add a reaction to a message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      )
    }

    // Get the message
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, params.id))
      .limit(1)

    if (!message[0]) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if user is member of the room
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, message[0].roomId),
          eq(roomMembers.userId, session.user.id)
        )
      )
      .limit(1)

    if (!membership[0]) {
      return NextResponse.json(
        { error: 'You are not a member of this room' },
        { status: 403 }
      )
    }

    // Check if reaction already exists
    const existingReaction = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, params.id),
          eq(messageReactions.userId, session.user.id),
          eq(messageReactions.emoji, emoji)
        )
      )
      .limit(1)

    if (existingReaction[0]) {
      // Remove reaction if it already exists (toggle)
      await db
        .delete(messageReactions)
        .where(
          and(
            eq(messageReactions.messageId, params.id),
            eq(messageReactions.userId, session.user.id),
            eq(messageReactions.emoji, emoji)
          )
        )

      return NextResponse.json({ removed: true })
    }

    // Add reaction
    const [newReaction] = await db
      .insert(messageReactions)
      .values({
        messageId: params.id,
        userId: session.user.id,
        emoji,
      })
      .returning()

    return NextResponse.json({ reaction: newReaction })
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
}

// Remove a reaction from a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const emoji = searchParams.get('emoji')

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      )
    }

    // Delete reaction
    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, params.id),
          eq(messageReactions.userId, session.user.id),
          eq(messageReactions.emoji, emoji)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing reaction:', error)
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    )
  }
}