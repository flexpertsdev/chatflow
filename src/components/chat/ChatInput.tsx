/**
 * CHAT INPUT COMPONENT SPECIFICATION
 * 
 * Purpose: Message composition interface with rich features
 * 
 * PROPS:
 * - onSend: (message: string, attachments?: File[]) => void
 * - onTyping: () => void
 * - disabled?: boolean
 * - placeholder?: string
 * - maxLength?: number (default: 1000)
 * - allowAttachments?: boolean (default: true)
 * - allowEmoji?: boolean (default: true)
 * 
 * LAYOUT:
 * ┌─────────────────────────────────────────┐
 * │ 📎 😊 | Type a message...          | ➤  │
 * └─────────────────────────────────────────┘
 * 
 * FEATURES:
 * - Multi-line text input (auto-resize up to 4 lines)
 * - Attachment button (images only for now)
 * - Emoji picker button
 * - Send button (disabled when empty)
 * - Character count when near limit
 * - Typing indicator trigger
 * - Paste image support
 * - Drag & drop files
 * 
 * TEXT INPUT BEHAVIOR:
 * - Enter: Send message
 * - Shift+Enter: New line
 * - Auto-resize height
 * - Preserve draft on navigation
 * - Clear after send
 * 
 * ATTACHMENT FLOW:
 * 1. Click attachment or drag file
 * 2. Show preview thumbnail
 * 3. Option to remove
 * 4. Upload progress bar
 * 5. Send with message
 * 
 * EMOJI PICKER:
 * - Floating panel above input
 * - Recent emojis section
 * - Search functionality
 * - Click outside to close
 * 
 * VALIDATION:
 * - Trim whitespace
 * - Check message not empty
 * - Validate file types (images only)
 * - Max file size: 10MB
 * - Show inline errors
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Full width, larger touch targets
 * - Desktop: Contained width, smaller buttons
 * 
 * ACCESSIBILITY:
 * - Proper labels for buttons
 * - Announce character limit
 * - Keyboard navigation
 * 
 * PERFORMANCE:
 * - Debounce typing indicator
 * - Lazy load emoji picker
 * - Optimize image previews
 * 
 * RELATIONSHIPS:
 * - Parent: ChatRoom page
 * - Uses: EmojiPicker, FileUpload, Button components
 * 
 * MOCKUP_ID: chat-input-v3
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, Smile, Send, X } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useDropzone } from 'react-dropzone'
import { debounce } from 'lodash'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void
  onTyping: () => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  allowAttachments?: boolean
  allowEmoji?: boolean
}

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
  allowAttachments = true,
  allowEmoji = true,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) * 4
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [message])

  // Debounce typing indicator
  const debouncedTyping = useCallback(
    debounce(() => {
      onTyping()
    }, 1000),
    [onTyping]
  )

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setMessage(value)
      if (value.trim()) {
        debouncedTyping()
      }
    }
  }

  // Handle send message
  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage && attachments.length === 0) return

    onSend(trimmedMessage, attachments.length > 0 ? attachments : undefined)
    setMessage('')
    setAttachments([])
    setError(null)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle file validation
  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return false
    }
    return true
  }

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const validFiles = acceptedFiles.filter(validateFile)
    setAttachments(prev => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    noClick: true,
    noKeyboard: true,
  })

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(validateFile)
    setAttachments(prev => [...prev, ...validFiles])
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Handle emoji selection
  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    
    if (imageItems.length > 0) {
      e.preventDefault()
      setError(null)
      
      imageItems.forEach(item => {
        const file = item.getAsFile()
        if (file && validateFile(file)) {
          setAttachments(prev => [...prev, file])
        }
      })
    }
  }

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const charactersRemaining = maxLength - message.length
  const showCharacterCount = charactersRemaining < 100

  return (
    <div className="chat-input border-t border-border bg-background p-4">
      {/* Error message */}
      {error && (
        <div className="mb-2 text-sm text-error">{error}</div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div 
        {...getRootProps()}
        className={`flex items-end gap-2 ${isDragActive ? 'ring-2 ring-primary rounded-lg' : ''}`}
      >
        <input {...getInputProps()} />
        
        {/* Action buttons */}
        <div className="flex gap-1 pb-1">
          {allowAttachments && (
            <label className="p-2 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
              />
              <Paperclip size={20} className="text-text-tertiary" />
            </label>
          )}
          
          {allowEmoji && (
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <Smile size={20} className="text-text-tertiary" />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    searchDisabled={false}
                    skinTonesDisabled
                    height={350}
                    width={300}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px' }}
          />
          
          {showCharacterCount && (
            <div className={`absolute right-2 bottom-2 text-xs ${
              charactersRemaining < 20 ? 'text-error' : 'text-text-tertiary'
            }`}>
              {charactersRemaining}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>

      {isDragActive && (
        <div className="text-center text-sm text-primary mt-2">
          Drop images here to upload
        </div>
      )}
    </div>
  )
}