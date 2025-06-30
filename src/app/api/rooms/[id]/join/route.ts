import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rooms, roomMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Join a room
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

    // Check if room exists
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

    // Check if already a member
    const existingMembership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, params.id),
          eq(roomMembers.userId, session.user.id)
        )
      )
      .limit(1)

    if (existingMembership[0]) {
      return NextResponse.json(
        { message: 'Already a member of this room' },
        { status: 200 }
      )
    }

    // Add user as member
    await db.insert(roomMembers).values({
      roomId: params.id,
      userId: session.user.id,
      role: 'member',
    })

    // Update room's last activity
    await db
      .update(rooms)
      .set({ updatedAt: new Date() })
      .where(eq(rooms.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}