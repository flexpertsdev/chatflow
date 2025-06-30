import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, roomMembers } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { getServerSession } from '@/lib/auth'

// Get messages for a room
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id
    
    const searchParams = req.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user is member of the room
    if (userId) {
      const membership = await db
        .select()
        .from(roomMembers)
        .where(
          and(
            eq(roomMembers.roomId, roomId),
            eq(roomMembers.userId, userId)
          )
        )
        .limit(1)
        
      if (!membership[0]) {
        return NextResponse.json(
          { error: 'You are not a member of this room' },
          { status: 403 }
        )
      }
    }
    
    // Get messages
    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset)
    
    // Reverse to get chronological order
    messagesList.reverse()
    
    return NextResponse.json({
      messages: messagesList,
      hasMore: messagesList.length === limit,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const { roomId, content, type = 'text' } = body
    
    if (!roomId || !content) {
      return NextResponse.json(
        { error: 'Room ID and content are required' },
        { status: 400 }
      )
    }
    
    // Check if user is member of the room
    const membership = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, roomId),
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
    
    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        roomId,
        userId: session.user.id,
        content,
        type,
      })
      .returning()
    
    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}