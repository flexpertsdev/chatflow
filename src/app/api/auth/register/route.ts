import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1)

    if (existingUser.length > 0) {
      if (existingUser[0].email === email) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: hashedPassword,
      })
      .returning()

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: newUser[0].id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}