import type { FastifyInstance } from 'fastify';

/**
 * Liveness/readiness endpoints. Kept dependency-free so the API reports healthy
 * the moment the process is up, independent of downstream services.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const startedAt = Date.now();

  app.get('/health', async () => ({
    status: 'ok',
    service: 'forgestack-api',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  }));

  // Readiness will grow to check Postgres/Redis once those are wired in.
  app.get('/ready', async () => ({ status: 'ready' }));
}
