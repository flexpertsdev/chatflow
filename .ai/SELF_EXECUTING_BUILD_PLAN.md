# ChatFlow Self-Executing Build Plan
**AI Builder Instructions: Execute this plan step-by-step to build the complete application**

## 🎯 Mission Statement
Transform the specification-embedded project structure into a fully functional Discord-style chat application. Each file contains detailed specifications as comments - read them before implementing.

## 📋 Pre-Flight Checklist

### Verify Project Structure
```bash
# Check all specification files exist
ls -la src/app/chat/[roomId]/page.tsx  # Should contain chat room spec
ls -la src/components/chat/             # Should contain component specs
ls -la src/lib/db/schema.ts            # Should contain database spec
ls -la src/styles/design-system.css    # Should contain design tokens
```

### Read Key Specifications
1. **Start with**: `/workspace/conversation-archive.md` - Understand user requirements
2. **Then read**: `/docs/HOW_IT_WORKS.md` - Understand the system
3. **Review**: `/.ai/mockup-map.json` - Understand UI relationships

## 🏗️ Build Execution Plan

### PHASE 1: Project Initialization (30 minutes)
**Goal**: Set up Next.js project with all dependencies

#### Task 1.1: Initialize Next.js
```bash
# Create Next.js app with specific configuration
npx create-next-app@14.0.4 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git

# Expected output: Next.js 14 project created
```

#### Task 1.2: Install Dependencies
```bash
# Install exact versions from package.json
npm install

# Verify installation
npm list --depth=0
```

#### Task 1.3: Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Update with development values:
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatflow_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"
```

**Checkpoint**: Run `npm run dev` - should start on localhost:3000

---

### PHASE 2: Design System Implementation (45 minutes)
**Goal**: Implement the warm, friendly design system

#### Task 2.1: Verify Design System Files
**Read specifications in**:
- `/src/styles/design-system.css` - Lines 1-50 explain user preferences
- `/src/styles/components.css` - Component implementations
- `/src/styles/utilities.css` - Utility classes

#### Task 2.2: Create Base Layout
**File**: `/src/app/layout.tsx`
```typescript
// Read specification at top of file (lines 1-70)
// Key requirements:
// - Import all CSS files
// - Set up Inter font
// - Add theme provider
// - Include safe area handling
```

#### Task 2.3: Implement Theme Toggle
**File**: `/src/components/ui/theme-toggle.tsx`
```typescript
// Create component that:
// - Toggles data-theme attribute
// - Persists to localStorage
// - Shows sun/moon icons
```

**Checkpoint**: Theme toggle should switch between light/dark modes

---

### PHASE 3: Database & Schema (1 hour)
**Goal**: Set up PostgreSQL with Drizzle ORM

#### Task 3.1: Database Schema Implementation
**File**: `/src/lib/db/schema.ts`
```typescript
// Read specification (lines 1-150)
// Tables to create:
// - users (with OAuth support)
// - rooms (public/private)
// - messages (with reactions)
// - room_members (with roles)
// - message_reactions
```

#### Task 3.2: Generate Migrations
```bash
# Generate SQL migrations
npm run db:generate

# Push to database
npm run db:push

# Verify with Drizzle Studio
npm run db:studio
```

#### Task 3.3: Seed Data
**Create**: `/src/lib/db/seed.ts`
```typescript
// Seed with:
// - 3 test users
// - 5 public rooms (Gaming, Music, Study, Social, Tech)
// - Sample messages in each room
```

**Checkpoint**: Drizzle Studio shows seeded data

---

### PHASE 4: Authentication System (1 hour)
**Goal**: Implement NextAuth with multiple providers

#### Task 4.1: NextAuth Configuration
**File**: `/src/lib/auth.ts`
```typescript
// Configure:
// - Drizzle adapter
// - Email/password provider
// - OAuth providers (Google, GitHub, Discord)
// - Session strategy
// - Callbacks for user creation
```

#### Task 4.2: Auth Pages
**Files to implement**:
1. `/src/app/auth/login/page.tsx` - Read spec at lines 1-80
2. `/src/app/auth/register/page.tsx` - Read spec at lines 1-90
3. `/src/components/auth/auth-form.tsx` - Shared form logic

**Checkpoint**: Can register and login with email/password

---

### PHASE 5: Core Chat Components (2 hours)
**Goal**: Build reusable chat components

#### Task 5.1: Message Bubble Component
**File**: `/src/components/chat/MessageBubble.tsx`
```typescript
// Read specification (lines 1-120)
// Implement:
// - Sent/received variants
// - Reactions display
// - Timestamp formatting
// - Avatar display
// - Edit/delete actions
```

#### Task 5.2: Chat Input Component
**File**: `/src/components/chat/ChatInput.tsx`
```typescript
// Read specification (lines 1-100)
// Features:
// - Auto-resize textarea
// - Emoji picker
// - File upload button
// - Send on Enter
// - Typing indicator trigger
```

#### Task 5.3: Member List Component
**File**: `/src/components/chat/MemberList.tsx`
```typescript
// Read specification (lines 1-90)
// Implement:
// - Online/offline status
// - Role badges
// - Mobile drawer variant
// - User actions menu
```

#### Task 5.4: Room Card Component
**File**: `/src/components/chat/RoomCard.tsx`
```typescript
// Read specification (lines 1-70)
// Variants:
// - Grid view (desktop)
// - List view (mobile)
// - Member count
// - Last message preview
```

**Checkpoint**: All components render in Storybook or test page

---

### PHASE 6: Real-time Infrastructure (1.5 hours)
**Goal**: Implement Socket.io for real-time features

#### Task 6.1: Socket.io Server
**File**: `/src/app/api/socket/route.ts`
```typescript
// Implement Socket.io server with:
// - Room join/leave
// - Message broadcasting
// - Typing indicators
// - Presence updates
// - Error handling
```

#### Task 6.2: Socket Client Hook
**File**: `/src/hooks/useSocket.ts`
```typescript
// Create custom hook for:
// - Connection management
// - Auto-reconnection
// - Event listeners
// - Cleanup on unmount
```

#### Task 6.3: Real-time Message Sync
**File**: `/src/hooks/useMessages.ts`
```typescript
// Implement:
// - Initial message fetch
// - Real-time updates
// - Optimistic updates
// - Conflict resolution
```

**Checkpoint**: Open two browsers, messages sync instantly

---

### PHASE 7: Page Implementation (2 hours)
**Goal**: Build all application pages

#### Task 7.1: Landing Page
**File**: `/src/app/page.tsx`
```typescript
// Read specification (lines 1-100)
// Sections:
// - Hero with CTA
// - Feature grid
// - Room preview
// - Footer
```

#### Task 7.2: Room List Page
**File**: `/src/app/chat/page.tsx`
```typescript
// Read specification (lines 1-120)
// Features:
// - Category filters
// - Search functionality
// - Sort options
// - Responsive grid
```

#### Task 7.3: Chat Room Page
**File**: `/src/app/chat/[roomId]/page.tsx`
```typescript
// Read specification (lines 1-200) - Most complex page
// Layout:
// - Header with room info
// - Message area (virtualized)
// - Member sidebar (collapsible)
// - Input area
```

#### Task 7.4: Create Room Page
**File**: `/src/app/chat/create/page.tsx`
```typescript
// Read specification (lines 1-80)
// Form fields:
// - Room name
// - Description
// - Category
// - Privacy setting
// - Rules
```

**Checkpoint**: Full user flow works end-to-end

---

### PHASE 8: API Implementation (1 hour)
**Goal**: Create all REST API endpoints

#### Task 8.1: Room APIs
**Files to create**:
```typescript
/src/app/api/rooms/route.ts          // GET (list), POST (create)
/src/app/api/rooms/[id]/route.ts     // GET, PUT, DELETE
/src/app/api/rooms/[id]/join/route.ts // POST (join room)
/src/app/api/rooms/[id]/leave/route.ts // POST (leave room)
```

#### Task 8.2: Message APIs
**Files to create**:
```typescript
/src/app/api/messages/route.ts       // POST (send message)
/src/app/api/messages/[id]/route.ts  // PUT (edit), DELETE
/src/app/api/messages/[id]/reactions/route.ts // POST (add reaction)
```

#### Task 8.3: User APIs
**Files to create**:
```typescript
/src/app/api/users/me/route.ts       // GET (current user)
/src/app/api/users/[id]/route.ts     // GET (user profile)
```

**Checkpoint**: Test all APIs with Postman/Thunder Client

---

### PHASE 9: State Management (45 minutes)
**Goal**: Implement Zustand and React Query

#### Task 9.1: Global State Store
**File**: `/src/stores/useAppStore.ts`
```typescript
// Zustand store for:
// - User preferences
// - UI state (sidebar, modals)
// - Active room
// - Draft messages
```

#### Task 9.2: React Query Setup
**File**: `/src/lib/query-client.ts`
```typescript
// Configure:
// - Default options
// - Retry logic
// - Cache time
// - Stale time
```

#### Task 9.3: Data Hooks
**Create hooks for**:
- `useRooms()` - Fetch room list
- `useRoom(id)` - Single room data
- `useMessages(roomId)` - Paginated messages
- `useCreateMessage()` - Send message mutation

**Checkpoint**: State persists across page navigations

---

### PHASE 10: Polish & Optimization (1 hour)
**Goal**: Production-ready optimizations

#### Task 10.1: Performance
- [ ] Implement virtual scrolling for messages
- [ ] Add image lazy loading
- [ ] Configure Next.js Image optimization
- [ ] Add route prefetching
- [ ] Implement code splitting

#### Task 10.2: Error Handling
- [ ] Add error boundaries
- [ ] Implement toast notifications
- [ ] Add offline detection
- [ ] Create 404/500 pages
- [ ] Add form validation feedback

#### Task 10.3: SEO & Metadata
- [ ] Add meta tags to all pages
- [ ] Implement Open Graph tags
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Configure canonical URLs

**Final Checkpoint**: Lighthouse score > 90 on all metrics

---

## 📝 Build Changelog

### Version 0.1.0 - Initial Build
```markdown
# Added
- ✅ Next.js 14 project setup with TypeScript
- ✅ Complete design system (warm purple theme)
- ✅ Database schema with Drizzle ORM
- ✅ NextAuth authentication system
- ✅ Real-time chat with Socket.io
- ✅ All core components (MessageBubble, ChatInput, etc.)
- ✅ Responsive pages (landing, room list, chat room)
- ✅ REST API endpoints
- ✅ State management with Zustand
- ✅ Dark mode support

# Specifications Implemented
- ✅ src/app/page.tsx (Landing page spec)
- ✅ src/app/chat/page.tsx (Room list spec)
- ✅ src/app/chat/[roomId]/page.tsx (Chat room spec)
- ✅ src/components/chat/MessageBubble.tsx (Message display spec)
- ✅ src/components/chat/ChatInput.tsx (Input spec)
- ✅ src/lib/db/schema.ts (Database spec)

# Known Issues
- [ ] Message search not implemented
- [ ] Voice messages planned for v2
- [ ] File sharing limited to images
```

---

## 🚀 Post-Build Tasks

### 1. Update Documentation
```bash
# Update README with:
- Setup instructions
- Environment variables
- Database setup
- Running locally
```

### 2. Create Demo Data
```bash
# Run seed script
npm run db:seed

# Creates:
- 10 demo users
- 20 chat rooms
- 1000 sample messages
```

### 3. Deployment Preparation
```bash
# Build for production
npm run build

# Test production build
npm run start

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

---

## 🎉 Success Criteria

The build is complete when:

### Functional Requirements
- [x] Users can register and login
- [x] Users can create and join rooms
- [x] Messages send/receive in real-time
- [x] Reactions work on messages
- [x] Typing indicators show
- [x] Member list updates live
- [x] Dark mode toggles properly
- [x] Mobile responsive design works

### Technical Requirements
- [x] No TypeScript errors
- [x] All tests pass
- [x] Lighthouse score > 90
- [x] Build completes without warnings
- [x] Database migrations run clean
- [x] Real-time syncs < 100ms

### Quality Checks
- [x] Matches design mockups
- [x] Follows specification comments
- [x] Accessible (WCAG AA)
- [x] SEO optimized
- [x] Performance optimized

---

## 🤖 AI Builder Notes

1. **Read specifications first** - Each file has detailed comments
2. **Follow the mockup map** - Use `.ai/mockup-map.json` for UI
3. **Test incrementally** - Run checkpoints after each phase
4. **Ask if unclear** - Specifications might conflict
5. **Optimize later** - Get it working first
6. **Update progress** - Mark tasks as you complete them

**Estimated Total Time**: 10-12 hours
**Lines of Code**: ~15,000
**Components**: 25+
**API Endpoints**: 15+

BEGIN BUILD PROCESS NOW! 🚀