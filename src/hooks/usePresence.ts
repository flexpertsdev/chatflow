'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'

interface UserPresence {
  userId: string
  username: string
  status: 'online' | 'idle' | 'offline'
  lastSeen?: Date
}

interface UsePresenceOptions {
  roomId?: string
  idleTimeout?: number
}

export function usePresence({ roomId, idleTimeout = 300000 }: UsePresenceOptions = {}) {
  const { on, off, updateStatus } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map())
  const [userStatus, setUserStatus] = useState<'online' | 'idle' | 'offline'>('online')
  let idleTimer: NodeJS.Timeout | null = null

  // Handle user joined
  const handleUserJoined = useCallback((data: {
    userId: string
    username: string
    timestamp: Date
  }) => {
    setOnlineUsers(prev => {
      const next = new Map(prev)
      next.set(data.userId, {
        userId: data.userId,
        username: data.username,
        status: 'online',
        lastSeen: new Date(data.timestamp),
      })
      return next
    })
  }, [])

  // Handle user left
  const handleUserLeft = useCallback((data: {
    userId: string
    username: string
    timestamp: Date
  }) => {
    setOnlineUsers(prev => {
      const next = new Map(prev)
      const user = next.get(data.userId)
      if (user) {
        next.set(data.userId, {
          ...user,
          status: 'offline',
          lastSeen: new Date(data.timestamp),
        })
      }
      return next
    })
  }, [])

  // Handle user disconnected
  const handleUserDisconnected = useCallback((data: {
    userId: string
    username: string
  }) => {
    setOnlineUsers(prev => {
      const next = new Map(prev)
      next.delete(data.userId)
      return next
    })
  }, [])

  // Handle status change
  const handleStatusChanged = useCallback((data: {
    userId: string
    status: 'online' | 'idle' | 'offline'
  }) => {
    setOnlineUsers(prev => {
      const next = new Map(prev)
      const user = next.get(data.userId)
      if (user) {
        next.set(data.userId, {
          ...user,
          status: data.status,
          lastSeen: new Date(),
        })
      }
      return next
    })
  }, [])

  // Handle room members
  const handleRoomMembers = useCallback((members: Array<{
    userId: string
    username: string
    socketId: string
  }>) => {
    const membersMap = new Map<string, UserPresence>()
    members.forEach(member => {
      if (member.userId) {
        membersMap.set(member.userId, {
          userId: member.userId,
          username: member.username,
          status: 'online',
          lastSeen: new Date(),
        })
      }
    })
    setOnlineUsers(membersMap)
  }, [])

  // Subscribe to events
  useEffect(() => {
    const unsubscribers = [
      on('user-joined', handleUserJoined),
      on('user-left', handleUserLeft),
      on('user-disconnected', handleUserDisconnected),
      on('user-status-changed', handleStatusChanged),
      on('room-members', handleRoomMembers),
    ]

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [on, handleUserJoined, handleUserLeft, handleUserDisconnected, handleStatusChanged, handleRoomMembers])

  // Activity detection
  const resetIdleTimer = useCallback(() => {
    if (idleTimer) {
      clearTimeout(idleTimer)
    }

    if (userStatus === 'idle') {
      setUserStatus('online')
      updateStatus('online')
    }

    idleTimer = setTimeout(() => {
      setUserStatus('idle')
      updateStatus('idle')
    }, idleTimeout)
  }, [userStatus, updateStatus, idleTimeout])

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    // Initial timer
    resetIdleTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
      
      if (idleTimer) {
        clearTimeout(idleTimer)
      }
    }
  }, [resetIdleTimer])

  // Set user online when component mounts
  useEffect(() => {
    updateStatus('online')
    
    return () => {
      updateStatus('offline')
    }
  }, [updateStatus])

  // Get online users count
  const getOnlineCount = useCallback(() => {
    return Array.from(onlineUsers.values()).filter(user => user.status === 'online').length
  }, [onlineUsers])

  // Get users by status
  const getUsersByStatus = useCallback((status: 'online' | 'idle' | 'offline') => {
    return Array.from(onlineUsers.values()).filter(user => user.status === status)
  }, [onlineUsers])

  return {
    onlineUsers: Array.from(onlineUsers.values()),
    onlineCount: getOnlineCount(),
    userStatus,
    getUsersByStatus,
    isUserOnline: (userId: string) => {
      const user = onlineUsers.get(userId)
      return user?.status === 'online'
    },
  }
}