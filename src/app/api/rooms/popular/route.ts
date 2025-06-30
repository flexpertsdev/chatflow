import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rooms, roomMembers } from '@/lib/db/schema'
import { desc, eq, sql, and } from 'drizzle-orm'

export async function GET() {
  try {
    // Get popular public rooms based on member count and recent activity
    const popularRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        category: rooms.category,
        isPublic: rooms.isPublic,
        lastActivityAt: rooms.lastActivityAt,
        memberCount: sql<number>`count(distinct ${roomMembers.userId})`,
      })
      .from(rooms)
      .leftJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(eq(rooms.isPublic, true))
      .groupBy(rooms.id)
      .orderBy(
        desc(sql`count(distinct ${roomMembers.userId})`),
        desc(rooms.updatedAt)
      )
      .limit(6)

    // Get online count for each room (simplified - in real app would use Socket.io)
    const roomsWithOnlineCount = popularRooms.map(room => ({
      ...room,
      onlineCount: Math.floor(Math.random() * room.memberCount * 0.3), // Mock online count
      hasJoined: false, // Would check if current user is member
    }))

    return NextResponse.json({ rooms: roomsWithOnlineCount })
  } catch (error) {
    console.error('Error fetching popular rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular rooms' },
      { status: 500 }
    )
  }
}