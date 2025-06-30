import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long before data is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Cache time: How long to keep unused data in cache
      gcTime: 1000 * 60 * 30, // 30 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
})