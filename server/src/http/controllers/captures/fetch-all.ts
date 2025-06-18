import type { FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'

export async function fetchAll(request: FastifyRequest) {
  const pageQueryParamSchema = z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform(Number)
      .pipe(z.number().min(1)),
    order_by: z.enum(['desc', 'asc']).optional().default('asc'),
    status: z
      .enum(['pending', 'approved', 'denied'])
      .optional()
      .default('pending'),
    patrol_id: z.string().optional(),
  })

  const {
    page,
    order_by: orderBy,
    status,
    patrol_id: patrolId,
  } = pageQueryParamSchema.parse(request.query)

  const captures = await db.query.captures.findMany({
    where: (fields, { and, eq }) =>
      patrolId
        ? and(eq(fields.patrolId, patrolId), eq(fields.status, status))
        : and(eq(fields.status, status)),
    orderBy: (fields, { desc, asc }) => [
      orderBy === 'desc' ? desc(fields.createdAt) : asc(fields.createdAt),
    ],
    limit: 5,
    offset: (page - 1) * 5,
  })

  return { captures }
}
