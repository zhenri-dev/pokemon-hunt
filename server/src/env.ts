import { z } from 'zod/v4'

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET_KEY: z.string(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error(z.prettifyError(_env.error))

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
