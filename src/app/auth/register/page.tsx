/**
 * REGISTER PAGE SPECIFICATION
 * 
 * Purpose: Create new user accounts
 * 
 * FORM FIELDS:
 * - Username (required, 3-20 chars, alphanumeric + underscore)
 * - Email (required, email validation, check if exists)
 * - Password (required, min 8 chars, strength indicator)
 * - Confirm Password (required, must match)
 * - Terms checkbox (required, link to terms)
 * 
 * PASSWORD REQUIREMENTS:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - Show strength: Weak | Fair | Good | Strong
 * 
 * LAYOUT:
 * - Same as login page structure
 * - Progress indicator for multi-step (optional)
 * 
 * VALIDATION:
 * - Real-time username availability check
 * - Email uniqueness check
 * - Password strength feedback
 * - Match confirmation
 * 
 * FLOW:
 * 1. Fill registration form
 * 2. Accept terms
 * 3. Click "Create Account"
 * 4. Email verification sent
 * 5. Redirect to /auth/verify-email
 * 
 * COMPONENTS USED:
 * - AuthCard (from @/components/auth/AuthCard)
 * - Input (from @/components/ui/Input)
 * - PasswordStrength (from @/components/auth/PasswordStrength)
 * - Checkbox (from @/components/ui/Checkbox)
 * 
 * RESPONSIVE BEHAVIOR:
 * - Same as login page
 * 
 * RELATIONSHIPS:
 * - Login: /auth/login
 * - Success: /auth/verify-email
 * - Terms: /terms (new tab)
 * 
 * MOCKUP_ID: register-v2
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    return { strength, label: labels[strength] }
  }

  const { strength, label } = getPasswordStrength()

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      router.push('/auth/verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">ChatFlow</h1>
            <p className="text-text-secondary mt-2">Create your account</p>
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
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-error">{errors.username.message}</p>
              )}
            </div>

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
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= strength
                            ? strength === 1
                              ? 'bg-error'
                              : strength === 2
                              ? 'bg-warning'
                              : strength === 3
                              ? 'bg-info'
                              : 'bg-success'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary">{label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-start">
                <input
                  {...register('terms')}
                  type="checkbox"
                  className="mr-2 mt-1 rounded border-border"
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:text-primary-hover"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:text-primary-hover"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-error">{errors.terms.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}