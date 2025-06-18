import type { FastifyInstance } from 'fastify'
import { register } from './register.ts'
import { authenticate } from './authenticate.ts'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/auth/register', register)
  app.post('/auth/login', authenticate)
}
