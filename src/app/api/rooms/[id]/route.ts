import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rooms, roomMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Get room details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id

    // Get room
    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1)

    if (!room[0]) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if room is private and user is member
    if (!room[0].isPublic) {
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const membership = await db
        .select()
        .from(roomMembers)
        .where(
          and(
            eq(roomMembers.roomId, params.id),
            eq(roomMembers.userId, userId)
          )
        )
        .limit(1)

      if (!membership[0]) {
        return NextResponse.json(
          { error: 'You do not have permission to access this room' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ room: room[0] })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

// Update room
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
    const { name, description, category, isPublic } = body

    // Check if user is owner or moderator
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, params.id),
          eq(roomMembers.userId, session.user.id)
        )
      )
      .limit(1)

    if (!membership[0] || (membership[0].role !== 'owner' && membership[0].role !== 'moderator')) {
      return NextResponse.json(
        { error: 'You do not have permission to update this room' },
        { status: 403 }
      )
    }

    // Update room
    const updatedRoom = await db
      .update(rooms)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, params.id))
      .returning()

    return NextResponse.json({ room: updatedRoom[0] })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// Delete room
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

    // Check if user is owner
    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1)

    if (!room[0]) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the room owner can delete this room' },
        { status: 403 }
      )
    }

    // Delete room (cascades to members and messages)
    await db
      .delete(rooms)
      .where(eq(rooms.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}