/**
 * CHAT ROOMS LIST PAGE SPECIFICATION
 * 
 * Purpose: Browse, search, and join available chat rooms
 * 
 * LAYOUT:
 * - Header: "Chat Rooms" title + "Create Room" button
 * - Filters Bar: Categories dropdown, search input, view toggle (grid/list)
 * - Main Content: Room cards in responsive grid
 * - Empty State: "No rooms found" with suggestions
 * 
 * FEATURES:
 * - List all public rooms by default
 * - Filter by category (Gaming, Study, Social, Tech, etc.)
 * - Search by room name or description
 * - Sort by: Most Active, Newest, Alphabetical
 * - Show user's joined rooms at top (if authenticated)
 * - Real-time room member counts
 * 
 * DATA REQUIREMENTS:
 * - Fetch public rooms from API
 * - Pagination (20 rooms per page)
 * - Refresh member counts via WebSocket
 * 
 * COMPONENTS USED:
 * - RoomCard (from @/components/chat/RoomCard)
 * - CategoryFilter (from @/components/chat/CategoryFilter)
 * - SearchBar (from @/components/ui/SearchBar)
 * - LoadingGrid (from @/components/ui/LoadingGrid)
 * 
 * ROOM CARD DISPLAYS:
 * - Room name and description
 * - Category badge
 * - Member count with online indicator
 * - Last activity timestamp
 * - Join button (or "Joined" state)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: 1 column, compact cards
 * - Tablet: 2 columns
 * - Desktop: 3-4 columns
 * 
 * INTERACTIONS:
 * - Click room card to preview (modal on mobile, sidebar on desktop)
 * - Click join to enter room
 * - Hover shows last message preview
 * 
 * RELATIONSHIPS:
 * - Navigates to: /chat/[roomId] on join
 * - Links to: /chat/create for new room
 * - Parent: / (landing page)
 * 
 * MOCKUP_ID: room-list-v4
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, Grid3X3, List, ChevronDown } from 'lucide-react'
import { RoomCard, RoomCardSkeleton } from '@/components/chat/RoomCard'

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

const CATEGORIES = ['All', 'Gaming', 'Study', 'Social', 'Tech', 'Other']
const SORT_OPTIONS = [
  { value: 'active', label: 'Most Active' },
  { value: 'newest', label: 'Newest' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

export default function ChatRoomsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('active')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch rooms
  const fetchRooms = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        sort: sortBy,
      })

      const response = await fetch(`/api/rooms?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRooms(reset ? data.rooms : [...rooms, ...data.rooms])
        setHasMore(data.hasMore)
        setPage(reset ? 2 : page + 1)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [page, hasMore, searchQuery, selectedCategory, sortBy, rooms])

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchRooms(true)
  }, [searchQuery, selectedCategory, sortBy])

  // Handle room join
  const handleJoin = async (roomId: string) => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      })

      if (response.ok) {
        router.push(`/chat/${roomId}`)
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  // Handle room preview
  const handlePreview = (roomId: string) => {
    // In a real app, this might open a modal or sidebar
    router.push(`/chat/${roomId}`)
  }

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchQuery
      ? room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Chat Rooms</h1>
            {session && (
              <Link
                href="/chat/create"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Room</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-background border-b border-border sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms..."
                className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Desktop filters */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg"
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile filters dropdown */}
          {showFilters && (
            <div className="sm:hidden mt-3 flex flex-col gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-lg"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 rounded-lg border ${viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-surface border-border'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 rounded-lg border ${viewMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-surface border-border'}`}
                >
                  List View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && rooms.length === 0 ? (
          // Loading state
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <RoomCardSkeleton key={i} variant={viewMode} />
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            {/* Room cards */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={{
                    ...room,
                    lastActivity: new Date(room.updatedAt),
                  }}
                  variant={viewMode}
                  onJoin={handleJoin}
                  onPreview={handlePreview}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && !loading && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => fetchRooms()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Load More Rooms
                </button>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? `No rooms match "${searchQuery}"`
                : selectedCategory !== 'All'
                ? `No ${selectedCategory} rooms available`
                : 'No rooms available yet'}
            </p>
            {session ? (
              <Link
                href="/chat/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus size={20} />
                Create the First Room
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Sign In to Create a Room
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}