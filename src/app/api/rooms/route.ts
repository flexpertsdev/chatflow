import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rooms, roomMembers } from '@/lib/db/schema'
import { desc, eq, sql, and, or, ilike } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'active'
    
    const offset = (page - 1) * limit
    
    // Get current user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build where conditions
    const whereConditions = [
      eq(rooms.isPublic, true),
      eq(rooms.isActive, true),
    ]

    if (search) {
      whereConditions.push(
        or(
          ilike(rooms.name, `%${search}%`),
          ilike(rooms.description, `%${search}%`)
        )!
      )
    }

    if (category && category !== 'All') {
      whereConditions.push(eq(rooms.category, category))
    }

    // Get rooms with member count
    const query = db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        category: rooms.category,
        isPublic: rooms.isPublic,
        lastActivityAt: rooms.lastActivityAt,
        createdAt: rooms.createdAt,
        memberCount: sql<number>`count(distinct ${roomMembers.userId})`,
      })
      .from(rooms)
      .leftJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(and(...whereConditions))
      .groupBy(rooms.id)
      .limit(limit)
      .offset(offset)

    // Apply sorting
    if (sort === 'active') {
      query.orderBy(desc(rooms.lastActivityAt))
    } else if (sort === 'newest') {
      query.orderBy(desc(rooms.createdAt))
    } else if (sort === 'alphabetical') {
      query.orderBy(rooms.name)
    }

    const roomsList = await query

    // Check if user has joined each room (if authenticated)
    const roomsWithJoinStatus = await Promise.all(
      roomsList.map(async (room) => {
        let hasJoined = false
        
        if (userId) {
          const membership = await db
            .select()
            .from(roomMembers)
            .where(
              and(
                eq(roomMembers.roomId, room.id),
                eq(roomMembers.userId, userId)
              )
            )
            .limit(1)
          
          hasJoined = membership.length > 0
        }

        return {
          ...room,
          onlineCount: Math.floor(Math.random() * room.memberCount * 0.3), // Mock online count
          hasJoined,
          imageUrl: null, // Would come from room settings
        }
      })
    )

    // Check if there are more rooms
    const totalCount = await db
      .select({ count: sql<number>`count(distinct ${rooms.id})` })
      .from(rooms)
      .where(and(...whereConditions))
      
    const hasMore = offset + limit < totalCount[0].count

    return NextResponse.json({
      rooms: roomsWithJoinStatus,
      page,
      limit,
      total: totalCount[0].count,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// Create a new room
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, category, isPublic } = body

    // Validate input
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Create room
    const [newRoom] = await db
      .insert(rooms)
      .values({
        name,
        description,
        category,
        isPublic: isPublic ?? true,
        ownerId: session.user.id,
      })
      .returning()

    // Add owner as member
    await db.insert(roomMembers).values({
      roomId: newRoom.id,
      userId: session.user.id,
      role: 'owner',
    })

    return NextResponse.json({ room: newRoom })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}