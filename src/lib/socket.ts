import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface SocketWithAuth extends Socket {
  userId?: string
  username?: string
}

interface Socket {
  id: string
  handshake: any
  rooms: Set<string>
  join: (room: string) => void
  leave: (room: string) => void
  emit: (event: string, ...args: any[]) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  disconnect: () => void
}

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer | null {
  return io
}

export function initializeSocket(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socket',
  })

  // Authentication middleware
  io.use(async (socket: SocketWithAuth, next) => {
    try {
      const req = socket.handshake as unknown as NextApiRequest
      const session = await getServerSession(req as any, null as any, authOptions)
      
      if (session?.user) {
        socket.userId = session.user.id
        socket.username = session.user.name || session.user.email || 'Anonymous'
        next()
      } else {
        next(new Error('Unauthorized'))
      }
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: SocketWithAuth) => {
    console.log(`User ${socket.username} connected (${socket.id})`)

    // Join user's personal room for DMs
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Handle room joining
    socket.on('join-room', (roomId: string) => {
      socket.join(`room:${roomId}`)
      
      // Notify others in room
      socket.to(`room:${roomId}`).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      })

      // Send current room members
      const roomSockets = io?.sockets.adapter.rooms.get(`room:${roomId}`)
      const members = Array.from(roomSockets || []).map(socketId => {
        const memberSocket = io?.sockets.sockets.get(socketId) as SocketWithAuth
        return {
          userId: memberSocket?.userId,
          username: memberSocket?.username,
          socketId,
        }
      })
      
      socket.emit('room-members', members)
    })

    // Handle leaving room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(`room:${roomId}`)
      
      socket.to(`room:${roomId}`).emit('user-left', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      })
    })

    // Handle sending messages
    socket.on('send-message', (data: {
      roomId: string
      message: string
      attachments?: any[]
    }) => {
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId: data.roomId,
        content: data.message,
        senderId: socket.userId,
        senderName: socket.username,
        attachments: data.attachments || [],
        timestamp: new Date(),
      }

      // Send to all users in room (including sender)
      io?.to(`room:${data.roomId}`).emit('new-message', messageData)
    })

    // Handle typing indicators
    socket.on('typing-start', (roomId: string) => {
      socket.to(`room:${roomId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
      })
    })

    socket.on('typing-stop', (roomId: string) => {
      socket.to(`room:${roomId}`).emit('user-stopped-typing', {
        userId: socket.userId,
      })
    })

    // Handle message reactions
    socket.on('add-reaction', (data: {
      roomId: string
      messageId: string
      emoji: string
    }) => {
      io?.to(`room:${data.roomId}`).emit('reaction-added', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: socket.userId,
        username: socket.username,
      })
    })

    // Handle presence updates
    socket.on('update-status', (status: 'online' | 'idle' | 'offline') => {
      // Get all rooms this user is in
      const rooms = Array.from(socket.rooms).filter(room => room.startsWith('room:'))
      
      rooms.forEach(room => {
        socket.to(room).emit('user-status-changed', {
          userId: socket.userId,
          status,
        })
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected (${socket.id})`)
      
      // Notify all rooms the user was in
      const rooms = Array.from(socket.rooms).filter(room => room.startsWith('room:'))
      
      rooms.forEach(room => {
        socket.to(room).emit('user-disconnected', {
          userId: socket.userId,
          username: socket.username,
        })
      })
    })

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error)
      socket.emit('error', { message: 'An error occurred' })
    })
  })

  return io
}