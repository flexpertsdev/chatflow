/**
 * CREATE ROOM PAGE SPECIFICATION
 * 
 * Purpose: Form to create a new chat room with settings
 * 
 * FORM SECTIONS:
 * 
 * 1. Basic Information
 *    - Room Name (required, 3-50 chars)
 *    - Description (optional, max 200 chars)
 *    - Category dropdown (Gaming, Study, Social, Tech, Other)
 * 
 * 2. Privacy Settings
 *    - Room Type: Public | Private (toggle)
 *    - If Public:
 *      - List in directory (checkbox)
 *      - Require approval to join (checkbox)
 *    - If Private:
 *      - Generate invite link after creation
 * 
 * 3. Room Settings
 *    - Max members (slider: 10-1000, default 100)
 *    - Allow image uploads (checkbox, default true)
 *    - Allow reactions (checkbox, default true)
 *    - Message history (Forever | 30 days | 7 days)
 * 
 * 4. Moderation
 *    - Enable word filter (checkbox)
 *    - Require email verification (checkbox)
 *    - New user restrictions (can't post for X minutes)
 * 
 * VALIDATION:
 * - Room name must be unique
 * - Check for inappropriate content
 * - Validate all fields before submit
 * - Show inline error messages
 * 
 * COMPONENTS USED:
 * - FormField (from @/components/ui/FormField)
 * - ToggleSwitch (from @/components/ui/ToggleSwitch)
 * - Slider (from @/components/ui/Slider)
 * - CategorySelect (from @/components/chat/CategorySelect)
 * 
 * FLOW:
 * 1. Fill form
 * 2. Click "Create Room"
 * 3. Show loading state
 * 4. On success: Redirect to new room
 * 5. On error: Show error message
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Single column, full width fields
 * - Desktop: Two column layout for some sections
 * 
 * RELATIONSHIPS:
 * - Parent: /chat (room list)
 * - Success: /chat/[newRoomId]
 * - Cancel: Back to /chat
 * 
 * MOCKUP_ID: create-room-v2
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CATEGORIES = ['Gaming', 'Study', 'Social', 'Tech', 'Other']

export default function CreateRoomPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    category: 'Social',
    
    // Privacy Settings
    isPublic: true,
    listInDirectory: true,
    requireApproval: false,
    
    // Room Settings
    maxMembers: 100,
    allowImages: true,
    allowReactions: true,
    messageHistory: 'Forever',
    
    // Moderation
    enableWordFilter: false,
    requireEmailVerification: false,
    newUserRestriction: 0,
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    setError(null)
    
    // Validate
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Room name must be at least 3 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Room name must be less than 50 characters'
    }
    
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit
    setLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          isPublic: formData.isPublic,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create room')
      }
      
      const { room } = await response.json()
      
      // Redirect to new room
      router.push(`/chat/${room.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // Redirect if not authenticated
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Sign in to create a room</h2>
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 hover:bg-surface rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Create New Room</h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="bg-background p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              {/* Room Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Room Name <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 bg-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-error' : 'border-border'
                  }`}
                  placeholder="e.g., Study Group, Gaming Squad"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-sm text-error mt-1">{errors.name}</p>
                )}
                <p className="text-sm text-text-tertiary mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 bg-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    errors.description ? 'border-error' : 'border-border'
                  }`}
                  placeholder="What's this room about?"
                  rows={3}
                  maxLength={200}
                />
                {errors.description && (
                  <p className="text-sm text-error mt-1">{errors.description}</p>
                )}
                <p className="text-sm text-text-tertiary mt-1">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-background p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              {/* Room Type */}
              <div>
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Room Type</div>
                    <div className="text-sm text-text-secondary">
                      {formData.isPublic ? 'Anyone can join this room' : 'Invite-only room'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPublic ? 'bg-primary' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Public room options */}
              {formData.isPublic && (
                <>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.listInDirectory}
                        onChange={(e) => setFormData({ ...formData, listInDirectory: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium">List in directory</div>
                        <div className="text-sm text-text-secondary">Show this room in public room list</div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.requireApproval}
                        onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <div>
                        <div className="font-medium">Require approval to join</div>
                        <div className="text-sm text-text-secondary">Moderators must approve new members</div>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Room Settings */}
          <section className="bg-background p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Room Settings</h2>
            <div className="space-y-4">
              {/* Max members */}
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium mb-1">
                  Maximum Members: {formData.maxMembers}
                </label>
                <input
                  id="maxMembers"
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-1">
                  <span>10</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.allowImages}
                    onChange={(e) => setFormData({ ...formData, allowImages: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="font-medium">Allow image uploads</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.allowReactions}
                    onChange={(e) => setFormData({ ...formData, allowReactions: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="font-medium">Allow message reactions</span>
                </label>
              </div>

              {/* Message history */}
              <div>
                <label htmlFor="messageHistory" className="block text-sm font-medium mb-1">
                  Message History
                </label>
                <select
                  id="messageHistory"
                  value={formData.messageHistory}
                  onChange={(e) => setFormData({ ...formData, messageHistory: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Forever">Keep forever</option>
                  <option value="30 days">30 days</option>
                  <option value="7 days">7 days</option>
                </select>
              </div>
            </div>
          </section>

          {/* Error message */}
          {error && (
            <div className="bg-error/10 border border-error text-error p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </button>
            <Link
              href="/chat"
              className="px-6 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}