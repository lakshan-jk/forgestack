import type { FastifyInstance, FastifyRequest } from 'fastify';
import { TelemetryBatch } from '@forgestack/telemetry';
import { metrics } from '../../lib/metrics.js';
import { env } from '../../config/env.js';

/**
 * Telemetry collector + metrics reader.
 *
 *   POST /api/telemetry   receive anonymous event batches (from any install)
 *   GET  /api/metrics     aggregate usage snapshot — admin only when a
 *                         METRICS_TOKEN is configured (drives the dashboard)
 */
export async function telemetryRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/telemetry', async (request, reply) => {
    const { events } = TelemetryBatch.parse(request.body);
    for (const event of events) metrics.record(event);
    return reply.code(204).send();
  });

  app.get('/api/metrics', async (request, reply) => {
    if (!isAuthorized(request)) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    return metrics.snapshot();
  });
}

/**
 * Metrics are readable only with the shared token. If no token is configured
 * (local dev), the endpoint is open — production sets METRICS_TOKEN.
 */
function isAuthorized(request: FastifyRequest): boolean {
  if (!env.METRICS_TOKEN) return true;
  const header = request.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const provided = bearer ?? (request.headers['x-metrics-token'] as string | undefined);
  return provided === env.METRICS_TOKEN;
}
