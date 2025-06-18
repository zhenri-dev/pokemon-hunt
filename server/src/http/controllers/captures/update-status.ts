import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'
import { schema } from '../../../database/schema/index.ts'
import { eq } from 'drizzle-orm'

export async function updateStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateStatusParamsSchema = z.object({
    captureId: z.string(),
  })

  const { captureId } = updateStatusParamsSchema.parse(request.params)

  const updateStatusBodySchema = z.object({
    status: z.enum(['approved', 'denied']),
  })

  const { status } = updateStatusBodySchema.parse(request.body)

  const capture = await db.query.captures.findFirst({
    where: (fields, { eq }) => eq(fields.id, captureId),
  })

  if (!capture) {
    return reply.status(404).send({ message: 'Resource not found.' })
  }

  if (capture.status !== 'pending') {
    return reply
      .status(400)
      .send({ message: 'This capture was already processed.' })
  }

  const userId = request.user.sub

  const user = await db.query.users.findFirst({
    columns: {
      name: true,
    },
    where: (fields, { eq }) => eq(fields.id, userId),
  })

  await db
    .update(schema.captures)
    .set({ status, processedById: userId, processedByName: user?.name })
    .where(eq(schema.captures.id, captureId))

  return reply.status(204).send()
}
