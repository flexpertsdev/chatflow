import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateMessageData {
  roomId: string
  content: string
  type?: 'text' | 'image' | 'system'
}

export function useCreateMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateMessageData) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate messages for this room
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.roomId] 
      })
      
      // Update room's last activity
      queryClient.invalidateQueries({ 
        queryKey: ['room', variables.roomId] 
      })
    },
  })
}