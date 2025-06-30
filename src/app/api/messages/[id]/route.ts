import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, roomMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Update a message
export async function PUT(
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
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
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

    // Check if user owns the message
    if (message[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      )
    }

    // Update message
    const [updatedMessage] = await db
      .update(messages)
      .set({
        content,
        isEdited: true,
        editedAt: new Date(),
      })
      .where(eq(messages.id, params.id))
      .returning()

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// Delete a message
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

    // Check if user owns the message or is a moderator
    if (message[0].userId === session.user.id) {
      // User owns the message, can delete
    } else {
      // Check if user is moderator or owner of the room
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

      if (!membership[0] || (membership[0].role !== 'owner' && membership[0].role !== 'moderator')) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this message' },
          { status: 403 }
        )
      }
    }

    // Delete message
    await db
      .delete(messages)
      .where(eq(messages.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}