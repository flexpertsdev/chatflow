/**
 * ROOT LAYOUT SPECIFICATION
 * 
 * Purpose: Application shell providing consistent structure across all pages
 * 
 * FEATURES:
 * - Global navigation header
 * - Authentication state management
 * - Theme provider (light/dark mode)
 * - Toast notifications
 * - WebSocket connection for real-time features
 * 
 * LAYOUT STRUCTURE:
 * - Fixed header with nav (64px height)
 * - Main content area (flex-1)
 * - Mobile-responsive navigation
 * 
 * COMPONENTS USED:
 * - Header (from @/components/layout/Header)
 * - ThemeProvider (from @/components/providers/ThemeProvider)
 * - Toaster (from @/components/ui/Toaster)
 * - AuthProvider (from @/components/providers/AuthProvider)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Horizontal navigation in header
 * - Mobile: Hamburger menu with slide-out drawer
 * 
 * PERFORMANCE:
 * - Font optimization with next/font
 * - CSS modules for scoped styles
 * - Lazy load heavy components
 * 
 * MOCKUP_ID: root-layout-v2
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from '@/components/ui/Toaster'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatFlow - Simple Group Chat',
  description: 'Discord-inspired chat application built with Next.js',
  keywords: ['chat', 'group chat', 'real-time', 'messaging', 'community'],
  authors: [{ name: 'ChatFlow Team' }],
  creator: 'ChatFlow',
  publisher: 'ChatFlow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chatflow.app',
    siteName: 'ChatFlow',
    title: 'ChatFlow - Simple Group Chat',
    description: 'Join communities and chat in real-time with ChatFlow',
    images: [
      {
        url: 'https://chatflow.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChatFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatFlow - Simple Group Chat',
    description: 'Join communities and chat in real-time with ChatFlow',
    images: ['https://chatflow.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <OfflineIndicator />
          <div className="min-h-screen bg-background text-text-primary">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}