import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env, corsOrigins } from './config/env.js';
import { healthRoutes } from './modules/health/health.route.js';

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
  });

  await app.register(helmet);
  await app.register(cors, { origin: corsOrigins, credentials: true });

  await app.register(healthRoutes);

  app.get('/', async () => ({
    name: 'ForgeStack API',
    version: '0.1.0',
    docs: '/health',
  }));

  return app;
}
