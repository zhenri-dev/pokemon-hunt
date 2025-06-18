import type { FastifyInstance } from 'fastify'
import { create } from './create.ts'
import { fetchUser } from './fetch-user.ts'
import { fetchAll } from './fetch-all.ts'
import { updateStatus } from './update-status.ts'
import { verifyJwt } from '../../middlewares/verify-jwt.ts'
import { verifyUserRole } from '../../middlewares/verify-user-role.ts'

export async function capturesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/captures', create)
  app.get('/captures', fetchUser)

  app.get('/captures/all', { onRequest: verifyUserRole('manager') }, fetchAll)
  app.patch(
    '/captures/:captureId/status',
    { onRequest: verifyUserRole('manager') },
    updateStatus,
  )
}
