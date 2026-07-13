import Fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { ZodError } from 'zod';
import { GeneratorError } from '@forgestack/generator';
import { env, corsOrigins } from './config/env.js';
import { healthRoutes } from './modules/health/health.route.js';
import { generateRoutes } from './modules/generate/generate.route.js';
import { advisorRoutes } from './modules/advisor/advisor.route.js';
import { telemetryRoutes } from './modules/telemetry/telemetry.route.js';

/**
 * Builds the Fastify instance. Kept separate from `server.ts` so tests can
 * construct an app without binding a port.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
    // ZIP downloads can exceed the 1 MB default; allow larger request bodies too.
    bodyLimit: 5 * 1024 * 1024,
  });

  await app.register(helmet);
  await app.register(cors, { origin: corsOrigins.includes('*') ? true : corsOrigins, credentials: true });

  // Centralised error handling: turn known errors into clean 4xx responses.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'ValidationError', issues: error.issues });
    }
    if (error instanceof GeneratorError) {
      return reply.code(400).send({ error: error.code, message: error.message });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ error: error.name, message: error.message });
    }
    request.log.error(error);
    return reply.code(500).send({ error: 'InternalServerError' });
  });

  await app.register(healthRoutes);
  await app.register(generateRoutes);
  await app.register(advisorRoutes);
  await app.register(telemetryRoutes);

  app.get('/', async () => ({
    name: 'ForgeStack API',
    version: '0.1.0',
    endpoints: [
      'GET /health',
      'GET /api/modules',
      'POST /api/generate',
      'POST /api/advisor',
      'GET /api/metrics',
    ],
  }));

  return app;
}
