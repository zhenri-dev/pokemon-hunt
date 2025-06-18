import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../middlewares/verify-jwt.ts'
import { z } from 'zod/v4'
import { extname, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { db } from '../../database/client.ts'
import { schema } from '../../database/schema/index.ts'
import { eq } from 'drizzle-orm'

const pump = promisify(pipeline)

export async function uploadRoute(app: FastifyInstance) {
  app.post('/upload', { onRequest: [verifyJwt] }, async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 33_554_432, // 32 mb
      },
    })

    if (!upload) {
      return reply.status(400).send({ message: 'File missing.' })
    }

    const mimeTypeRegex = /^(image)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.status(400).send({ message: 'Invalid file type.' })
    }

    const uploadBodySchema = z.object({
      uploadId: z
        .object({
          value: z.string(),
        })
        .transform((value) => value.value),
    })

    const { uploadId } = uploadBodySchema.parse(upload.fields)

    const captureWithUploadId = await db.query.captures.findFirst({
      where: (fields, { eq }) => eq(fields.id, uploadId),
    })

    const extension = extname(upload.filename)

    if (!captureWithUploadId) {
      return reply
        .status(400)
        .send({ message: 'No reason for uploading found.' })
    } else {
      await db
        .update(schema.captures)
        .set({ imageFileType: extension })
        .where(eq(schema.captures.id, captureWithUploadId.id))
    }

    const fileName = uploadId.concat(extension)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', fileName),
    )

    await pump(upload.file, writeStream)

    const endpoint = request.protocol
      .concat('://')
      .concat(request.hostname)
      .concat(':')
      .concat(request.port.toString())
    const fileUrl = new URL(`/uploads/${fileName}`, endpoint).toString()

    return reply.status(201).send({ fileUrl })
  })
}
