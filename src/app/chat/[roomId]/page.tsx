/**
 * CHAT ROOM PAGE SPECIFICATION
 * 
 * Purpose: Real-time chat interface for group conversations
 * Inspiration: Discord channels (simplified version)
 * 
 * LAYOUT STRUCTURE:
 * ┌─────────────────────────────────────────┐
 * │ Header (Room name, members, settings)   │ 64px
 * ├─────────────┬───────────────────────────┤
 * │             │                           │
 * │   Members   │      Messages Area        │ flex
 * │   Sidebar   │   (Virtualized scroll)    │
 * │   (250px)   │                           │
 * │             ├───────────────────────────┤
 * │             │     Message Input         │ auto
 * └─────────────┴───────────────────────────┘
 * 
 * FEATURES:
 * - Real-time messaging via WebSocket
 * - Message types: text, images, system
 * - Typing indicators (show who's typing)
 * - Online presence in member list
 * - Message reactions (emoji picker)
 * - Edit/delete own messages
 * - Image upload with preview
 * - Auto-scroll to bottom on new messages
 * - Unread message indicator
 * - @ mentions with notifications
 * 
 * COMPONENTS USED:
 * - ChatHeader (from @/components/chat/ChatHeader)
 * - MemberList (from @/components/chat/MemberList)
 * - MessageList (from @/components/chat/MessageList)
 * - MessageBubble (from @/components/chat/MessageBubble)
 * - ChatInput (from @/components/chat/ChatInput)
 * - TypingIndicator (from @/components/chat/TypingIndicator)
 * - EmojiPicker (from @/components/ui/EmojiPicker)
 * 
 * STATE MANAGEMENT:
 * - Current room data (name, settings, members)
 * - Messages array (paginated, 50 at a time)
 * - Active/typing users
 * - Unread count
 * - User's draft message
 * - Upload progress
 * 
 * REAL-TIME EVENTS:
 * - message:new
 * - message:edit
 * - message:delete
 * - user:typing
 * - user:joined
 * - user:left
 * - presence:update
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Full layout with sidebar
 * - Tablet: Collapsible sidebar (toggle button)
 * - Mobile: Hidden sidebar, swipe or button to show
 * 
 * MESSAGE INPUT FEATURES:
 * - Multiline text support
 * - Emoji button
 * - Image upload button
 * - Send on Enter (Shift+Enter for new line)
 * - Character limit indicator (1000 chars)
 * 
 * PERMISSIONS:
 * - Room members: can send messages
 * - Room moderators: can delete any message
 * - Room owner: can modify room settings
 * 
 * RELATIONSHIPS:
 * - Parent: /chat (room list)
 * - Settings: /chat/settings?roomId={roomId}
 * - User profiles: /user/[userId] (from member list)
 * 
 * ERROR STATES:
 * - Room not found
 * - No permission to access (private room)
 * - Connection lost (reconnecting...)
 * 
 * PERFORMANCE:
 * - Virtual scrolling for messages
 * - Lazy load images
 * - Debounce typing indicators
 * - Optimistic UI updates
 * 
 * MOCKUP_ID: chat-room-v5
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { MemberList } from '@/components/chat/MemberList'
import { useSocket } from '@/hooks/useSocket'
import { useMessages } from '@/hooks/useMessages'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { usePresence } from '@/hooks/usePresence'
import { Menu, X, Users, Settings, ArrowLeft, Loader2 } from 'lucide-react'

interface Room {
  id: string
  name: string
  description?: string
  category: string
  isPublic: boolean
  ownerId: string
}

interface Member {
  id: string
  name: string
  email: string
  image?: string
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
  isOnline?: boolean
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(true)
  const [showMobileMembers, setShowMobileMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Custom hooks
  const { isConnected, joinRoom, leaveRoom } = useSocket({
    autoConnect: true,
    onConnect: () => console.log('Connected to chat'),
    onDisconnect: () => console.log('Disconnected from chat'),
  })
  
  const {
    messages,
    loading: messagesLoading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    loadMore,
  } = useMessages({ roomId: params.roomId })
  
  const { typingUsers, sendTyping } = useTypingIndicator(params.roomId)
  const { onlineUsers, updatePresence } = usePresence(params.roomId)

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomRes, membersRes] = await Promise.all([
          fetch(`/api/rooms/${params.roomId}`),
          fetch(`/api/rooms/${params.roomId}/members`),
        ])

        if (!roomRes.ok) {
          if (roomRes.status === 404) {
            setError('Room not found')
          } else if (roomRes.status === 403) {
            setError('You do not have permission to access this room')
          } else {
            setError('Failed to load room')
          }
          return
        }

        const roomData = await roomRes.json()
        const membersData = await membersRes.json()
        
        setRoom(roomData.room)
        setMembers(membersData.members)
        
        // Join the room via WebSocket
        if (session?.user?.id) {
          joinRoom(params.roomId, session.user.id)
        }
      } catch (error) {
        console.error('Error fetching room data:', error)
        setError('Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      fetchRoomData()
    }

    return () => {
      // Leave room on unmount
      if (session?.user?.id) {
        leaveRoom(params.roomId, session.user.id)
      }
    }
  }, [params.roomId, session, status, joinRoom, leaveRoom])

  // Update online status for members
  useEffect(() => {
    setMembers(prevMembers =>
      prevMembers.map(member => ({
        ...member,
        isOnline: onlineUsers.includes(member.id),
      }))
    )
  }, [onlineUsers])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Handle send message
  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!session?.user) return
    
    try {
      await sendMessage(content, files)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Handle typing
  const handleTyping = useCallback(() => {
    sendTyping()
  }, [sendTyping])

  // Handle member click
  const handleMemberClick = (userId: string) => {
    router.push(`/user/${userId}`)
  }

  // Handle settings click
  const handleSettingsClick = () => {
    router.push(`/chat/settings?roomId=${params.roomId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">{error || 'Room not found'}</h2>
        <button
          onClick={() => router.push('/chat')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          <ArrowLeft size={20} />
          Back to Rooms
        </button>
      </div>
    )
  }

  // Check permissions
  const currentMember = members.find(m => m.id === session?.user?.id)
  const canModerate = currentMember?.role === 'owner' || currentMember?.role === 'moderator'

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <header className="h-16 bg-background border-b border-border flex items-center px-4 gap-4">
        <button
          onClick={() => router.push('/chat')}
          className="lg:hidden p-2 hover:bg-surface rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold"># {room.name}</h1>
          {room.description && (
            <p className="text-sm text-text-secondary truncate">{room.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Member count */}
          <button
            onClick={() => setShowMobileMembers(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg hover:bg-surface-hover"
          >
            <Users size={18} />
            <span className="text-sm">{members.length}</span>
          </button>

          {/* Desktop toggle sidebar */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg hover:bg-surface-hover"
          >
            <Users size={18} />
            <span className="text-sm">{showMembers ? 'Hide' : 'Show'} Members</span>
          </button>

          {/* Settings */}
          {canModerate && (
            <button
              onClick={handleSettingsClick}
              className="p-2 hover:bg-surface rounded-lg"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {/* Load more button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={messagesLoading}
                  className="text-sm text-primary hover:text-primary-hover disabled:opacity-50"
                >
                  {messagesLoading ? 'Loading...' : 'Load earlier messages'}
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null
              const showAvatar = !previousMessage || previousMessage.userId !== message.userId
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.userId === session?.user?.id}
                  showAvatar={showAvatar}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={addReaction}
                  onRemoveReact={removeReaction}
                  canModerate={canModerate}
                />
              )
            })}

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="text-sm text-text-secondary pl-12">
                {typingUsers.length === 1
                  ? `${typingUsers[0].name} is typing...`
                  : typingUsers.length === 2
                  ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
                  : `${typingUsers.length} people are typing...`}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-4">
            <ChatInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              disabled={!session?.user || !isConnected}
              placeholder={
                !session?.user
                  ? 'Sign in to send messages'
                  : !isConnected
                  ? 'Connecting...'
                  : `Message #${room.name}`
              }
            />
          </div>
        </div>

        {/* Desktop member sidebar */}
        {showMembers && (
          <aside className="hidden lg:block w-64 bg-background border-l border-border overflow-y-auto">
            <MemberList
              members={members}
              currentUserId={session?.user?.id}
              onMemberClick={handleMemberClick}
            />
          </aside>
        )}
      </div>

      {/* Mobile member drawer */}
      {showMobileMembers && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowMobileMembers(false)}
          />
          <div className="w-80 bg-background">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Members</h2>
              <button
                onClick={() => setShowMobileMembers(false)}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <MemberList
              members={members}
              currentUserId={session?.user?.id}
              onMemberClick={(userId) => {
                handleMemberClick(userId)
                setShowMobileMembers(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}