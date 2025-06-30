import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  notificationsEnabled: boolean
  compactMode: boolean
}

interface UIState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  activeModal: string | null
  activeRoom: string | null
}

interface DraftMessage {
  roomId: string
  content: string
  timestamp: number
}

interface AppStore {
  // User preferences
  preferences: UserPreferences
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  
  // UI state
  ui: UIState
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  setActiveRoom: (roomId: string | null) => void
  
  // Draft messages
  drafts: Record<string, DraftMessage>
  setDraft: (roomId: string, content: string) => void
  clearDraft: (roomId: string) => void
  getDraft: (roomId: string) => string
  
  // Recent rooms
  recentRooms: string[]
  addRecentRoom: (roomId: string) => void
  
  // Notifications
  unreadCounts: Record<string, number>
  setUnreadCount: (roomId: string, count: number) => void
  incrementUnread: (roomId: string) => void
  clearUnread: (roomId: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User preferences
      preferences: {
        theme: 'system',
        soundEnabled: true,
        notificationsEnabled: true,
        compactMode: false,
      },
      setPreference: (key, value) => set((state) => ({
        preferences: {
          ...state.preferences,
          [key]: value,
        },
      })),
      
      // UI state
      ui: {
        sidebarOpen: true,
        mobileMenuOpen: false,
        activeModal: null,
        activeRoom: null,
      },
      setSidebarOpen: (open) => set((state) => ({
        ui: { ...state.ui, sidebarOpen: open },
      })),
      setMobileMenuOpen: (open) => set((state) => ({
        ui: { ...state.ui, mobileMenuOpen: open },
      })),
      setActiveModal: (modal) => set((state) => ({
        ui: { ...state.ui, activeModal: modal },
      })),
      setActiveRoom: (roomId) => set((state) => ({
        ui: { ...state.ui, activeRoom: roomId },
      })),
      
      // Draft messages
      drafts: {},
      setDraft: (roomId, content) => set((state) => ({
        drafts: {
          ...state.drafts,
          [roomId]: {
            roomId,
            content,
            timestamp: Date.now(),
          },
        },
      })),
      clearDraft: (roomId) => set((state) => {
        const { [roomId]: _, ...rest } = state.drafts
        return { drafts: rest }
      }),
      getDraft: (roomId) => {
        const draft = get().drafts[roomId]
        return draft?.content || ''
      },
      
      // Recent rooms
      recentRooms: [],
      addRecentRoom: (roomId) => set((state) => {
        const filtered = state.recentRooms.filter(id => id !== roomId)
        return {
          recentRooms: [roomId, ...filtered].slice(0, 10), // Keep last 10
        }
      }),
      
      // Notifications
      unreadCounts: {},
      setUnreadCount: (roomId, count) => set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [roomId]: count,
        },
      })),
      incrementUnread: (roomId) => set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [roomId]: (state.unreadCounts[roomId] || 0) + 1,
        },
      })),
      clearUnread: (roomId) => set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [roomId]: 0,
        },
      })),
    }),
    {
      name: 'chatflow-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        drafts: state.drafts,
        recentRooms: state.recentRooms,
      }),
    }
  )
)