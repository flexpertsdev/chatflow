/**
 * LOGIN PAGE SPECIFICATION
 * 
 * Purpose: Authenticate existing users
 * 
 * FORM FIELDS:
 * - Email input (required, email validation)
 * - Password input (required, min 8 chars, show/hide toggle)
 * - Remember me checkbox
 * - Forgot password link
 * 
 * AUTHENTICATION METHODS:
 * - Email/password (primary)
 * - OAuth providers:
 *   - Continue with Google
 *   - Continue with GitHub
 *   - Continue with Discord
 * 
 * LAYOUT:
 * - Centered card (max-width: 400px)
 * - Logo at top
 * - Form fields
 * - OAuth buttons section
 * - Footer links: "New user? Sign up"
 * 
 * VALIDATION:
 * - Client-side: Check email format, password length
 * - Server-side: Verify credentials
 * - Show specific error messages
 * - Rate limiting after 5 failed attempts
 * 
 * FLOW:
 * 1. Enter credentials
 * 2. Click "Sign In"
 * 3. Show loading state
 * 4. Success: Redirect to /chat or return URL
 * 5. Error: Show error message, clear password
 * 
 * COMPONENTS USED:
 * - AuthCard (from @/components/auth/AuthCard)
 * - Input (from @/components/ui/Input)
 * - Button (from @/components/ui/Button)
 * - OAuthButtons (from @/components/auth/OAuthButtons)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Full width card with padding
 * - Desktop: Centered with background pattern
 * 
 * RELATIONSHIPS:
 * - Register: /auth/register
 * - Forgot: /auth/forgot-password
 * - Success: /chat or returnUrl
 * 
 * MOCKUP_ID: login-v2
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/chat')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/chat' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">ChatFlow</h1>
            <p className="text-text-secondary mt-2">Welcome back!</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="mr-2 rounded border-border"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary-hover"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* OAuth */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-tertiary">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full py-2 px-3 border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                className="w-full py-2 px-3 border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                GitHub
              </button>
              <button
                onClick={() => handleOAuthSignIn('discord')}
                className="w-full py-2 px-3 border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                Discord
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            New user?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}