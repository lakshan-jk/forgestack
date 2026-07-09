import type { ModuleDefinition } from '@forgestack/shared';
import type { ModuleRegistry } from './registry.js';
import {
  DependencyCycleError,
  ModuleConflictError,
  UnknownModuleError,
} from './errors.js';

export interface ResolvedModule {
  module: ModuleDefinition;
  /** True when the user selected it directly; false when pulled in as a dependency. */
  requestedDirectly: boolean;
}

export interface ResolveResult {
  /** Modules in topological order: every module appears after its dependencies. */
  ordered: ResolvedModule[];
  /** Ids that were added automatically to satisfy `dependsOn`. */
  autoIncluded: string[];
}

/**
 * Expand the requested module set with transitive dependencies, verify there
 * are no conflicts, and return the modules in a valid application order.
 *
 * Ordering matters: the Composer applies modules in this order so that, e.g.,
 * the Fastify core writes `server.ts` before the JWT module augments it, and
 * `package.json` fragments merge deterministically.
 */
export function resolveModules(
  requestedIds: readonly string[],
  registry: ModuleRegistry,
): ResolveResult {
  const requested = new Set(requestedIds);

  // 1. Expand transitive dependencies (BFS), failing on unknown ids.
  const included = new Set<string>();
  const queue: Array<{ id: string; requiredBy?: string }> = requestedIds.map((id) => ({ id }));

  while (queue.length > 0) {
    const { id, requiredBy } = queue.shift()!;
    if (included.has(id)) continue;

    const mod = registry.get(id);
    if (!mod) throw new UnknownModuleError(id, requiredBy);

    included.add(id);
    for (const dep of mod.dependsOn) {
      if (!included.has(dep)) queue.push({ id: dep, requiredBy: id });
    }
  }

  // 2. Conflict detection across the fully expanded set.
  for (const id of included) {
    const mod = registry.require(id);
    for (const other of mod.conflictsWith) {
      if (included.has(other)) {
        // Normalise pair order so the message is stable regardless of iteration order.
        const [a, b] = [id, other].sort();
        throw new ModuleConflictError(a!, b!);
      }
    }
  }

  // 3. Topological sort (DFS) with cycle detection.
  //    Edge direction: dependency → dependent, so dependencies come first.
  const ordered: ModuleDefinition[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];

  const visit = (id: string): void => {
    const s = state.get(id);
    if (s === 'done') return;
    if (s === 'visiting') {
      const cycleStart = stack.indexOf(id);
      throw new DependencyCycleError([...stack.slice(cycleStart), id]);
    }

    state.set(id, 'visiting');
    stack.push(id);

    const mod = registry.require(id);
    // Sort dependencies for deterministic output across runs.
    for (const dep of [...mod.dependsOn].sort()) visit(dep);

    stack.pop();
    state.set(id, 'done');
    ordered.push(mod);
  };

  // Visit in a stable order so unrelated modules keep a deterministic sequence.
  for (const id of [...included].sort()) visit(id);

  const autoIncluded = [...included].filter((id) => !requested.has(id)).sort();

  return {
    ordered: ordered.map((module) => ({
      module,
      requestedDirectly: requested.has(module.id),
    })),
    autoIncluded,
  };
}
