# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Database commands
npm run db:generate    # Generate migrations
npm run db:push       # Push schema changes
npm run db:studio     # Open Drizzle Studio
```

## Architecture Overview

This is a **specification-driven** Discord-inspired chat application built with Next.js 14. The codebase follows a pattern where detailed specifications are embedded as comments, with TODO markers for implementation.

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth v5 (beta)
- **Real-time**: Socket.io
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Validation**: Zod with React Hook Form
- **Styling**: Tailwind CSS

### Key Architectural Patterns

1. **Specification-First Development**: Each file contains detailed specifications as comments. Look for `MOCKUP_ID` references that link to visual designs.

2. **Database Schema** (`src/lib/db/schema.ts`):
   - 7 relational tables with UUID primary keys
   - Role-based permissions (owner, moderator, member)
   - Soft deletes for messages
   - Proper indexes for performance

3. **App Router Structure**:
   - Auth routes: `/auth/login`, `/auth/register`
   - Chat routes: `/chat`, `/chat/[roomId]`, `/chat/create`
   - Dynamic routing for room IDs

4. **Component Organization**:
   - `src/components/chat/` - Chat-specific components
   - `src/components/ui/` - Reusable UI components
   - `src/components/layout/` - Layout components

5. **API Design** (`src/lib/api/chat.ts`):
   - RESTful endpoints with consistent error handling
   - Rate limiting strategies
   - WebSocket events for real-time features

6. **Design System**:
   - Warm purple primary (#8B5CF6) with coral accents (#FF6B6B)
   - Mobile-first with 16px base font (prevents iOS zoom)
   - Dark mode with true black for OLED
   - 44px minimum touch targets

### Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- OAuth providers (optional)
- File upload service credentials

### Working with This Codebase

1. **When implementing features**: Follow the existing specifications in comments. They define the expected behavior, UI, and integration points.

2. **Database changes**: Use Drizzle Kit commands to generate and push migrations. The schema is the source of truth.

3. **Real-time features**: Socket.io events are defined in the API specifications. Ensure client and server events match.

4. **Styling**: Use the established design system variables. Components should be mobile-first and follow the warm, friendly aesthetic.

5. **State management**: 
   - Server state: TanStack Query
   - Client state: Zustand stores
   - Forms: React Hook Form with Zod schemas

6. **Error handling**: Follow the consistent HTTP status codes (400, 401, 403, 404, 429) defined in the API specifications.