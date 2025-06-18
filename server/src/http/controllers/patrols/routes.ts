import type { FastifyInstance } from 'fastify'
import { getLeaderboard } from './get-leaderboard.ts'
import { compare } from './compare.ts'
import { verifyJwt } from '../../middlewares/verify-jwt.ts'
import { verifyUserRole } from '../../middlewares/verify-user-role.ts'

export async function patrolsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get(
    '/patrols/leaderboard',
    { onRequest: verifyUserRole('manager') },
    getLeaderboard,
  )

  app.post(
    '/patrols/compare',
    { onRequest: verifyUserRole('manager') },
    compare,
  )
}
