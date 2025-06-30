'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'

export interface Message {
  id: string
  roomId: string
  content: string
  senderId: string
  senderName: string
  attachments: any[]
  timestamp: Date
  reactions?: Array<{
    emoji: string
    users: string[]
  }>
  isEdited?: boolean
}

interface UseMessagesOptions {
  roomId: string
  initialMessages?: Message[]
  pageSize?: number
}

interface MessagesState {
  messages: Message[]
  loading: boolean
  error: string | null
  hasMore: boolean
}

export function useMessages({ roomId, initialMessages = [], pageSize = 50 }: UseMessagesOptions) {
  const { on, off, sendMessage: socketSendMessage } = useSocket()
  const [state, setState] = useState<MessagesState>({
    messages: initialMessages,
    loading: false,
    error: null,
    hasMore: true,
  })
  
  const messagesRef = useRef<Map<string, Message>>(new Map())
  const optimisticUpdates = useRef<Set<string>>(new Set())

  // Initialize messages map
  useEffect(() => {
    initialMessages.forEach(msg => {
      messagesRef.current.set(msg.id, msg)
    })
    setState(prev => ({ ...prev, messages: initialMessages }))
  }, [initialMessages])

  // Fetch messages from API
  const fetchMessages = useCallback(async (cursor?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const params = new URLSearchParams({
        roomId,
        limit: pageSize.toString(),
        ...(cursor && { cursor }),
      })
      
      const response = await fetch(`/api/messages?${params}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      
      // Add messages to map
      data.messages.forEach((msg: Message) => {
        messagesRef.current.set(msg.id, msg)
      })
      
      // Update state
      setState(prev => ({
        ...prev,
        messages: cursor 
          ? [...prev.messages, ...data.messages]
          : data.messages,
        hasMore: data.hasMore,
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      }))
    }
  }, [roomId, pageSize])

  // Send message with optimistic update
  const sendMessage = useCallback((content: string, attachments?: any[]) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const optimisticMessage: Message = {
      id: tempId,
      roomId,
      content,
      senderId: 'current-user', // This should come from session
      senderName: 'You',
      attachments: attachments || [],
      timestamp: new Date(),
    }
    
    // Add optimistic update
    optimisticUpdates.current.add(tempId)
    messagesRef.current.set(tempId, optimisticMessage)
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, optimisticMessage],
    }))
    
    // Send via socket
    socketSendMessage(roomId, content, attachments)
  }, [roomId, socketSendMessage])

  // Handle new message from socket
  const handleNewMessage = useCallback((message: Message) => {
    // Check if this is a confirmation of our optimistic update
    const tempMessages = Array.from(optimisticUpdates.current)
    const matchingTemp = tempMessages.find(tempId => {
      const tempMsg = messagesRef.current.get(tempId)
      return tempMsg && 
        tempMsg.content === message.content &&
        tempMsg.senderId === message.senderId &&
        Math.abs(new Date(tempMsg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000
    })
    
    if (matchingTemp) {
      // Replace optimistic update with real message
      optimisticUpdates.current.delete(matchingTemp)
      messagesRef.current.delete(matchingTemp)
      messagesRef.current.set(message.id, message)
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === matchingTemp ? message : msg
        ),
      }))
    } else {
      // Add new message
      messagesRef.current.set(message.id, message)
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }))
    }
  }, [])

  // Handle reaction added
  const handleReactionAdded = useCallback((data: {
    messageId: string
    emoji: string
    userId: string
    username: string
  }) => {
    const message = messagesRef.current.get(data.messageId)
    if (!message) return
    
    // Update reactions
    const reactions = message.reactions || []
    const existingReaction = reactions.find(r => r.emoji === data.emoji)
    
    if (existingReaction) {
      if (!existingReaction.users.includes(data.userId)) {
        existingReaction.users.push(data.userId)
      }
    } else {
      reactions.push({ emoji: data.emoji, users: [data.userId] })
    }
    
    const updatedMessage = { ...message, reactions }
    messagesRef.current.set(data.messageId, updatedMessage)
    
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === data.messageId ? updatedMessage : msg
      ),
    }))
  }, [])

  // Subscribe to socket events
  useEffect(() => {
    const unsubscribeNewMessage = on('new-message', handleNewMessage)
    const unsubscribeReaction = on('reaction-added', handleReactionAdded)
    
    return () => {
      unsubscribeNewMessage()
      unsubscribeReaction()
    }
  }, [on, handleNewMessage, handleReactionAdded])

  // Load more messages
  const loadMore = useCallback(() => {
    if (state.loading || !state.hasMore) return
    
    const oldestMessage = state.messages[0]
    if (oldestMessage) {
      fetchMessages(oldestMessage.id)
    }
  }, [state.loading, state.hasMore, state.messages, fetchMessages])

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    const { addReaction: socketAddReaction } = useSocket()
    socketAddReaction(roomId, messageId, emoji)
  }, [roomId])

  // Initial fetch
  useEffect(() => {
    if (initialMessages.length === 0) {
      fetchMessages()
    }
  }, [fetchMessages, initialMessages.length])

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    sendMessage,
    loadMore,
    addReaction,
  }
}