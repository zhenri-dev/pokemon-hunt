import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'
import { schema } from '../../../database/schema/index.ts'
import { hash } from 'bcryptjs'
import { generateRandomId } from '../../../utils/generate-random-id.ts'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    phone: z
      .string()
      .refine((value) => /^[\d\s()+-]+$/.test(value), {
        message: 'Telefone contém caracteres inválidos',
      })
      .transform((value) => value.replace(/\D/g, '')),
    password: z.string().min(6),
  })

  const { name, phone, password } = registerBodySchema.parse(request.body)

  const userWithSamePhone = await db.query.users.findFirst({
    where: (fields, { eq }) => eq(fields.phone, phone),
  })

  if (userWithSamePhone) {
    return reply
      .status(409)
      .send({ message: 'User with same phone already exists.' })
  }

  const passwordHash = await hash(password, 8)

  const [user] = await db
    .insert(schema.users)
    .values({
      id: generateRandomId(),
      name,
      phone,
      password: passwordHash,
    })
    .returning()

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

  return reply.status(201).send({ token })
}
