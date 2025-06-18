import { pgTable, pgEnum, text, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.ts'
import { generateRandomId } from '../../utils/generate-random-id.ts'

export const captureStatusEnum = pgEnum('capture_status', [
  'pending',
  'approved',
  'denied',
])

export const captures = pgTable('captures', {
  id: text()
    .$defaultFn(() => generateRandomId())
    .primaryKey(),
  patrolId: text()
    .notNull()
    .references(() => users.id),
  pokemonName: text().notNull(),
  location: text().notNull(),
  description: text(),
  element1: varchar().notNull(),
  element2: varchar(),
  imageFileType: varchar(),
  status: captureStatusEnum().notNull().default('pending'),
  processedById: text(),
  processedByName: text(),
  createdAt: timestamp().notNull().defaultNow(),
})
