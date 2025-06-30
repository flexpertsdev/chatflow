/**
 * MESSAGE BUBBLE COMPONENT SPECIFICATION
 * 
 * Purpose: Display individual chat messages with appropriate styling
 * 
 * DESIGN SYSTEM INTEGRATION:
 * - Uses CSS classes from /src/styles/components.css
 * - Follows design tokens from /src/styles/design-system.css
 * - Implements warm, friendly aesthetic per user requirements
 * 
 * VISUAL DESIGN (from Design System):
 * - Sent messages: 
 *   - Background: var(--primary) #9333EA
 *   - Text: var(--text-inverse) white
 *   - Border radius: var(--radius-2xl) 16px
 *   - Bottom-right radius squared off
 * - Received messages:
 *   - Background: var(--surface)
 *   - Text: var(--text-primary)
 *   - Border radius: var(--radius-2xl) 16px
 *   - Bottom-left radius squared off
 * - Touch target: Minimum 44px height
 * - WhatsApp-inspired bubble style
 * 
 * CSS CLASSES USED:
 * - .message (container)
 * - .message-sent / .message-received (variants)
 * - .message-bubble (bubble styling)
 * - .message-avatar (36px avatar)
 * - .message-meta (timestamp, sender info)
 * - .message-reactions (reaction bar)
 * - .reaction / .reaction-active (individual reactions)
 * 
 * PROPS:
 * - id: string (message ID)
 * - content: string (message text)
 * - sender: { id: string, name: string, avatar?: string }
 * - timestamp: Date
 * - variant: 'sent' | 'received' | 'system'
 * - reactions?: Array<{ emoji: string, users: string[] }>
 * - isEdited?: boolean
 * - attachments?: Array<{ type: 'image', url: string, alt?: string }>
 * - onReact?: (emoji: string) => void
 * - onEdit?: () => void
 * - onDelete?: () => void
 * - onReply?: () => void
 * 
 * FEATURES:
 * - Message tail on appropriate corner
 * - Avatar shown for received messages (grouped messages hide avatar)
 * - Timestamp on hover (desktop) or always visible (mobile)
 * - Reactions bar below message
 * - Long press or right-click for context menu
 * - Edited indicator if modified
 * - Image attachments with lightbox on click
 * 
 * INTERACTIONS:
 * - Hover: Show timestamp and actions
 * - Click reaction: Add/remove reaction
 * - Click image: Open in lightbox
 * - Long press: Show context menu (edit, delete, reply, react)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Max-width 85%, smaller padding
 * - Desktop: Max-width 70%, hover effects
 * - Follows mobile-first design system
 * 
 * ACCESSIBILITY:
 * - Proper ARIA labels
 * - Keyboard navigation for actions
 * - Screen reader announces sender and time
 * - Meets WCAG color contrast requirements
 * 
 * PERFORMANCE:
 * - Memo component to prevent re-renders
 * - Lazy load images
 * - Virtualization support (stable heights)
 * 
 * RELATIONSHIPS:
 * - Parent: MessageList component
 * - Uses: Avatar, EmojiPicker, ContextMenu components
 * - Styles: Inherits from design system globals
 * 
 * MOCKUP_ID: message-bubble-v3
 * DESIGN_TOKENS: /src/styles/design-system.css
 * COMPONENT_STYLES: /src/styles/components.css (lines 64-139)
 */

'use client'

import { memo, useState } from 'react'
import { format } from 'date-fns'
import { MoreVertical, Edit2, Trash2, Reply, SmilePlus } from 'lucide-react'
import Image from 'next/image'

interface MessageBubbleProps {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  variant: 'sent' | 'received' | 'system'
  reactions?: Array<{
    emoji: string
    users: string[]
  }>
  isEdited?: boolean
  attachments?: Array<{
    type: 'image'
    url: string
    alt?: string
  }>
  onReact?: (emoji: string) => void
  onEdit?: () => void
  onDelete?: () => void
  onReply?: () => void
  currentUserId?: string
}

export const MessageBubble = memo(function MessageBubble({
  id,
  content,
  sender,
  timestamp,
  variant,
  reactions = [],
  isEdited = false,
  attachments = [],
  onReact,
  onEdit,
  onDelete,
  onReply,
  currentUserId,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [showTimestamp, setShowTimestamp] = useState(false)

  if (variant === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="text-sm text-text-tertiary bg-surface px-4 py-2 rounded-full">
          {content}
        </div>
      </div>
    )
  }

  const isSent = variant === 'sent'
  const containerClass = isSent ? 'justify-end' : 'justify-start'
  const bubbleClass = isSent ? 'message-sent' : 'message-received'

  const handleReaction = (emoji: string) => {
    onReact?.(emoji)
  }

  const hasUserReacted = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji)
    return reaction?.users.includes(currentUserId || '') || false
  }

  return (
    <div className={`message flex ${containerClass} mb-4 px-4`}>
      {/* Avatar for received messages */}
      {!isSent && (
        <div className="message-avatar mr-2 flex-shrink-0">
          {sender.avatar ? (
            <Image
              src={sender.avatar}
              alt={sender.name}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%] md:max-w-[85%]`}>
        {/* Sender name for received messages */}
        {!isSent && (
          <div className="message-meta text-xs text-text-tertiary mb-1">
            {sender.name}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`message-bubble ${bubbleClass} relative group`}
          onMouseEnter={() => setShowTimestamp(true)}
          onMouseLeave={() => setShowTimestamp(false)}
        >
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mb-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <Image
                    src={attachment.url}
                    alt={attachment.alt || 'Image'}
                    width={300}
                    height={200}
                    className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          <p className="whitespace-pre-wrap break-words">{content}</p>

          {/* Edited indicator */}
          {isEdited && (
            <span className="text-xs opacity-70 ml-2">(edited)</span>
          )}

          {/* Actions menu */}
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded hover:bg-surface-hover"
            >
              <MoreVertical size={16} />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-10">
                {onReply && (
                  <button
                    onClick={onReply}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-hover w-full text-left text-sm"
                  >
                    <Reply size={16} />
                    Reply
                  </button>
                )}
                {onReact && (
                  <button
                    onClick={() => onReact('👍')}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-hover w-full text-left text-sm"
                  >
                    <SmilePlus size={16} />
                    React
                  </button>
                )}
                {isSent && onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-hover w-full text-left text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
                {isSent && onDelete && (
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-hover w-full text-left text-sm text-error"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="message-reactions flex gap-1 mt-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`reaction ${
                  hasUserReacted(reaction.emoji) ? 'reaction-active' : ''
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs ml-1">{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`message-meta text-xs text-text-tertiary mt-1 ${
          showTimestamp || window.innerWidth < 768 ? 'opacity-100' : 'opacity-0'
        } transition-opacity`}>
          {format(timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  )
})