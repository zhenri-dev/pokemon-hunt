import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      role: 'manager' | 'patrol'
      sub: string
    }
  }
}
