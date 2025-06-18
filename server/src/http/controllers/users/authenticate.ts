import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'
import { compare } from 'bcryptjs'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    phone: z.string().transform((value) => value.replace(/\D/g, '')),
    password: z.string(),
  })

  const { phone, password } = authenticateBodySchema.parse(request.body)

  const user = await db.query.users.findFirst({
    where: (fields, { eq }) => eq(fields.phone, phone),
  })

  if (!user) {
    return reply.status(401).send({ message: 'Invalid credentials.' })
  }

  const doesPasswordMatches = await compare(password, user.password)

  if (!doesPasswordMatches) {
    return reply.status(401).send({ message: 'Invalid credentials.' })
  }

  const token = await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: {
        sub: user.id,
      },
    },
  )

  return reply.status(200).send({ token })
}
