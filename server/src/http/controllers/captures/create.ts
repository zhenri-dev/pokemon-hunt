import type { FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'
import { schema } from '../../../database/schema/index.ts'

export async function create(request: FastifyRequest) {
  const createCaptureBodySchema = z.object({
    pokemonName: z.string(),
    location: z.string(),
    description: z.string().optional(),
    element1: z.string(),
    element2: z.string().optional(),
    imageFileType: z
      .string()
      .optional()
      .default('.png')
      .refine((value) => value.startsWith('.'))
      .transform((value) => value.toLowerCase()),
  })

  const {
    pokemonName,
    location,
    description,
    element1,
    element2,
    imageFileType,
  } = createCaptureBodySchema.parse(request.body)

  const userId = request.user.sub

  const [patrol] = await db
    .insert(schema.captures)
    .values({
      patrolId: userId,
      pokemonName,
      location,
      description,
      element1,
      element2,
      imageFileType,
    })
    .returning()

  return { id: patrol.id }
}
