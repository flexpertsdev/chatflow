/**
 * DATABASE SCHEMA SPECIFICATION
 * 
 * Purpose: Define all database tables and relationships for ChatFlow
 * Database: PostgreSQL with Drizzle ORM
 * 
 * TABLES:
 * 
 * 1. users
 *    - id: uuid (primary key)
 *    - email: string (unique, not null)
 *    - username: string (unique, not null, 3-20 chars)
 *    - passwordHash: string (not null)
 *    - avatar: string (nullable, URL)
 *    - bio: string (nullable, max 200 chars)
 *    - emailVerified: boolean (default false)
 *    - createdAt: timestamp (default now)
 *    - updatedAt: timestamp (auto update)
 *    - lastSeenAt: timestamp (nullable)
 * 
 * 2. rooms
 *    - id: uuid (primary key)
 *    - name: string (not null, 3-50 chars)
 *    - description: string (nullable, max 200 chars)
 *    - category: enum ('gaming', 'study', 'social', 'tech', 'other')
 *    - isPublic: boolean (default true)
 *    - imageUrl: string (nullable)
 *    - maxMembers: integer (default 100)
 *    - ownerId: uuid (foreign key → users.id)
 *    - createdAt: timestamp (default now)
 *    - updatedAt: timestamp (auto update)
 *    - messageRetention: enum ('forever', '30days', '7days')
 * 
 * 3. room_members
 *    - id: uuid (primary key)
 *    - roomId: uuid (foreign key → rooms.id, cascade delete)
 *    - userId: uuid (foreign key → users.id)
 *    - role: enum ('owner', 'moderator', 'member')
 *    - joinedAt: timestamp (default now)
 *    - mutedUntil: timestamp (nullable)
 *    - unique: [roomId, userId]
 * 
 * 4. messages
 *    - id: uuid (primary key)
 *    - roomId: uuid (foreign key → rooms.id, cascade delete)
 *    - userId: uuid (foreign key → users.id)
 *    - content: text (not null)
 *    - type: enum ('text', 'image', 'system')
 *    - createdAt: timestamp (default now)
 *    - editedAt: timestamp (nullable)
 *    - deletedAt: timestamp (nullable, soft delete)
 *    - replyToId: uuid (nullable, self reference)
 * 
 * 5. message_reactions
 *    - id: uuid (primary key)
 *    - messageId: uuid (foreign key → messages.id, cascade delete)
 *    - userId: uuid (foreign key → users.id)
 *    - emoji: string (not null)
 *    - createdAt: timestamp (default now)
 *    - unique: [messageId, userId, emoji]
 * 
 * 6. attachments
 *    - id: uuid (primary key)
 *    - messageId: uuid (foreign key → messages.id, cascade delete)
 *    - type: enum ('image', 'file')
 *    - url: string (not null)
 *    - filename: string (not null)
 *    - size: integer (bytes)
 *    - mimeType: string
 *    - createdAt: timestamp (default now)
 * 
 * 7. room_bans
 *    - id: uuid (primary key)
 *    - roomId: uuid (foreign key → rooms.id, cascade delete)
 *    - userId: uuid (foreign key → users.id)
 *    - bannedBy: uuid (foreign key → users.id)
 *    - reason: string (nullable)
 *    - bannedAt: timestamp (default now)
 *    - expiresAt: timestamp (nullable)
 * 
 * INDEXES:
 * - users: email, username
 * - rooms: isPublic + category (for discovery)
 * - room_members: roomId, userId
 * - messages: roomId + createdAt (for pagination)
 * - messages: userId (for user history)
 * - message_reactions: messageId
 * 
 * RELATIONSHIPS:
 * - User → many RoomMembers → many Rooms
 * - Room → many Messages
 * - User → many Messages
 * - Message → many Reactions
 * - Message → many Attachments
 * - Room → many Bans
 * 
 * CONSTRAINTS:
 * - Room owner cannot leave (must transfer first)
 * - At least one owner per room
 * - Username must be alphanumeric + underscore
 * - Email must be valid format
 * 
 * TRIGGERS:
 * - Update room.updatedAt on any change
 * - Update user.lastSeenAt on activity
 * - Clean old messages based on retention policy
 * 
 * MOCKUP_ID: database-schema-v3
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  unique,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const categoryEnum = pgEnum('category', ['gaming', 'study', 'social', 'tech', 'other'])
export const roleEnum = pgEnum('role', ['owner', 'moderator', 'member'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'system'])
export const attachmentTypeEnum = pgEnum('attachment_type', ['image', 'file'])
export const retentionEnum = pgEnum('retention', ['forever', '30days', '7days'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 20 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  bio: varchar('bio', { length: 200 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  usernameIdx: index('users_username_idx').on(table.username),
}))

// Rooms table
export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 200 }),
  category: categoryEnum('category').default('other').notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  imageUrl: text('image_url'),
  maxMembers: integer('max_members').default(100).notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  messageRetention: retentionEnum('message_retention').default('forever').notNull(),
}, (table) => ({
  publicCategoryIdx: index('rooms_public_category_idx').on(table.isPublic, table.category),
}))

// Room members table
export const roomMembers = pgTable('room_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: roleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  mutedUntil: timestamp('muted_until'),
}, (table) => ({
  roomUserUnique: unique().on(table.roomId, table.userId),
  roomIdIdx: index('room_members_room_id_idx').on(table.roomId),
  userIdIdx: index('room_members_user_id_idx').on(table.userId),
}))

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
  replyToId: uuid('reply_to_id'),
}, (table) => ({
  roomCreatedAtIdx: index('messages_room_created_at_idx').on(table.roomId, table.createdAt),
  userIdIdx: index('messages_user_id_idx').on(table.userId),
}))

// Message reactions table
export const messageReactions = pgTable('message_reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  messageUserEmojiUnique: unique().on(table.messageId, table.userId, table.emoji),
  messageIdIdx: index('reactions_message_id_idx').on(table.messageId),
}))

// Attachments table
export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }).notNull(),
  type: attachmentTypeEnum('type').notNull(),
  url: text('url').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Room bans table
export const roomBans = pgTable('room_bans', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bannedBy: uuid('banned_by').references(() => users.id).notNull(),
  reason: text('reason'),
  bannedAt: timestamp('banned_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedRooms: many(rooms),
  memberships: many(roomMembers),
  messages: many(messages),
  reactions: many(messageReactions),
  bans: many(roomBans),
}))

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  owner: one(users, {
    fields: [rooms.ownerId],
    references: [users.id],
  }),
  members: many(roomMembers),
  messages: many(messages),
  bans: many(roomBans),
}))

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  reactions: many(messageReactions),
  attachments: many(attachments),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
}))

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}))

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}))

export const roomBansRelations = relations(roomBans, ({ one }) => ({
  room: one(rooms, {
    fields: [roomBans.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomBans.userId],
    references: [users.id],
  }),
  bannedByUser: one(users, {
    fields: [roomBans.bannedBy],
    references: [users.id],
  }),
}))