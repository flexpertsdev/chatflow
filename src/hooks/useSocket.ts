'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketOptions {
  autoConnect?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

interface SocketState {
  connected: boolean
  connecting: boolean
  error: string | null
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options

  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  })

  const listeners = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map())

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user || !autoConnect) return

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
      auth: {
        token: session.user.id,
      },
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      setState({ connected: true, connecting: false, error: null })
      console.log('Socket connected')
    })

    socket.on('connect_error', (error) => {
      setState({ connected: false, connecting: false, error: error.message })
      console.error('Socket connection error:', error)
    })

    socket.on('disconnect', (reason) => {
      setState({ connected: false, connecting: false, error: null })
      console.log('Socket disconnected:', reason)
    })

    socket.on('reconnecting', () => {
      setState(prev => ({ ...prev, connecting: true }))
    })

    // Re-attach all listeners
    listeners.current.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.on(event, callback)
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session, autoConnect, reconnectionAttempts, reconnectionDelay])

  // Emit event
  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args)
    } else {
      console.warn(`Cannot emit ${event}: Socket not connected`)
    }
  }, [])

  // Subscribe to event
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    // Add to listeners map
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set())
    }
    listeners.current.get(event)?.add(callback)

    // Add listener to socket if connected
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }

    // Return cleanup function
    return () => {
      listeners.current.get(event)?.delete(callback)
      if (socketRef.current) {
        socketRef.current.off(event, callback)
      }
    }
  }, [])

  // Remove event listener
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      listeners.current.get(event)?.delete(callback)
      socketRef.current?.off(event, callback)
    } else {
      listeners.current.delete(event)
      socketRef.current?.off(event)
    }
  }, [])

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    emit('join-room', roomId)
  }, [emit])

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    emit('leave-room', roomId)
  }, [emit])

  // Send message
  const sendMessage = useCallback((roomId: string, message: string, attachments?: any[]) => {
    emit('send-message', { roomId, message, attachments })
  }, [emit])

  // Typing indicators
  const startTyping = useCallback((roomId: string) => {
    emit('typing-start', roomId)
  }, [emit])

  const stopTyping = useCallback((roomId: string) => {
    emit('typing-stop', roomId)
  }, [emit])

  // Add reaction
  const addReaction = useCallback((roomId: string, messageId: string, emoji: string) => {
    emit('add-reaction', { roomId, messageId, emoji })
  }, [emit])

  // Update status
  const updateStatus = useCallback((status: 'online' | 'idle' | 'offline') => {
    emit('update-status', status)
  }, [emit])

  // Connect/disconnect manually
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect()
    }
  }, [])

  return {
    // State
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    
    // Core methods
    emit,
    on,
    off,
    connect,
    disconnect,
    
    // Chat methods
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    updateStatus,
    
    // Socket instance (for advanced usage)
    socket: socketRef.current,
  }
}