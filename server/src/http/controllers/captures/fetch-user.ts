import type { FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'

export async function fetchUser(request: FastifyRequest) {
  const pageQueryParamSchema = z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform(Number)
      .pipe(z.number().min(1)),
    order_by: z.enum(['desc', 'asc']).optional().default('desc'),
  })

  const { page, order_by: orderBy } = pageQueryParamSchema.parse(request.query)

  const userId = request.user.sub

  const captures = await db.query.captures.findMany({
    where: (fields, { eq }) => eq(fields.patrolId, userId),
    orderBy: (fields, { desc, asc }) => [
      orderBy === 'asc' ? asc(fields.createdAt) : desc(fields.createdAt),
    ],
    limit: 5,
    offset: (page - 1) * 5,
  })

  return { captures }
}
