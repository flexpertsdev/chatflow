# Automated Build Plan for ChatFlow

## Overview
This document guides the AI through building the ChatFlow application from specifications to working code.

## Pre-Build Checklist
- [ ] All specification comments are in place
- [ ] Mockup IDs are referenced
- [ ] Database schema is defined
- [ ] API endpoints are specified
- [ ] Component relationships are documented

## Build Phases

### Phase 1: Project Setup (30 min)
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Install core dependencies
npm install @tanstack/react-query socket.io-client zustand
npm install drizzle-orm postgres @neondatabase/serverless
npm install next-auth @auth/drizzle-adapter
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react date-fns clsx tailwind-merge

# Install dev dependencies
npm install -D @types/node drizzle-kit dotenv-cli
npm install -D prettier eslint-config-prettier
```

### Phase 2: Infrastructure Setup (45 min)

1. **Environment Configuration**
   - Copy `.env.example` to `.env.local`
   - Set up database connection string
   - Configure authentication secrets
   - Set up file upload service

2. **Database Setup**
   - Implement schema from `/src/lib/db/schema.ts`
   - Create migration files
   - Run initial migrations
   - Seed with example data

3. **Authentication Setup**
   - Configure NextAuth with database adapter
   - Set up OAuth providers
   - Create auth middleware

### Phase 3: Core Components (2 hours)

Build in this order to satisfy dependencies:

1. **UI Components** (`/src/components/ui/`)
   - Button, Input, Card, Modal
   - Based on existing design system

2. **Layout Components** (`/src/components/layout/`)
   - Header with navigation
   - AppLayout wrapper
   - Responsive sidebar

3. **Auth Components** (`/src/components/auth/`)
   - LoginForm, RegisterForm
   - AuthCard wrapper
   - OAuthButtons

4. **Chat Components** (`/src/components/chat/`)
   - MessageBubble (with all variants)
   - ChatInput (with emoji picker)
   - MemberList (with presence)
   - RoomCard (grid and list variants)

### Phase 4: Page Implementation (2 hours)

Implement pages following the specifications:

1. **Authentication Pages**
   - `/auth/login` - Login form with OAuth
   - `/auth/register` - Registration with validation

2. **Landing Page**
   - `/` - Hero, features, room preview

3. **Chat Pages**
   - `/chat` - Room list with filters
   - `/chat/[roomId]` - Real-time chat interface
   - `/chat/create` - Room creation form
   - `/chat/settings` - Room management

### Phase 5: API & Real-time (1.5 hours)

1. **API Routes**
   - Implement all endpoints from `/src/lib/api/chat.ts`
   - Add authentication checks
   - Implement rate limiting

2. **WebSocket Setup**
   - Socket.io server configuration
   - Real-time event handlers
   - Presence management
   - Typing indicators

### Phase 6: State Management (1 hour)

1. **React Query Setup**
   - Configure providers
   - Set up queries and mutations
   - Implement optimistic updates

2. **Zustand Stores**
   - User preferences
   - UI state (sidebar, modals)
   - Draft messages

### Phase 7: Testing & Validation (1 hour)

1. **Functionality Tests**
   - User can register/login
   - Create and join rooms
   - Send messages with images
   - Real-time updates work
   - Responsive on all devices

2. **Performance Checks**
   - Lighthouse scores
   - Bundle size analysis
   - Database query optimization

3. **Accessibility Audit**
   - Keyboard navigation
   - Screen reader testing
   - Color contrast verification

## Implementation Guidelines

### Code Quality Standards
- Follow specifications in comment blocks
- Use TypeScript strictly
- Implement error boundaries
- Add loading states
- Handle edge cases

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

### File Organization
```
component-name/
├── index.tsx          # Main component
├── types.ts           # TypeScript types
├── hooks.ts           # Custom hooks
└── styles.module.css  # If needed
```

### Performance Optimizations
- Lazy load routes
- Virtualize long lists
- Optimize images
- Debounce user input
- Cache API responses

## Success Criteria

The build is complete when:
- [ ] All pages load without errors
- [ ] Real-time chat works smoothly
- [ ] Responsive design functions properly
- [ ] Authentication flow is complete
- [ ] Database operations are efficient
- [ ] No TypeScript errors
- [ ] All specifications are implemented
- [ ] Mockups match implementation

## Post-Build Tasks

1. Update `/docs/CURRENT_STATE.md` with completion status
2. Document any deviations from specifications
3. List known issues or improvements
4. Update README with setup instructions

## Time Estimate

Total build time: ~8 hours
- Setup: 1.5 hours
- Components: 2 hours  
- Pages: 2 hours
- Backend: 1.5 hours
- Testing: 1 hour

## Notes for AI

- Read each specification comment before implementing
- Check relationships between components
- Maintain consistency with mockup IDs
- Ask for clarification if specifications conflict
- Prioritize working features over perfect code
- Update progress markers as you complete sections