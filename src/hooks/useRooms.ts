import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/stores/useAppStore'

interface Room {
  id: string
  name: string
  description?: string
  category: string
  memberCount: number
  onlineCount: number
  updatedAt: string
  isPublic: boolean
  hasJoined: boolean
  imageUrl?: string
}

interface RoomsResponse {
  rooms: Room[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface RoomFilters {
  search?: string
  category?: string
  sort?: 'active' | 'newest' | 'alphabetical'
  page?: number
  limit?: number
}

// Fetch rooms list
export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 20).toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && filters.category !== 'All' && { category: filters.category }),
        ...(filters.sort && { sort: filters.sort }),
      })
      
      const response = await fetch(`/api/rooms?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }
      
      return response.json() as Promise<RoomsResponse>
    },
  })
}

// Fetch single room
export function useRoom(roomId: string | null) {
  const setActiveRoom = useAppStore((state) => state.setActiveRoom)
  const addRecentRoom = useAppStore((state) => state.addRecentRoom)
  
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      if (!roomId) return null
      
      const response = await fetch(`/api/rooms/${roomId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch room')
      }
      
      const data = await response.json()
      
      // Update store
      setActiveRoom(roomId)
      addRecentRoom(roomId)
      
      return data.room as Room
    },
    enabled: !!roomId,
  })
}

// Create room mutation
export function useCreateRoom() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      category: string
      isPublic: boolean
    }) => {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create room')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate rooms list
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

// Join room mutation
export function useJoinRoom() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join room')
      }
      
      return response.json()
    },
    onSuccess: (_, roomId) => {
      // Invalidate room and rooms list
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

// Popular rooms
export function usePopularRooms() {
  return useQuery({
    queryKey: ['rooms', 'popular'],
    queryFn: async () => {
      const response = await fetch('/api/rooms/popular')
      if (!response.ok) {
        throw new Error('Failed to fetch popular rooms')
      }
      
      const data = await response.json()
      return data.rooms as Room[]
    },
  })
}