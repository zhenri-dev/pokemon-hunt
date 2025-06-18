import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../../database/client.ts'
import { schema } from '../../../database/schema/index.ts'

export async function getLeaderboard() {
  const data = await db
    .select({
      patrol: {
        id: schema.captures.patrolId,
        name: schema.users.name,
      },
      count: sql<number>`count(*)`,
    })
    .from(schema.captures)
    .where(eq(schema.captures.status, 'approved'))
    .innerJoin(schema.users, eq(schema.users.id, schema.captures.patrolId))
    .groupBy(schema.captures.patrolId, schema.users.name)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10)

  const leaders = [...data, ...Array(10 - data.length).fill(null)]

  return Object.fromEntries(leaders.map((value, index) => [index + 1, value]))
}
