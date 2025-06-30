# ChatFlow - Real-Time Group Chat Application

## Project Overview

ChatFlow is a Discord-inspired group chat application built through our specification-driven development platform. This project demonstrates how natural language requirements can be transformed into a production-ready application.

## Origin Story

This project began with a simple request: "I want to build a chat app like Discord but simpler". Through iterative conversations and visual design tools, the specifications were refined into the comprehensive application structure you see here.

## Features

### Core Functionality
- **Real-time messaging** with WebSocket support
- **Public and private rooms** with categories
- **Image sharing** with preview and lightbox
- **Message reactions** with emoji picker
- **User presence** and typing indicators
- **Room moderation** tools

### User Experience
- **Responsive design** - works on all devices
- **Dark/light themes** - user preference
- **Accessible** - keyboard navigation and screen readers
- **Fast** - optimized performance

## Project Structure

```
src/
├── app/          # Next.js 13+ app directory
├── components/   # Reusable UI components
├── lib/          # Business logic and utilities
├── hooks/        # Custom React hooks
└── types/        # TypeScript definitions
```

## Development Process

This project was created using our specification-driven approach:

1. **Natural Language** → Requirements extracted via chat
2. **Specifications** → Embedded as comments in code
3. **Visual Design** → Interactive mockups for refinement
4. **AI Implementation** → Automated code generation

## Key Technologies

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.io
- **Authentication**: NextAuth.js
- **File Storage**: Uploadthing

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Documentation

- `/docs/features/` - Feature specifications
- `/docs/conversations/` - Development history
- `/docs/decisions/` - Architecture decisions

## Mockup References

Each component and page includes a `MOCKUP_ID` that links to the visual design used during development. These can be viewed in `/public/mockups/`.

## Contributing

This is an example project demonstrating our development platform. For questions about the approach, see the main boilerplate documentation.

## License

MIT