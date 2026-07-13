import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resolveModules } from '@forgestack/generator';
import { registry } from '../../lib/generator.js';
import { advisor, ensureIndexed, embeddingsProviderId } from '../../lib/advisor.js';

const advisorBody = z.object({
  prompt: z.string().min(1).max(500),
  topK: z.number().int().min(1).max(12).optional(),
});

/**
 * The Stack Advisor: natural language → suggested modules → coherent stack.
 *
 * It only *ranks* modules semantically, then defers to the generator's resolver
 * to expand dependencies — one source of truth for what makes a valid stack.
 */
export async function advisorRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/advisor', async (request) => {
    const { prompt, topK } = advisorBody.parse(request.body);

    await ensureIndexed();
    const suggestions = await advisor.suggest(prompt, { topK: topK ?? 5, minScore: 0.1 });

    const suggested = suggestions
      .map((s) => {
        const module = registry.get(s.id);
        if (!module) return null;
        return { id: s.id, name: module.name, category: module.category, score: s.score };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Expand the picks into a dependency-complete, ordered stack.
    let resolvedStack: string[] = [];
    if (suggested.length > 0) {
      const { ordered } = resolveModules(
        suggested.map((s) => s.id),
        registry,
      );
      resolvedStack = ordered.map((o) => o.module.id);
    }

    return { prompt, provider: embeddingsProviderId, suggested, resolvedStack };
  });
}
