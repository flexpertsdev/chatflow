import { db } from './index'
import { users, rooms, roomMembers, messages } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Starting seed...')

  try {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const [user1, user2, user3] = await db.insert(users).values([
      {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash: hashedPassword,
        bio: 'Love chatting about tech!',
        emailVerified: true,
      },
      {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash: hashedPassword,
        bio: 'Gaming enthusiast',
        emailVerified: true,
      },
      {
        email: 'charlie@example.com',
        username: 'charlie',
        passwordHash: hashedPassword,
        bio: 'Study buddy',
        emailVerified: true,
      },
    ]).returning()

    console.log('✅ Created 3 test users')

    // Create public rooms
    const roomsData = [
      { name: 'Gaming Central', description: 'Talk about your favorite games', category: 'gaming' as const, ownerId: user1.id },
      { name: 'Music Lovers', description: 'Share and discover new music', category: 'other' as const, ownerId: user2.id },
      { name: 'Study Group', description: 'Focus and study together', category: 'study' as const, ownerId: user3.id },
      { name: 'Social Hub', description: 'General chat and hangout', category: 'social' as const, ownerId: user1.id },
      { name: 'Tech Talk', description: 'Discuss the latest in technology', category: 'tech' as const, ownerId: user2.id },
    ]

    const createdRooms = await db.insert(rooms).values(roomsData).returning()
    console.log('✅ Created 5 public rooms')

    // Add all users as members to all rooms
    const membershipData = []
    for (const room of createdRooms) {
      for (const user of [user1, user2, user3]) {
        membershipData.push({
          roomId: room.id,
          userId: user.id,
          role: room.ownerId === user.id ? 'owner' as const : 'member' as const,
        })
      }
    }

    await db.insert(roomMembers).values(membershipData)
    console.log('✅ Added users to rooms')

    // Add sample messages to each room
    const messageData = []
    const sampleMessages = [
      'Hey everyone! 👋',
      'Welcome to the room!',
      'How is everyone doing today?',
      'Great to be here!',
      'Looking forward to chatting with you all',
    ]

    for (const room of createdRooms) {
      for (let i = 0; i < sampleMessages.length; i++) {
        const user = [user1, user2, user3][i % 3]
        messageData.push({
          roomId: room.id,
          userId: user.id,
          content: sampleMessages[i],
          type: 'text' as const,
        })
      }
    }

    await db.insert(messages).values(messageData)
    console.log('✅ Added sample messages')

    console.log('🎉 Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed().then(() => process.exit(0))
}