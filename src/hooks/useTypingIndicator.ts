'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import { debounce } from 'lodash'

interface TypingUser {
  userId: string
  username: string
}

interface UseTypingIndicatorOptions {
  roomId: string
  typingTimeout?: number
}

export function useTypingIndicator({ roomId, typingTimeout = 3000 }: UseTypingIndicatorOptions) {
  const { on, off, startTyping, stopTyping } = useSocket()
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const isTypingRef = useRef(false)

  // Handle user started typing
  const handleUserTyping = useCallback((user: TypingUser) => {
    // Clear existing timeout for this user
    const existingTimeout = timeoutsRef.current.get(user.userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Add/update typing user
    setTypingUsers(prev => {
      const next = new Map(prev)
      next.set(user.userId, user)
      return next
    })

    // Set timeout to remove user
    const timeout = setTimeout(() => {
      setTypingUsers(prev => {
        const next = new Map(prev)
        next.delete(user.userId)
        return next
      })
      timeoutsRef.current.delete(user.userId)
    }, typingTimeout)

    timeoutsRef.current.set(user.userId, timeout)
  }, [typingTimeout])

  // Handle user stopped typing
  const handleUserStoppedTyping = useCallback((data: { userId: string }) => {
    const timeout = timeoutsRef.current.get(data.userId)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(data.userId)
    }

    setTypingUsers(prev => {
      const next = new Map(prev)
      next.delete(data.userId)
      return next
    })
  }, [])

  // Subscribe to socket events
  useEffect(() => {
    const unsubscribeTyping = on('user-typing', handleUserTyping)
    const unsubscribeStopped = on('user-stopped-typing', handleUserStoppedTyping)

    return () => {
      unsubscribeTyping()
      unsubscribeStopped()
      
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [on, off, handleUserTyping, handleUserStoppedTyping])

  // Debounced typing notification
  const notifyTyping = useCallback(
    debounce(() => {
      if (isTypingRef.current) {
        startTyping(roomId)
      }
    }, 300),
    [roomId, startTyping]
  )

  // Stop typing notification
  const notifyStopTyping = useCallback(
    debounce(() => {
      if (!isTypingRef.current) {
        stopTyping(roomId)
      }
    }, 1000),
    [roomId, stopTyping]
  )

  // Set typing status
  const setTyping = useCallback((typing: boolean) => {
    isTypingRef.current = typing
    
    if (typing) {
      notifyTyping()
    } else {
      notifyStopTyping()
    }
  }, [notifyTyping, notifyStopTyping])

  // Get typing users array
  const typingUsersArray = Array.from(typingUsers.values())

  // Format typing indicator text
  const getTypingText = useCallback(() => {
    const count = typingUsersArray.length
    
    if (count === 0) return null
    if (count === 1) return `${typingUsersArray[0].username} is typing...`
    if (count === 2) return `${typingUsersArray[0].username} and ${typingUsersArray[1].username} are typing...`
    if (count === 3) return `${typingUsersArray[0].username}, ${typingUsersArray[1].username}, and ${typingUsersArray[2].username} are typing...`
    
    return `${typingUsersArray[0].username} and ${count - 1} others are typing...`
  }, [typingUsersArray])

  return {
    typingUsers: typingUsersArray,
    typingText: getTypingText(),
    setTyping,
    isTyping: typingUsersArray.length > 0,
  }
}