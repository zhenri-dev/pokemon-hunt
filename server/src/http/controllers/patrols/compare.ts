import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod/v4'
import { db } from '../../../database/client.ts'
import { config } from '../../../config.ts'

export async function compare(request: FastifyRequest, reply: FastifyReply) {
  const compareBodySchema = z.object({
    patrolId1: z.string(),
    patrolId2: z.string(),
  })

  const { patrolId1, patrolId2 } = compareBodySchema.parse(request.body)

  if (patrolId1 === patrolId2) {
    return reply.status(400).send({ message: 'Patrol ids must differ.' })
  }

  const patrol1 = await db.query.users.findFirst({
    columns: {
      name: true,
    },
    where: (fields, { eq }) => eq(fields.id, patrolId1),
  })

  if (!patrol1) {
    return reply
      .status(200)
      .send({ result: `Patrulha 1 (${patrolId1}) não encontrada.` })
  }

  const patrol2 = await db.query.users.findFirst({
    columns: {
      name: true,
    },
    where: (fields, { eq }) => eq(fields.id, patrolId2),
  })

  if (!patrol2) {
    return reply
      .status(200)
      .send({ result: `Patrulha 2 (${patrolId2}) não encontrada.` })
  }

  const [captures1, captures2] = await Promise.all([
    db.query.captures.findMany({
      where: (fields, { eq, and }) =>
        and(eq(fields.patrolId, patrolId1), eq(fields.status, 'approved')),
    }),
    db.query.captures.findMany({
      where: (fields, { eq, and }) =>
        and(eq(fields.patrolId, patrolId2), eq(fields.status, 'approved')),
    }),
  ])

  if (captures1.length === 0 || captures2.length === 0) {
    return {
      result:
        'Uma das patrulhas não possui capturas válidas para a comparação.',
    }
  }

  const pokemonNames1 = captures1.map((item) =>
    item.pokemonName.toLocaleLowerCase(),
  )
  const pokemonNames2 = captures2.map((item) =>
    item.pokemonName.toLocaleLowerCase(),
  )

  const inBoth = pokemonNames1.filter((item) => pokemonNames2.includes(item))
  const onlyIn1 = pokemonNames1.filter((item) => !pokemonNames2.includes(item))
  const onlyIn2 = pokemonNames2.filter((item) => !pokemonNames1.includes(item))
  const exclusive = [...onlyIn1, ...onlyIn2]

  let points1 = captures1.length * 10
  let points2 = captures2.length * 10

  inBoth.forEach((pokemonName) => {
    const capture1 = captures1.find((item) => item.pokemonName === pokemonName)
    const capture2 = captures2.find((item) => item.pokemonName === pokemonName)

    if (!capture1 || !capture2) return

    if (capture1?.createdAt < capture2?.createdAt) {
      points1 = points1 + config.pointing.first
    } else {
      points2 = points2 + config.pointing.first
    }
  })

  exclusive.forEach((pokemonName) => {
    const capture1 = captures1.find((item) => item.pokemonName === pokemonName)

    if (capture1) {
      points1 = points1 + config.pointing.unique
    } else {
      points2 = points2 + config.pointing.unique
    }
  })

  let result =
    points1 > points2
      ? `Patrulha 1 (${patrol1.name}) ganhou.`
      : `Patrulha 2 (${patrol1.name}) ganhou.`

  if (points1 === points2) {
    result = 'Empate.'
  }

  return {
    result,
    statistics: {
      patrol1: {
        name: patrol1.name,
        captures: captures1.length,
        points: points1,
      },
      patrol2: {
        name: patrol2.name,
        captures: captures2.length,
        points: points2,
      },
      difference: Math.abs(points1 - points2),
    },
  }
}
