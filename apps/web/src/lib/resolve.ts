import type { ApiModule } from './api';

/**
 * Client-side mirror of the engine's dependency expansion, used purely for
 * live UI preview ("selecting MongoDB will also include Fastify, TypeScript").
 * The server remains the source of truth — this is a UX nicety, not validation.
 */
export function expandSelection(selected: Set<string>, modules: ApiModule[]): Set<string> {
  const byId = new Map(modules.map((m) => [m.id, m]));
  const included = new Set<string>();
  const queue = [...selected];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (included.has(id)) continue;
    included.add(id);
    const mod = byId.get(id);
    if (mod) for (const dep of mod.dependsOn) if (!included.has(dep)) queue.push(dep);
  }

  return included;
}
