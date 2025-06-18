import 'dotenv/config'

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifyStatic } from '@fastify/static'
import { z, ZodError } from 'zod/v4'
import { env } from '../env.ts'

import { usersRoutes } from './controllers/users/routes.ts'
import { capturesRoutes } from './controllers/captures/routes.ts'
import { uploadRoute } from './controllers/upload.ts'
import { patrolsRoutes } from './controllers/patrols/routes.ts'

import path from 'node:path'

const app = fastify()

app.register(fastifyCors, {
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  origin: '*',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET_KEY,
  sign: {
    expiresIn: '12h',
  },
})

app.register(fastifyMultipart)
app.register(fastifyStatic, {
  root: path.resolve(__dirname, '../../uploads'),
  prefix: '/uploads',
})

app.get('/health', () => {
  return 'OK'
})

app.register(usersRoutes)
app.register(capturesRoutes)
app.register(uploadRoute)
app.register(patrolsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ title: 'Validation error.', message: z.prettifyError(error) })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Here we should log to a external observability tool
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

app.listen({ host: '0.0.0.0', port: env.PORT }).then(() => {
  console.log('🔥 HTTP Server running!')
})
