import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { roomMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get room members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get members with user details
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: roomMembers.role,
        joinedAt: roomMembers.joinedAt,
      })
      .from(roomMembers)
      .innerJoin(users, eq(users.id, roomMembers.userId))
      .where(eq(roomMembers.roomId, params.id))
      .orderBy(roomMembers.joinedAt)

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching room members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room members' },
      { status: 500 }
    )
  }
}