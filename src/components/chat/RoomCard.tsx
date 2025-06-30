/**
 * ROOM CARD COMPONENT SPECIFICATION
 * 
 * Purpose: Display chat room information in list/grid views
 * 
 * PROPS:
 * - room: {
 *     id: string
 *     name: string
 *     description?: string
 *     category: string
 *     memberCount: number
 *     onlineCount: number
 *     lastActivity: Date
 *     isPublic: boolean
 *     hasJoined: boolean
 *     imageUrl?: string
 *   }
 * - variant?: 'grid' | 'list' (default: 'grid')
 * - onJoin?: (roomId: string) => void
 * - onPreview?: (roomId: string) => void
 * - showLastMessage?: boolean
 * 
 * VISUAL DESIGN (Grid Variant):
 * ┌─────────────────────────┐
 * │ [Image or Icon]         │
 * │                         │
 * │ Room Name               │
 * │ Description (2 lines)   │
 * │                         │
 * │ 🏷️ Gaming  👥 24 online │
 * │                         │
 * │ [====== Join ======]    │
 * └─────────────────────────┘
 * 
 * VISUAL DESIGN (List Variant):
 * ┌─[Icon]─┬────────────────────────┬─────────┐
 * │        │ Room Name               │  Join   │
 * │        │ Description... 👥 24/150│         │
 * └────────┴────────────────────────┴─────────┘
 * 
 * FEATURES:
 * - Room image or default icon based on category
 * - Category badge with color coding
 * - Member count with online indicator
 * - Join button (changes to "Joined" state)
 * - Last activity as relative time
 * - Truncate long descriptions
 * 
 * INTERACTIONS:
 * - Hover: Elevate card, show full description
 * - Click card: Preview room details
 * - Click join: Join room action
 * - Joined state: Show "Enter" instead
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Always list variant, full width
 * - Tablet: 2 column grid
 * - Desktop: 3-4 column grid
 * 
 * CATEGORY COLORS:
 * - Gaming: Purple
 * - Study: Blue
 * - Social: Green
 * - Tech: Orange
 * - Other: Gray
 * 
 * LOADING STATE:
 * - Skeleton card with pulsing animation
 * 
 * EMPTY STATE:
 * - Muted colors
 * - "No members online" text
 * 
 * RELATIONSHIPS:
 * - Parent: ChatRoomsPage
 * - Navigates to: /chat/[roomId]
 * 
 * MOCKUP_ID: room-card-v4
 */

'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Users, Hash, Lock, MessageSquare, Gamepad2, BookOpen, Coffee, Code } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Room {
  id: string
  name: string
  description?: string
  category: string
  memberCount: number
  onlineCount: number
  lastActivity: Date
  isPublic: boolean
  hasJoined: boolean
  imageUrl?: string
}

interface RoomCardProps {
  room: Room
  variant?: 'grid' | 'list'
  onJoin?: (roomId: string) => void
  onPreview?: (roomId: string) => void
  showLastMessage?: boolean
}

export const RoomCard = memo(function RoomCard({
  room,
  variant = 'grid',
  onJoin,
  onPreview,
  showLastMessage = false,
}: RoomCardProps) {
  const categoryConfig = {
    Gaming: { color: 'bg-primary text-white', icon: Gamepad2 },
    Study: { color: 'bg-info text-white', icon: BookOpen },
    Social: { color: 'bg-success text-white', icon: Coffee },
    Tech: { color: 'bg-warning text-white', icon: Code },
    Other: { color: 'bg-text-tertiary text-white', icon: MessageSquare },
  }

  const config = categoryConfig[room.category as keyof typeof categoryConfig] || categoryConfig.Other
  const Icon = config.icon

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onJoin?.(room.id)
  }

  const handleCardClick = () => {
    onPreview?.(room.id)
  }

  if (variant === 'list') {
    return (
      <div
        className="room-card-list flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:shadow-md transition-all cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Icon/Image */}
        <div className="flex-shrink-0">
          {room.imageUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={room.imageUrl}
                alt={room.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center`}>
              <Icon size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {room.isPublic ? <Hash size={16} className="text-text-tertiary" /> : <Lock size={16} className="text-text-tertiary" />}
            <h3 className="font-medium truncate">{room.name}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            {room.description && (
              <p className="truncate flex-1">{room.description}</p>
            )}
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{room.onlineCount}/{room.memberCount}</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleJoinClick}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${room.hasJoined
              ? 'bg-surface hover:bg-surface-hover text-text-primary'
              : 'bg-primary hover:bg-primary-hover text-white'
            }
          `}
        >
          {room.hasJoined ? 'Enter' : 'Join'}
        </button>
      </div>
    )
  }

  // Grid variant
  return (
    <div
      className="room-card-grid bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image/Icon section */}
      <div className="h-32 relative overflow-hidden bg-surface">
        {room.imageUrl ? (
          <Image
            src={room.imageUrl}
            alt={room.name}
            width={300}
            height={128}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className={`w-full h-full ${config.color} flex items-center justify-center`}>
            <Icon size={48} className="opacity-50" />
          </div>
        )}
        
        {/* Activity indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {formatDistanceToNow(room.lastActivity)} ago
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-[calc(100%-8rem)]">
        {/* Room name */}
        <div className="flex items-center gap-2 mb-2">
          {room.isPublic ? <Hash size={16} className="text-text-tertiary" /> : <Lock size={16} className="text-text-tertiary" />}
          <h3 className="font-semibold truncate flex-1">{room.name}</h3>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3 flex-1">
            {room.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mb-3">
          {/* Category badge */}
          <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
            {room.category}
          </span>

          {/* Member count */}
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <Users size={14} />
            <span>
              {room.onlineCount > 0 ? (
                <>
                  <span className="text-success font-medium">{room.onlineCount}</span>
                  <span className="text-text-tertiary">/{room.memberCount}</span>
                </>
              ) : (
                <span className="text-text-tertiary">{room.memberCount} members</span>
              )}
            </span>
          </div>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoinClick}
          className={`
            w-full py-2 rounded-lg font-medium transition-colors
            ${room.hasJoined
              ? 'bg-surface hover:bg-surface-hover text-text-primary border border-border'
              : 'bg-primary hover:bg-primary-hover text-white'
            }
          `}
        >
          {room.hasJoined ? 'Enter Room' : 'Join Room'}
        </button>
      </div>
    </div>
  )
})

// Loading skeleton component
export function RoomCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
        <div className="w-12 h-12 bg-surface animate-pulse rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-surface animate-pulse rounded w-32 mb-2" />
          <div className="h-3 bg-surface animate-pulse rounded w-48" />
        </div>
        <div className="w-16 h-8 bg-surface animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      <div className="h-32 bg-surface animate-pulse" />
      <div className="p-4">
        <div className="h-5 bg-surface animate-pulse rounded w-3/4 mb-2" />
        <div className="h-4 bg-surface animate-pulse rounded mb-1" />
        <div className="h-4 bg-surface animate-pulse rounded w-5/6 mb-3" />
        <div className="flex justify-between mb-3">
          <div className="h-5 bg-surface animate-pulse rounded-full w-16" />
          <div className="h-4 bg-surface animate-pulse rounded w-12" />
        </div>
        <div className="h-9 bg-surface animate-pulse rounded-lg" />
      </div>
    </div>
  )
}