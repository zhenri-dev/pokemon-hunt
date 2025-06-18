import { pgTable, pgEnum, text, varchar, timestamp } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['manager', 'patrol'])

export const users = pgTable('users', {
  id: text().primaryKey(),
  name: text().notNull(),
  phone: varchar({ length: 20 }).notNull().unique(),
  password: text().notNull(),
  role: userRoleEnum().notNull().default('patrol'),
  createdAt: timestamp().notNull().defaultNow(),
})
