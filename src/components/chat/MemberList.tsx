/**
 * MEMBER LIST COMPONENT SPECIFICATION
 * 
 * Purpose: Display room members with online status and roles
 * 
 * PROPS:
 * - members: Array<{
 *     id: string
 *     name: string
 *     avatar?: string
 *     status: 'online' | 'idle' | 'offline'
 *     role: 'owner' | 'moderator' | 'member'
 *     joinedAt: Date
 *   }>
 * - currentUserId: string
 * - onMemberClick?: (userId: string) => void
 * - showRoles?: boolean (default: true)
 * - compact?: boolean (default: false)
 * 
 * LAYOUT:
 * - Scrollable vertical list
 * - Grouped by status (Online → Offline)
 * - Within status, sorted by role then name
 * 
 * MEMBER ITEM DESIGN:
 * ┌─────────────────────────┐
 * │ 🟢 [@] John Doe    👑  │
 * └─────────────────────────┘
 * 
 * Elements:
 * - Status indicator (green/yellow/gray dot)
 * - Avatar (initials if no image)
 * - Username
 * - Role badge (crown for owner, shield for mod)
 * 
 * FEATURES:
 * - Real-time status updates
 * - Search/filter members
 * - Show member count at top
 * - Hover shows joined date
 * - Click for user menu
 * - Typing indicator overlay
 * 
 * STATUS INDICATORS:
 * - 🟢 Online: Active now
 * - 🟡 Idle: Away (>5 min inactive)
 * - ⚫ Offline: Not connected
 * 
 * INTERACTIONS:
 * - Click member: Show profile/options menu
 * - Right-click: Context menu (DM, mention, view profile)
 * - For mods: Additional options (kick, ban, promote)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Full sidebar (250px)
 * - Tablet: Narrower (200px)
 * - Mobile: Full screen overlay
 * 
 * PERFORMANCE:
 * - Virtual scroll for large lists
 * - Batch status updates
 * - Memoize member items
 * 
 * ACCESSIBILITY:
 * - Announce status changes
 * - Keyboard navigation
 * - Role descriptions
 * 
 * RELATIONSHIPS:
 * - Parent: ChatRoomPage
 * - Opens: UserProfileModal
 * 
 * MOCKUP_ID: member-list-v3
 */

'use client'

import { useState, useMemo, memo } from 'react'
import { Crown, Shield, Search, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface Member {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'idle' | 'offline'
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
}

interface MemberListProps {
  members: Member[]
  currentUserId: string
  onMemberClick?: (userId: string) => void
  showRoles?: boolean
  compact?: boolean
}

export function MemberList({
  members,
  currentUserId,
  onMemberClick,
  showRoles = true,
  compact = false,
}: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null)

  // Filter and sort members
  const processedMembers = useMemo(() => {
    // Filter by search query
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group by status
    const grouped = {
      online: [] as Member[],
      idle: [] as Member[],
      offline: [] as Member[],
    }

    filtered.forEach(member => {
      grouped[member.status].push(member)
    })

    // Sort within each group by role then name
    const roleOrder = { owner: 0, moderator: 1, member: 2 }
    
    Object.values(grouped).forEach(group => {
      group.sort((a, b) => {
        const roleDiff = roleOrder[a.role] - roleOrder[b.role]
        if (roleDiff !== 0) return roleDiff
        return a.name.localeCompare(b.name)
      })
    })

    // Combine groups
    return [...grouped.online, ...grouped.idle, ...grouped.offline]
  }, [members, searchQuery])

  const onlineCount = members.filter(m => m.status === 'online').length

  return (
    <div className="member-list flex flex-col h-full bg-surface border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">
            Members ({members.length})
          </h3>
          <span className="text-sm text-text-tertiary">
            {onlineCount} online
          </span>
        </div>

        {/* Search */}
        {!compact && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto">
        {processedMembers.length === 0 ? (
          <div className="text-center text-text-tertiary p-4">
            No members found
          </div>
        ) : (
          <div className="p-2">
            {processedMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                isCurrentUser={member.id === currentUserId}
                showRole={showRoles}
                compact={compact}
                isHovered={hoveredMemberId === member.id}
                onMouseEnter={() => setHoveredMemberId(member.id)}
                onMouseLeave={() => setHoveredMemberId(null)}
                onClick={() => onMemberClick?.(member.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Memoized member item for performance
const MemberItem = memo(function MemberItem({
  member,
  isCurrentUser,
  showRole,
  compact,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  member: Member
  isCurrentUser: boolean
  showRole: boolean
  compact: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  const statusColors = {
    online: 'bg-success',
    idle: 'bg-warning',
    offline: 'bg-text-tertiary',
  }

  const roleIcons = {
    owner: <Crown size={16} className="text-warning" />,
    moderator: <Shield size={16} className="text-info" />,
    member: null,
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        hover:bg-surface-hover transition-colors relative group
        ${isCurrentUser ? 'bg-primary-light/10' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className="relative">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-light">
          {member.avatar ? (
            <Image
              src={member.avatar}
              alt={member.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-primary">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* Status dot */}
        <div
          className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full
            ${statusColors[member.status]}
            border-2 border-surface
          `}
        />
      </div>

      {/* Name and role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`
            text-sm font-medium truncate
            ${member.status === 'offline' ? 'text-text-tertiary' : 'text-text-primary'}
          `}>
            {member.name}
            {isCurrentUser && ' (You)'}
          </span>
          {showRole && roleIcons[member.role]}
        </div>
        
        {/* Hover tooltip */}
        {isHovered && !compact && (
          <div className="text-xs text-text-tertiary">
            Joined {formatDistanceToNow(member.joinedAt)} ago
          </div>
        )}
      </div>

      {/* Actions button */}
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface rounded"
        onClick={(e) => {
          e.stopPropagation()
          // Handle member actions menu
        }}
      >
        <MoreVertical size={16} className="text-text-tertiary" />
      </button>
    </div>
  )
})