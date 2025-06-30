'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-error/10 rounded-full">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            <Home size={20} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}